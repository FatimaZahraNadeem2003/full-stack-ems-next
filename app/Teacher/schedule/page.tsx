"use client";

import React, { useState, useEffect, useRef } from "react";
import http from "@/services/http";
import toast from "react-hot-toast";
import { Calendar, Clock, MapPin, Printer, Edit2, Save, X } from "lucide-react";

interface Schedule {
  _id: string;
  courseId: {
    name: string;
    code: string;
    credits: number;
  };
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  room: string;
  building?: string;
  status: string;
}

const TeacherSchedulePage = () => {
  const [schedule, setSchedule] = useState<Record<string, Schedule[]>>({});
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    room: "",
    status: "",
  });
  const printRef = useRef<HTMLDivElement>(null);

  const daysOfWeek = [
    "monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"
  ];

  const dayNames: Record<string, string> = {
    monday: "Monday",
    tuesday: "Tuesday",
    wednesday: "Wednesday",
    thursday: "Thursday",
    friday: "Friday",
    saturday: "Saturday",
    sunday: "Sunday",
  };

  useEffect(() => {
    fetchSchedule();
  }, []);

  const fetchSchedule = async () => {
    try {
      setLoading(true);
      const response = await http.get("/teacher/schedules");
      console.log("Schedule response:", response.data);
      setSchedule(response.data.data);
    } catch (error) {
      console.error("Error fetching schedule:", error);
      toast.error("Failed to load schedule");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (schedule: Schedule) => {
    setEditingId(schedule._id);
    setEditForm({
      room: schedule.room,
      status: schedule.status,
    });
  };

  const handleUpdate = async (id: string) => {
    try {
      await http.put(`/teacher/schedules/${id}`, editForm);
      toast.success("Schedule updated successfully");
      setEditingId(null);
      fetchSchedule();
    } catch (error) {
      console.error("Error updating schedule:", error);
      toast.error("Failed to update schedule");
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error("Popup blocker detected. Please allow popups for this site.");
      return;
    }

    const currentDate = new Date();
    const formattedDate = currentDate.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });

    let totalClasses = 0;
    let scheduledCount = 0;
    let completedCount = 0;
    let cancelledCount = 0;

    daysOfWeek.forEach(day => {
      const dayClasses = schedule[day] || [];
      totalClasses += dayClasses.length;
      dayClasses.forEach(cls => {
        if (cls.status === 'scheduled') scheduledCount++;
        else if (cls.status === 'completed') completedCount++;
        else if (cls.status === 'cancelled') cancelledCount++;
      });
    });

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Teacher Schedule - ${formattedDate}</title>
          <style>
            @page {
              size: landscape;
              margin: 1cm;
            }
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 20px;
              background: white;
              color: black;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              padding-bottom: 20px;
              border-bottom: 2px solid #333;
            }
            .header h1 {
              margin: 0;
              font-size: 28px;
              color: #333;
            }
            .header p {
              margin: 5px 0;
              color: #666;
              font-size: 16px;
            }
            .stats-container {
              display: grid;
              grid-template-columns: repeat(4, 1fr);
              gap: 15px;
              margin-bottom: 30px;
            }
            .stat-card {
              background: #f5f5f5;
              padding: 15px;
              border-radius: 8px;
              text-align: center;
              border: 1px solid #ddd;
            }
            .stat-card .label {
              font-size: 14px;
              color: #666;
              margin-bottom: 5px;
            }
            .stat-card .value {
              font-size: 24px;
              font-weight: bold;
              color: #333;
            }
            .schedule-grid {
              display: grid;
              grid-template-columns: repeat(7, 1fr);
              gap: 10px;
              margin-top: 20px;
            }
            .day-column {
              background: #f9f9f9;
              border: 1px solid #ddd;
              border-radius: 8px;
              overflow: hidden;
            }
            .day-header {
              background: #4a90e2;
              color: white;
              padding: 10px;
              text-align: center;
              font-weight: bold;
              font-size: 16px;
            }
            .class-item {
              padding: 10px;
              border-bottom: 1px solid #eee;
              font-size: 12px;
            }
            .class-item:last-child {
              border-bottom: none;
            }
            .class-time {
              font-weight: bold;
              color: #4a90e2;
              margin-bottom: 5px;
            }
            .class-name {
              font-weight: bold;
              margin-bottom: 3px;
            }
            .class-code {
              color: #666;
              font-size: 11px;
              margin-bottom: 3px;
            }
            .class-room {
              color: #888;
              font-size: 11px;
              margin-bottom: 3px;
            }
            .status-badge {
              display: inline-block;
              padding: 2px 8px;
              border-radius: 12px;
              font-size: 10px;
              font-weight: bold;
              text-transform: uppercase;
            }
            .status-scheduled { background: #4caf50; color: white; }
            .status-completed { background: #2196f3; color: white; }
            .status-cancelled { background: #f44336; color: white; }
            .no-classes {
              padding: 20px;
              text-align: center;
              color: #999;
              font-style: italic;
            }
            .footer {
              margin-top: 30px;
              text-align: center;
              color: #666;
              font-size: 12px;
              border-top: 1px solid #ddd;
              padding-top: 20px;
            }
            @media print {
              .no-print { display: none; }
              body { background: white; }
              .stat-card { break-inside: avoid; }
              .day-column { break-inside: avoid; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Teacher Weekly Schedule</h1>
            <p>Generated on: ${formattedDate}</p>
          </div>

          <div class="stats-container">
            <div class="stat-card">
              <div class="label">Total Classes</div>
              <div class="value">${totalClasses}</div>
            </div>
            <div class="stat-card">
              <div class="label">Scheduled</div>
              <div class="value">${scheduledCount}</div>
            </div>
            <div class="stat-card">
              <div class="label">Completed</div>
              <div class="value">${completedCount}</div>
            </div>
            <div class="stat-card">
              <div class="label">Cancelled</div>
              <div class="value">${cancelledCount}</div>
            </div>
          </div>

          <div class="schedule-grid">
            ${daysOfWeek.map(day => {
              const dayClasses = schedule[day] || [];
              return `
                <div class="day-column">
                  <div class="day-header">${dayNames[day]}</div>
                  ${dayClasses.length > 0 ? dayClasses.map(cls => {
                    const statusClass = cls.status === 'scheduled' ? 'status-scheduled' :
                                        cls.status === 'completed' ? 'status-completed' :
                                        'status-cancelled';
                    return `
                      <div class="class-item">
                        <div class="class-time">${cls.startTime} - ${cls.endTime}</div>
                        <div class="class-name">${cls.courseId?.name || 'N/A'}</div>
                        <div class="class-code">${cls.courseId?.code || 'N/A'}</div>
                        <div class="class-room">Room: ${cls.room} ${cls.building ? `- ${cls.building}` : ''}</div>
                        <div><span class="status-badge ${statusClass}">${cls.status}</span></div>
                      </div>
                    `;
                  }).join('') : '<div class="no-classes">No classes</div>'}
                </div>
              `;
            }).join('')}
          </div>

          <div class="footer">
            <p>This is an official schedule generated by the Education Management System.</p>
            <p>For any queries, please contact the administration.</p>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      scheduled: "bg-green-600 text-white",
      cancelled: "bg-red-600 text-white",
      completed: "bg-blue-600 text-white",
    };
    return colors[status as keyof typeof colors] || "bg-gray-600 text-white";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-400"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">My Schedule</h1>
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-lg text-white hover:from-blue-500 hover:to-indigo-600 transition-colors font-bold"
        >
          <Printer className="w-4 h-4" />
          PRINT SCHEDULE
        </button>
      </div>

      <div ref={printRef} className="grid grid-cols-1 md:grid-cols-7 gap-4">
        {daysOfWeek.map((day) => (
          <div
            key={day}
            className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 overflow-hidden"
          >
            <div className="p-3 bg-white/5 border-b border-white/20">
              <h3 className="text-white font-bold capitalize text-center">{dayNames[day]}</h3>
            </div>

            <div className="p-3 space-y-3 min-h-[300px]">
              {schedule[day]?.map((cls) => (
                <div
                  key={cls._id}
                  className="p-3 bg-white/5 rounded-lg border border-white/10 hover:border-white/30 transition-colors"
                >
                  {editingId === cls._id ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={editForm.room}
                        onChange={(e) => setEditForm({ ...editForm, room: e.target.value })}
                        placeholder="Room"
                        className="w-full px-2 py-1 bg-white/10 border border-white/20 rounded text-white/90 text-sm font-semibold"
                      />
                      <select
                        value={editForm.status}
                        onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                        className="w-full px-2 py-1 bg-white/10 border border-white/20 rounded text-white/90 text-sm font-semibold"
                      >
                        <option value="scheduled" className="bg-gray-800 text-white">SCHEDULED</option>
                        <option value="cancelled" className="bg-gray-800 text-white">CANCELLED</option>
                        <option value="completed" className="bg-gray-800 text-white">COMPLETED</option>
                      </select>
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={() => handleUpdate(cls._id)}
                          className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-green-600 text-white rounded text-xs hover:bg-green-700 font-bold"
                        >
                          <Save className="w-3.5 h-3.5" /> SAVE
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-red-600 text-white rounded text-xs hover:bg-red-700 font-bold"
                        >
                          <X className="w-3.5 h-3.5" /> CANCEL
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="text-white font-bold text-sm">{cls.courseId?.name}</p>
                          <p className="text-white/80 text-xs font-semibold">{cls.courseId?.code}</p>
                        </div>
                        <button
                          onClick={() => handleEdit(cls)}
                          className="text-yellow-400 hover:text-yellow-300 font-bold"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      
                      <div className="space-y-1 text-xs">
                        <div className="flex items-center gap-1 text-white/80 font-semibold">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{cls.startTime} - {cls.endTime}</span>
                        </div>
                        <div className="flex items-center gap-1 text-white/80 font-semibold">
                          <MapPin className="w-3.5 h-3.5" />
                          <span>Room {cls.room} {cls.building && `- ${cls.building}`}</span>
                        </div>
                      </div>

                      <div className="mt-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${getStatusBadge(cls.status)}`}>
                          {cls.status.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {(!schedule[day] || schedule[day].length === 0) && (
                <div className="text-center text-white/60 text-sm py-4 font-semibold">
                  NO CLASSES
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-4">
        <h3 className="text-white font-bold mb-3">STATUS LEGEND</h3>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-green-600"></span>
            <span className="text-white/90 text-sm font-bold">SCHEDULED</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-blue-600"></span>
            <span className="text-white/90 text-sm font-bold">COMPLETED</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-600"></span>
            <span className="text-white/90 text-sm font-bold">CANCELLED</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherSchedulePage;