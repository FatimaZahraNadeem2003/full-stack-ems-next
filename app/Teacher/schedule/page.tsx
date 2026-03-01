"use client";

import React, { useState, useEffect } from "react";
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

  const daysOfWeek = [
    "monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"
  ];

  useEffect(() => {
    fetchSchedule();
  }, []);

  const fetchSchedule = async () => {
    try {
      setLoading(true);
      const response = await http.get("/teacher/schedules");
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
    window.print();
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      scheduled: "bg-green-500/20 text-green-400",
      cancelled: "bg-red-500/20 text-red-400",
      completed: "bg-blue-500/20 text-blue-400",
    };
    return colors[status as keyof typeof colors] || "bg-gray-500/20 text-gray-400";
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
          className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-lg text-white hover:bg-white/20 transition-colors"
        >
          <Printer className="w-4 h-4" />
          Print Schedule
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
        {daysOfWeek.map((day) => (
          <div
            key={day}
            className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 overflow-hidden"
          >
            <div className="p-3 bg-white/5 border-b border-white/20">
              <h3 className="text-white font-medium capitalize text-center">{day}</h3>
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
                        className="w-full px-2 py-1 bg-white/10 border border-white/20 rounded text-white text-sm"
                      />
                      <select
                        value={editForm.status}
                        onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                        className="w-full px-2 py-1 bg-white/10 border border-white/20 rounded text-white text-sm"
                      >
                        <option value="scheduled">Scheduled</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="completed">Completed</option>
                      </select>
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={() => handleUpdate(cls._id)}
                          className="flex-1 flex items-center justify-center gap-1 px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs hover:bg-green-500/30"
                        >
                          <Save className="w-3 h-3" /> Save
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="flex-1 flex items-center justify-center gap-1 px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs hover:bg-red-500/30"
                        >
                          <X className="w-3 h-3" /> Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="text-white font-medium text-sm">{cls.courseId?.name}</p>
                          <p className="text-white/60 text-xs">{cls.courseId?.code}</p>
                        </div>
                        <button
                          onClick={() => handleEdit(cls)}
                          className="text-yellow-400 hover:text-yellow-300"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                      </div>
                      
                      <div className="space-y-1 text-xs">
                        <div className="flex items-center gap-1 text-white/70">
                          <Clock className="w-3 h-3" />
                          <span>{cls.startTime} - {cls.endTime}</span>
                        </div>
                        <div className="flex items-center gap-1 text-white/70">
                          <MapPin className="w-3 h-3" />
                          <span>Room {cls.room} {cls.building && `- ${cls.building}`}</span>
                        </div>
                      </div>

                      <div className="mt-2">
                        <span className={`px-2 py-0.5 rounded-full text-xs ${getStatusBadge(cls.status)}`}>
                          {cls.status}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {(!schedule[day] || schedule[day].length === 0) && (
                <div className="text-center text-white/40 text-sm py-4">
                  No classes
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-4">
        <h3 className="text-white font-medium mb-3">Status Legend</h3>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-green-500/50"></span>
            <span className="text-white/80 text-sm">Scheduled</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-blue-500/50"></span>
            <span className="text-white/80 text-sm">Completed</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-500/50"></span>
            <span className="text-white/80 text-sm">Cancelled</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherSchedulePage;