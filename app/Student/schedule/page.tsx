"use client";

import React, { useState, useEffect } from "react";
import http from "@/services/http";
import toast from "react-hot-toast";
import { Calendar, Clock, MapPin, ChevronLeft, ChevronRight } from "lucide-react";

interface ScheduleItem {
  _id: string;
  courseId: {
    name: string;
    code: string;
    credits: number;
  };
  teacherId: {
    userId: {
      firstName: string;
      lastName: string;
    };
  };
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  room: string;
  building?: string;
  status: string;
}

interface ScheduleData {
  today: {
    day: string;
    date: string;
    classes: ScheduleItem[];
  };
  weekly: Record<string, ScheduleItem[]>;
}

const StudentSchedulePage = () => {
  const [schedule, setSchedule] = useState<ScheduleData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<string>("monday");
  const [currentWeek, setCurrentWeek] = useState(0);

  const daysOfWeek = [
    "monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"
  ];

  const dayNames = {
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
      const response = await http.get("/student/schedule");
      setSchedule(response.data);
      
      const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
      setSelectedDay(today);
    } catch (error: any) {
      console.error("Error fetching schedule:", error);
      toast.error(error.response?.data?.msg || "Failed to load schedule");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ongoing":
        return "border-l-4 border-green-400";
      case "upcoming":
        return "border-l-4 border-yellow-400";
      case "completed":
        return "border-l-4 border-gray-400 opacity-60";
      default:
        return "border-l-4 border-blue-400";
    }
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
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentWeek(prev => prev - 1)}
            className="p-2 bg-white/10 rounded-lg text-white hover:bg-white/20 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-white px-4 py-2 bg-white/10 rounded-lg">
            Week {currentWeek + 1}
          </span>
          <button
            onClick={() => setCurrentWeek(prev => prev + 1)}
            className="p-2 bg-white/10 rounded-lg text-white hover:bg-white/20 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {schedule?.today && schedule.today.classes.length > 0 && (
        <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-6">
          <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-yellow-400" />
            Today's Schedule - {schedule.today.date}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {schedule.today.classes.map((cls) => (
              <div
                key={cls._id}
                className={`p-4 bg-white/5 rounded-lg border border-white/10 ${getStatusColor(cls.status)}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-white font-medium">{cls.courseId?.name}</h3>
                  <span className="text-white/60 text-sm">{cls.courseId?.code}</span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-white/70">
                    <Clock className="w-4 h-4" />
                    <span>{cls.startTime} - {cls.endTime}</span>
                  </div>
                  <div className="flex items-center gap-2 text-white/70">
                    <MapPin className="w-4 h-4" />
                    <span>Room {cls.room} {cls.building && `- ${cls.building}`}</span>
                  </div>
                  <p className="text-white/60 text-xs">
                    Teacher: {cls.teacherId?.userId?.firstName} {cls.teacherId?.userId?.lastName}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-4">
        <div className="flex flex-wrap gap-2">
          {daysOfWeek.map((day) => (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`px-4 py-2 rounded-lg transition-all duration-300 capitalize ${
                selectedDay === day
                  ? "bg-gradient-to-r from-yellow-400 to-orange-400 text-white"
                  : "bg-white/10 text-white/80 hover:bg-white/20"
              }`}
            >
              {dayNames[day as keyof typeof dayNames]}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-6">
        <h2 className="text-white font-semibold mb-4 capitalize">
          {dayNames[selectedDay as keyof typeof dayNames]} Schedule
        </h2>
        <div className="space-y-4">
          {schedule?.weekly[selectedDay] && schedule.weekly[selectedDay].length > 0 ? (
            schedule.weekly[selectedDay]
              .sort((a, b) => a.startTime.localeCompare(b.startTime))
              .map((cls) => (
                <div
                  key={cls._id}
                  className="flex flex-col md:flex-row md:items-center md:justify-between p-4 bg-white/5 rounded-lg border border-white/10"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-white font-medium">{cls.courseId?.name}</h3>
                      <span className="text-white/60 text-sm">{cls.courseId?.code}</span>
                    </div>
                    <p className="text-white/60 text-sm">
                      Teacher: {cls.teacherId?.userId?.firstName} {cls.teacherId?.userId?.lastName}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-4 mt-2 md:mt-0">
                    <div className="flex items-center gap-1 text-white/70 text-sm">
                      <Clock className="w-4 h-4" />
                      <span>{cls.startTime} - {cls.endTime}</span>
                    </div>
                    <div className="flex items-center gap-1 text-white/70 text-sm">
                      <MapPin className="w-4 h-4" />
                      <span>Room {cls.room}</span>
                    </div>
                  </div>
                </div>
              ))
          ) : (
            <p className="text-white/60 text-center py-8">
              No classes scheduled for {dayNames[selectedDay as keyof typeof dayNames]}
            </p>
          )}
        </div>
      </div>

      <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-4">
        <h3 className="text-white font-medium mb-3">Status Legend</h3>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-l-4 border-green-400"></div>
            <span className="text-white/80 text-sm">Ongoing</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-l-4 border-yellow-400"></div>
            <span className="text-white/80 text-sm">Upcoming</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-l-4 border-gray-400"></div>
            <span className="text-white/80 text-sm">Completed</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentSchedulePage;