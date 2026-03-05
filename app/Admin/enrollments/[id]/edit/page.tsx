"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import http from "@/services/http";
import toast from "react-hot-toast";
import { ArrowLeft, Save } from "lucide-react";
import LoadingSpinner from "@/app/components/ui/LoadingSpinner";

interface EnrollmentData {
  _id: string;
  studentId: {
    _id: string;
    userId: { firstName: string; lastName: string };
    rollNumber: string;
  };
  courseId: {
    _id: string;
    name: string;
    code: string;
    credits: number;
  };
  enrollmentDate: string;
  status: string;
  progress: number;
  grade: string;
  marksObtained?: number;
  remarks?: string;
}

const EditEnrollmentPage = () => {
  const router = useRouter();
  const params = useParams();
  const enrollmentId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [students, setStudents] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  
  const [form, setForm] = useState({
    studentId: "",
    courseId: "",
    status: "enrolled",
    progress: "0",
    grade: "Not Graded",
    marksObtained: "",
    remarks: "",
  });

  useEffect(() => {
    if (enrollmentId) {
      fetchEnrollmentDetails();
      fetchStudents();
      fetchCourses();
    }
  }, [enrollmentId]);

  const fetchStudents = async () => {
    try {
      const response = await http.get("/admin/students?limit=100");
      setStudents(response.data.data || []);
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await http.get("/admin/courses?limit=100");
      setCourses(response.data.data || []);
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
  };

  const fetchEnrollmentDetails = async () => {
    try {
      setLoading(true);
      const response = await http.get(`/admin/enrollments/${enrollmentId}`);
      console.log("Enrollment details:", response.data);
      
      const enrollmentData = response.data.data || response.data;
      
      setForm({
        studentId: enrollmentData.studentId?._id || "",
        courseId: enrollmentData.courseId?._id || "",
        status: enrollmentData.status || "enrolled",
        progress: enrollmentData.progress?.toString() || "0",
        grade: enrollmentData.grade || "Not Graded",
        marksObtained: enrollmentData.marksObtained?.toString() || "",
        remarks: enrollmentData.remarks || "",
      });
      
    } catch (error: any) {
      console.error("Error fetching enrollment:", error);
      toast.error(error.response?.data?.msg || "Failed to load enrollment details");
      router.push("/Admin/enrollments");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.studentId || !form.courseId) {
      toast.error("Please select student and course");
      return;
    }

    try {
      setSaving(true);
      
      const updateData = {
        studentId: form.studentId,
        courseId: form.courseId,
        status: form.status,
        progress: parseInt(form.progress) || 0,
        grade: form.grade,
        marksObtained: form.marksObtained ? parseInt(form.marksObtained) : undefined,
        remarks: form.remarks,
      };

      await http.put(`/admin/enrollments/${enrollmentId}`, updateData);
      
      toast.success("Enrollment updated successfully");
      router.push(`/Admin/enrollments/${enrollmentId}`);
      
    } catch (error: any) {
      console.error("Error updating enrollment:", error);
      toast.error(error.response?.data?.msg || "Failed to update enrollment");
    } finally {
      setSaving(false);
    }
  };

  const gradeOptions = [
    "A+", "A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D", "F", "Incomplete", "Not Graded"
  ];

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
        <button 
          onClick={() => router.back()} 
          className="p-2 bg-white/10 rounded-lg text-white hover:bg-white/20"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold text-white">Edit Enrollment</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white/90 mb-2">Student *</label>
              <select 
                name="studentId" 
                value={form.studentId} 
                onChange={handleChange} 
                required 
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white/95 focus:outline-none focus:border-yellow-400 font-medium"
              >
                <option value="" className="bg-gray-800 text-white">Select Student</option>
                {students.map(s => (
                  <option key={s._id} value={s._id} className="bg-gray-800 text-white">
                    {s.userId?.firstName} {s.userId?.lastName} ({s.rollNumber})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-white/90 mb-2">Course *</label>
              <select 
                name="courseId" 
                value={form.courseId} 
                onChange={handleChange} 
                required 
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white/95 focus:outline-none focus:border-yellow-400 font-medium"
              >
                <option value="" className="bg-gray-800 text-white">Select Course</option>
                {courses.map(c => (
                  <option key={c._id} value={c._id} className="bg-gray-800 text-white">
                    {c.name} ({c.code})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-white/90 mb-2">Status</label>
              <select 
                name="status" 
                value={form.status} 
                onChange={handleChange} 
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white/95 focus:outline-none focus:border-yellow-400 font-medium"
              >
                <option value="enrolled" className="bg-gray-800 text-white">Enrolled</option>
                <option value="completed" className="bg-gray-800 text-white">Completed</option>
                <option value="dropped" className="bg-gray-800 text-white">Dropped</option>
                <option value="pending" className="bg-gray-800 text-white">Pending</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-white/90 mb-2">Progress (%)</label>
              <input 
                type="number" 
                name="progress" 
                value={form.progress} 
                onChange={handleChange} 
                min="0" 
                max="100" 
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white/95 placeholder-white/50 focus:outline-none focus:border-yellow-400 font-medium" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/90 mb-2">Grade</label>
              <select 
                name="grade" 
                value={form.grade} 
                onChange={handleChange} 
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white/95 focus:outline-none focus:border-yellow-400 font-medium"
              >
                {gradeOptions.map(g => (
                  <option key={g} value={g} className="bg-gray-800 text-white">{g}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-white/90 mb-2">Marks Obtained</label>
              <input 
                type="number" 
                name="marksObtained" 
                value={form.marksObtained} 
                onChange={handleChange} 
                min="0" 
                max="100" 
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white/95 placeholder-white/50 focus:outline-none focus:border-yellow-400 font-medium" 
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-white/90 mb-2">Remarks</label>
              <textarea 
                name="remarks" 
                value={form.remarks} 
                onChange={handleChange} 
                rows={3} 
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white/95 placeholder-white/50 focus:outline-none focus:border-yellow-400 font-medium" 
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button 
            type="button" 
            onClick={() => router.back()} 
            className="px-4 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20 font-medium"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            disabled={saving} 
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-green-400 to-emerald-500 text-white hover:from-green-500 hover:to-emerald-600 transition-colors disabled:opacity-50 font-bold"
          >
            <Save className="w-4 h-4" /> 
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditEnrollmentPage;