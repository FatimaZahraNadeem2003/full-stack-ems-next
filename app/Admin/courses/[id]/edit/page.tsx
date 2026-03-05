"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import http from "@/services/http";
import toast from "react-hot-toast";
import { ArrowLeft, Save } from "lucide-react";
import LoadingSpinner from "@/app/components/ui/LoadingSpinner";

interface CourseData {
  _id: string;
  name: string;
  code: string;
  description: string;
  teacherId?: {
    _id: string;
    userId: { firstName: string; lastName: string };
  };
  credits: number;
  duration: string;
  department: string;
  level: string;
  syllabus?: string;
  prerequisites?: string[];
  maxStudents: number;
  status: string;
}

const EditCoursePage = () => {
  const router = useRouter();
  const params = useParams();
  const courseId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [teachers, setTeachers] = useState<any[]>([]);
  
  const [form, setForm] = useState({
    name: "",
    code: "",
    description: "",
    teacherId: "",
    credits: "3",
    duration: "",
    department: "",
    level: "beginner",
    syllabus: "",
    prerequisites: "",
    maxStudents: "50",
    status: "active",
  });

  useEffect(() => {
    if (courseId) {
      fetchCourseDetails();
      fetchTeachers();
    }
  }, [courseId]);

  const fetchTeachers = async () => {
    try {
      const response = await http.get("/admin/teachers?status=active&limit=100");
      setTeachers(response.data.data || []);
    } catch (error) {
      console.error("Error fetching teachers:", error);
    }
  };

  const fetchCourseDetails = async () => {
    try {
      setLoading(true);
      const response = await http.get(`/admin/courses/${courseId}`);
      console.log("Course details:", response.data);
      
      const courseData = response.data.data || response.data;
      
      setForm({
        name: courseData.name || "",
        code: courseData.code || "",
        description: courseData.description || "",
        teacherId: courseData.teacherId?._id || "",
        credits: courseData.credits?.toString() || "3",
        duration: courseData.duration || "",
        department: courseData.department || "",
        level: courseData.level || "beginner",
        syllabus: courseData.syllabus || "",
        prerequisites: courseData.prerequisites?.join(", ") || "",
        maxStudents: courseData.maxStudents?.toString() || "50",
        status: courseData.status || "active",
      });
      
    } catch (error: any) {
      console.error("Error fetching course:", error);
      toast.error(error.response?.data?.msg || "Failed to load course details");
      router.push("/Admin/courses");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.name || !form.code || !form.description || !form.credits || !form.duration || !form.department) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setSaving(true);
      
      const updateData = {
        name: form.name,
        code: form.code,
        description: form.description,
        teacherId: form.teacherId || undefined,
        credits: parseInt(form.credits),
        duration: form.duration,
        department: form.department,
        level: form.level,
        syllabus: form.syllabus,
        prerequisites: form.prerequisites.split(",").map(p => p.trim()).filter(p => p),
        maxStudents: parseInt(form.maxStudents),
        status: form.status,
      };

      await http.put(`/admin/courses/${courseId}`, updateData);
      
      toast.success("Course updated successfully");
      router.push(`/Admin/courses/${courseId}`);
      
    } catch (error: any) {
      console.error("Error updating course:", error);
      toast.error(error.response?.data?.msg || "Failed to update course");
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
        <h1 className="text-2xl font-bold text-white">Edit Course</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">Course Name *</label>
              <input type="text" name="name" value={form.name} onChange={handleChange} required className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">Course Code *</label>
              <input type="text" name="code" value={form.code} onChange={handleChange} required className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">Credits *</label>
              <input type="number" name="credits" value={form.credits} onChange={handleChange} required min="1" max="10" className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">Department *</label>
              <input type="text" name="department" value={form.department} onChange={handleChange} required className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">Duration *</label>
              <input type="text" name="duration" value={form.duration} onChange={handleChange} required placeholder="e.g., 16 weeks" className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">Level</label>
              <select name="level" value={form.level} onChange={handleChange} className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white">
                <option value="beginner" className="bg-gray-800 text-white">Beginner</option>
                <option value="intermediate" className="bg-gray-800 text-white">Intermediate</option>
                <option value="advanced" className="bg-gray-800 text-white">Advanced</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">Teacher</label>
              <select name="teacherId" value={form.teacherId} onChange={handleChange} className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white">
                <option value="">Select Teacher</option>
                {teachers.map(t => (
                  <option key={t._id} value={t._id}>
                    {t.userId?.firstName} {t.userId?.lastName}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">Max Students</label>
              <input type="number" name="maxStudents" value={form.maxStudents} onChange={handleChange} min="1" className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">Status</label>
              <select name="status" value={form.status} onChange={handleChange} className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="upcoming">Upcoming</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-white/80 mb-2">Description *</label>
              <textarea name="description" value={form.description} onChange={handleChange} required rows={4} className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-white/80 mb-2">Syllabus</label>
              <textarea name="syllabus" value={form.syllabus} onChange={handleChange} rows={3} className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-white/80 mb-2">Prerequisites (comma separated)</label>
              <input type="text" name="prerequisites" value={form.prerequisites} onChange={handleChange} placeholder="e.g., Math 101, English 102" className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white" />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button type="button" onClick={() => router.back()} className="px-4 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20">Cancel</button>
          <button type="submit" disabled={saving} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-green-400 to-emerald-500 text-white disabled:opacity-50">
            <Save className="w-4 h-4" /> {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditCoursePage;