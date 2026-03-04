"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import http from "@/services/http";
import toast from "react-hot-toast";
import { ArrowLeft, Save } from "lucide-react";
import LoadingSpinner from "@/app/components/ui/LoadingSpinner";

interface ScheduleData {
  _id: string;
  courseId: { _id: string; name: string; code: string };
  teacherId: { _id: string; userId: { firstName: string; lastName: string } };
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  room: string;
  building?: string;
  semester: string;
  academicYear: string;
  status: string;
}

const EditSchedulePage = () => {
  const router = useRouter();
  const params = useParams();
  const scheduleId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [courses, setCourses] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  
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
    status: "scheduled",
  });

  const daysOfWeek = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

  useEffect(() => {
    if (scheduleId) {
      fetchScheduleDetails();
      fetchCourses();
      fetchTeachers();
    }
  }, [scheduleId]);

  const fetchCourses = async () => {
    try {
      const response = await http.get("/admin/courses?limit=100");
      setCourses(response.data.data || []);
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
  };

  const fetchTeachers = async () => {
    try {
      const response = await http.get("/admin/teachers?limit=100");
      setTeachers(response.data.data || []);
    } catch (error) {
      console.error("Error fetching teachers:", error);
    }
  };

  const fetchScheduleDetails = async () => {
    try {
      setLoading(true);
      const response = await http.get(`/admin/schedules/${scheduleId}`);
      console.log("Schedule details:", response.data);
      
      const scheduleData = response.data.data || response.data;
      
      setForm({
        courseId: scheduleData.courseId?._id || "",
        teacherId: scheduleData.teacherId?._id || "",
        dayOfWeek: scheduleData.dayOfWeek || "monday",
        startTime: scheduleData.startTime || "09:00",
        endTime: scheduleData.endTime || "10:30",
        room: scheduleData.room || "",
        building: scheduleData.building || "",
        semester: scheduleData.semester || "",
        academicYear: scheduleData.academicYear || "",
        status: scheduleData.status || "scheduled",
      });
      
    } catch (error: any) {
      console.error("Error fetching schedule:", error);
      toast.error(error.response?.data?.msg || "Failed to load schedule details");
      router.push("/Admin/schedules");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.courseId || !form.teacherId || !form.room || !form.semester || !form.academicYear) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setSaving(true);
      
      await http.put(`/admin/schedules/${scheduleId}`, form);
      
      toast.success("Schedule updated successfully");
      router.push(`/Admin/schedules/${scheduleId}`);
      
    } catch (error: any) {
      console.error("Error updating schedule:", error);
      toast.error(error.response?.data?.msg || "Failed to update schedule");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="p-2 bg-white/10 rounded-lg text-white hover:bg-white/20">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold text-white">Edit Schedule</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">Course *</label>
              <select name="courseId" value={form.courseId} onChange={handleChange} required className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white">
                <option value="">Select Course</option>
                {courses.map(c => <option key={c._id} value={c._id}>{c.name} ({c.code})</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">Teacher *</label>
              <select name="teacherId" value={form.teacherId} onChange={handleChange} required className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white">
                <option value="">Select Teacher</option>
                {teachers.map(t => <option key={t._id} value={t._id}>{t.userId?.firstName} {t.userId?.lastName}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">Day *</label>
              <select name="dayOfWeek" value={form.dayOfWeek} onChange={handleChange} required className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white capitalize">
                {daysOfWeek.map(day => <option key={day} value={day}>{day}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">Status</label>
              <select name="status" value={form.status} onChange={handleChange} className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white">
                <option value="scheduled">Scheduled</option>
                <option value="cancelled">Cancelled</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">Start Time *</label>
              <input type="time" name="startTime" value={form.startTime} onChange={handleChange} required className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">End Time *</label>
              <input type="time" name="endTime" value={form.endTime} onChange={handleChange} required className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">Room *</label>
              <input type="text" name="room" value={form.room} onChange={handleChange} required className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">Building</label>
              <input type="text" name="building" value={form.building} onChange={handleChange} className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">Semester *</label>
              <input type="text" name="semester" value={form.semester} onChange={handleChange} required className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">Academic Year *</label>
              <input type="text" name="academicYear" value={form.academicYear} onChange={handleChange} required className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white" />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button type="button" onClick={() => router.back()} className="px-4 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20">Cancel</button>
          <button type="submit" disabled={saving} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-green-400 to-emerald-500 text-white disabled:opacity-50