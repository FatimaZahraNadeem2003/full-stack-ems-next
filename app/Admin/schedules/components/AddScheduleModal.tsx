"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState, useEffect } from "react";
import http from "@/services/http";
import toast from "react-hot-toast";
import { X } from "lucide-react";

interface AddScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface Course {
  _id: string;
  name: string;
  code: string;
  department: string;
  credits: number;
  status: string;
}

interface Teacher {
  _id: string;
  userId: {
    firstName: string;
    lastName: string;
  };
  specialization: string;
}

export default function AddScheduleModal({ isOpen, onClose, onSuccess }: AddScheduleModalProps) {
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [fetchingCourses, setFetchingCourses] = useState(false);
  const [fetchingTeachers, setFetchingTeachers] = useState(false);
  
  const [form, setForm] = useState({
    courseId: "",
    teacherId: "",
    dayOfWeek: "monday",
    startTime: "09:00",
    endTime: "10:30",
    room: "",
    building: "",
    semester: "",
    academicYear: "",
    isRecurring: true,
    status: "scheduled",
  });

  const daysOfWeek = [
    "monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"
  ];

  useEffect(() => {
    if (isOpen) {
      fetchCourses();
      fetchTeachers();
    }
  }, [isOpen]);

  const fetchCourses = async () => {
    try {
      setFetchingCourses(true);
      const response = await http.get("/admin/courses?limit=100");
      console.log("Courses response:", response.data);
      
      if (response.data.success && response.data.data) {
        setCourses(response.data.data);
        console.log("Courses loaded:", response.data.data.length);
      } else if (Array.isArray(response.data)) {
        setCourses(response.data);
      } else if (response.data.data && Array.isArray(response.data.data)) {
        setCourses(response.data.data);
      } else {
        setCourses([]);
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
      toast.error("Failed to load courses");
    } finally {
      setFetchingCourses(false);
    }
  };

  const fetchTeachers = async () => {
    try {
      setFetchingTeachers(true);
      const response = await http.get("/admin/teachers?status=active&limit=100");
      console.log("Teachers response:", response.data);
      
      if (response.data.success && response.data.data) {
        setTeachers(response.data.data);
      } else if (Array.isArray(response.data)) {
        setTeachers(response.data);
      } else if (response.data.data && Array.isArray(response.data.data)) {
        setTeachers(response.data.data);
      } else {
        setTeachers([]);
      }
    } catch (error) {
      console.error("Error fetching teachers:", error);
      toast.error("Failed to load teachers");
    } finally {
      setFetchingTeachers(false);
    }
  };

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setForm({ ...form, [name]: checked });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.courseId || !form.teacherId || !form.room || !form.semester || !form.academicYear) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setLoading(true);
      await http.post("/admin/schedules", form);
      toast.success("Schedule added successfully");
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Error adding schedule:", error);
      toast.error(error.response?.data?.msg || "Failed to add schedule");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="relative w-full max-w-2xl bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-6 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/60 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-bold text-white mb-6">Add New Schedule</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white/90 mb-2">
                Course *
              </label>
              <select
                name="courseId"
                value={form.courseId}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white/95 focus:outline-none focus:border-yellow-400 font-medium"
              >
                <option value="" className="bg-gray-800 text-white">
                  {fetchingCourses ? "Loading courses..." : "Select Course"}
                </option>
                {courses.length === 0 && !fetchingCourses && (
                  <option value="" disabled className="bg-gray-800 text-white/60">
                    No courses available. Please create a course first.
                  </option>
                )}
                {courses.map((course) => (
                  <option key={course._id} value={course._id} className="bg-gray-800 text-white">
                    {course.name} ({course.code}) - {course.department} - {course.credits} credits
                    {course.status !== 'active' && ` (${course.status})`}
                  </option>
                ))}
              </select>
              {courses.length === 0 && !fetchingCourses && (
                <button
                  type="button"
                  onClick={() => window.open('/Admin/courses', '_blank')}
                  className="text-yellow-400 text-xs mt-2 hover:text-yellow-300"
                >
                  Click here to create a course
                </button>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-white/90 mb-2">
                Teacher *
              </label>
              <select
                name="teacherId"
                value={form.teacherId}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white/95 focus:outline-none focus:border-yellow-400 font-medium"
              >
                <option value="" className="bg-gray-800 text-white">
                  {fetchingTeachers ? "Loading teachers..." : "Select Teacher"}
                </option>
                {teachers.length === 0 && !fetchingTeachers && (
                  <option value="" disabled className="bg-gray-800 text-white/60">
                    No teachers available
                  </option>
                )}
                {teachers.map((teacher) => (
                  <option key={teacher._id} value={teacher._id} className="bg-gray-800 text-white">
                    {teacher.userId?.firstName} {teacher.userId?.lastName} - {teacher.specialization}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white/90 mb-2">
                Day of Week *
              </label>
              <select
                name="dayOfWeek"
                value={form.dayOfWeek}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white capitalize focus:outline-none focus:border-yellow-400"
              >
                {daysOfWeek.map((day) => (
                  <option key={day} value={day} className="bg-gray-800 text-white capitalize">
                    {day}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-white/90 mb-2">
                Status
              </label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white/95 focus:outline-none focus:border-yellow-400 font-medium"
              >
                <option value="scheduled" className="bg-gray-800 text-white">Scheduled</option>
                <option value="cancelled" className="bg-gray-800 text-white">Cancelled</option>
                <option value="completed" className="bg-gray-800 text-white">Completed</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white/90 mb-2">
                Start Time *
              </label>
              <input
                type="time"
                name="startTime"
                value={form.startTime}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white/95 focus:outline-none focus:border-yellow-400 font-medium"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/90 mb-2">
                End Time *
              </label>
              <input
                type="time"
                name="endTime"
                value={form.endTime}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white/95 focus:outline-none focus:border-yellow-400 font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white/90 mb-2">
                Room *
              </label>
              <input
                type="text"
                name="room"
                value={form.room}
                onChange={handleChange}
                required
                placeholder="e.g., 101"
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white/95 placeholder-white/50 focus:outline-none focus:border-yellow-400 font-medium"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/90 mb-2">
                Building
              </label>
              <input
                type="text"
                name="building"
                value={form.building}
                onChange={handleChange}
                placeholder="e.g., Science Block"
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white/95 placeholder-white/50 focus:outline-none focus:border-yellow-400 font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white/90 mb-2">
                Semester *
              </label>
              <input
                type="text"
                name="semester"
                value={form.semester}
                onChange={handleChange}
                required
                placeholder="e.g., Fall 2026"
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white/95 placeholder-white/50 focus:outline-none focus:border-yellow-400 font-medium"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/90 mb-2">
                Academic Year *
              </label>
              <input
                type="text"
                name="academicYear"
                value={form.academicYear}
                onChange={handleChange}
                required
                placeholder="e.g., 2026-2027"
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white/95 placeholder-white/50 focus:outline-none focus:border-yellow-400 font-medium"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="isRecurring"
              checked={form.isRecurring}
              onChange={handleChange}
              className="w-4 h-4 bg-white/10 border border-white/20 rounded"
            />
            <label className="text-sm text-white/90 font-medium">
              Recurring (weekly)
            </label>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || courses.length === 0}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-yellow-400 to-orange-400 text-white hover:from-yellow-500 hover:to-orange-500 transition-colors disabled:opacity-50 font-bold"
            >
              {loading ? "Adding..." : "Add Schedule"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}