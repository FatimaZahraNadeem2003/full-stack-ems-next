"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import http from "@/services/http";
import toast from "react-hot-toast";
import { 
  ArrowLeft, 
  BookOpen, 
  Users, 
  Calendar, 
  GraduationCap, 
  Clock, 
  Edit3, 
  Save, 
  X, 
  Award,
  FileText
} from "lucide-react";

interface Course {
  _id: string;
  name: string;
  code: string;
  description: string;
  credits: number;
  department: string;
  level: string;
  status: string;
  duration: string;
  maxStudents: number;
  enrolledCount: number;
  syllabus?: string;
  prerequisites?: string[];
  teacherId?: {
    _id: string;
    userId: {
      firstName: string;
      lastName: string;
    };
  };
}

const CourseDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const courseId = params.courseId as string;
  
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    code: "",
    description: "",
    credits: 3,
    department: "",
    level: "beginner",
    duration: "",
    maxStudents: 50,
    syllabus: "",
    prerequisites: "",
  });

  useEffect(() => {
    fetchCourseDetails();
  }, [courseId]);

  const fetchCourseDetails = async () => {
    try {
      setLoading(true);
      const response = await http.get(`/teacher/courses/${courseId}`);
      const courseData = response.data.data;
      setCourse(courseData);
      
      setForm({
        name: courseData.name,
        code: courseData.code,
        description: courseData.description,
        credits: courseData.credits,
        department: courseData.department,
        level: courseData.level,
        duration: courseData.duration,
        maxStudents: courseData.maxStudents,
        syllabus: courseData.syllabus || "",
        prerequisites: (courseData.prerequisites || []).join(", "),
      });
    } catch (error) {
      console.error("Error fetching course:", error);
      toast.error("Failed to load course details");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    try {
      setSaving(true);
      await http.put(`/teacher/courses/${courseId}`, {
        ...form,
        prerequisites: form.prerequisites.split(",").map(p => p.trim()).filter(p => p),
      });
      toast.success("Course updated successfully");
      setEditing(false);
      fetchCourseDetails();
    } catch (error) {
      console.error("Error updating course:", error);
      toast.error("Failed to update course");
    } finally {
      setSaving(false);
    }
  };

  const StatCard = ({ title, value, icon, color }: any) => (
    <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-4">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg bg-gradient-to-r ${color}`}>
          {icon}
        </div>
        <div>
          <p className="text-white/60 text-xs">{title}</p>
          <p className="text-white font-bold text-lg">{value}</p>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-400"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="text-center py-8">
        <p className="text-white">Course not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 bg-white/10 rounded-lg text-white hover:bg-white/20 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-white">{course.name}</h1>
          <p className="text-white/60">{course.code} - Course Details</p>
        </div>
        {!editing ? (
          <button
            onClick={() => setEditing(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-lg text-white hover:bg-white/20 transition-colors"
          >
            <Edit3 className="w-4 h-4" />
            Edit Course
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleUpdate}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-400 to-emerald-500 rounded-lg text-white hover:from-green-500 hover:to-emerald-600 transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? "Saving..." : "Save"}
            </button>
            <button
              onClick={() => setEditing(false)}
              className="p-2 bg-white/10 rounded-lg text-white hover:bg-white/20 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Enrolled Students"
          value={course.enrolledCount || 0}
          icon={<Users className="w-4 h-4 text-white" />}
          color="from-blue-400 to-indigo-500"
        />
        <StatCard
          title="Credits"
          value={course.credits}
          icon={<GraduationCap className="w-4 h-4 text-white" />}
          color="from-green-400 to-emerald-500"
        />
        <StatCard
          title="Max Students"
          value={course.maxStudents}
          icon={<Users className="w-4 h-4 text-white" />}
          color="from-purple-400 to-pink-500"
        />
        <StatCard
          title="Level"
          value={course.level.charAt(0).toUpperCase() + course.level.slice(1)}
          icon={<Award className="w-4 h-4 text-white" />}
          color="from-orange-400 to-red-500"
        />
      </div>

      <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-6">
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-yellow-400" />
          Course Information
        </h2>
        
        {editing ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Course Name *
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-yellow-400"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Course Code *
                </label>
                <input
                  type="text"
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value })}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-yellow-400"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Credits *
                </label>
                <input
                  type="number"
                  value={form.credits}
                  onChange={(e) => setForm({ ...form, credits: parseInt(e.target.value) })}
                  min="1"
                  max="10"
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-yellow-400"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Department *
                </label>
                <input
                  type="text"
                  value={form.department}
                  onChange={(e) => setForm({ ...form, department: e.target.value })}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-yellow-400"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Duration
                </label>
                <input
                  type="text"
                  value={form.duration}
                  onChange={(e) => setForm({ ...form, duration: e.target.value })}
                  placeholder="e.g., 16 weeks"
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-yellow-400"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Max Students
                </label>
                <input
                  type="number"
                  value={form.maxStudents}
                  onChange={(e) => setForm({ ...form, maxStudents: parseInt(e.target.value) })}
                  min="1"
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-yellow-400"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Level
              </label>
              <select
                value={form.level}
                onChange={(e) => setForm({ ...form, level: e.target.value })}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-yellow-400"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Description
              </label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-yellow-400"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Syllabus
              </label>
              <textarea
                value={form.syllabus}
                onChange={(e) => setForm({ ...form, syllabus: e.target.value })}
                rows={3}
                placeholder="Course syllabus details..."
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-yellow-400"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Prerequisites
              </label>
              <input
                type="text"
                value={form.prerequisites}
                onChange={(e) => setForm({ ...form, prerequisites: e.target.value })}
                placeholder="Separate with commas (e.g., Math 101, English 102)"
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-yellow-400"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-white/60 text-sm">Course Name</p>
                <p className="text-white font-medium">{course.name}</p>
              </div>
              <div>
                <p className="text-white/60 text-sm">Course Code</p>
                <p className="text-white font-medium">{course.code}</p>
              </div>
              <div>
                <p className="text-white/60 text-sm">Credits</p>
                <p className="text-white font-medium">{course.credits}</p>
              </div>
              <div>
                <p className="text-white/60 text-sm">Department</p>
                <p className="text-white font-medium">{course.department}</p>
              </div>
              <div>
                <p className="text-white/60 text-sm">Duration</p>
                <p className="text-white font-medium">{course.duration || "Not specified"}</p>
              </div>
              <div>
                <p className="text-white/60 text-sm">Level</p>
                <p className="text-white font-medium capitalize">{course.level}</p>
              </div>
            </div>
            
            <div>
              <p className="text-white/60 text-sm mb-2">Description</p>
              <p className="text-white">{course.description}</p>
            </div>
            
            {course.syllabus && (
              <div>
                <p className="text-white/60 text-sm mb-2">Syllabus</p>
                <p className="text-white whitespace-pre-line">{course.syllabus}</p>
              </div>
            )}
            
            {course.prerequisites && course.prerequisites.length > 0 && (
              <div>
                <p className="text-white/60 text-sm mb-2">Prerequisites</p>
                <div className="flex flex-wrap gap-2">
                  {course.prerequisites.map((prereq, index) => (
                    <span 
                      key={index} 
                      className="px-2 py-1 bg-white/10 rounded-full text-white text-sm"
                    >
                      {prereq}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <button
          onClick={() => router.push(`/Teacher/courses/${courseId}/students`)}
          className="p-6 bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 hover:border-white/40 transition-all duration-300 text-left"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Users className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="text-white font-semibold text-lg">Manage Students</h3>
          </div>
          <p className="text-white/70">View enrolled students, add new students, and manage enrollments</p>
          <div className="mt-3 text-yellow-400 font-medium">View Students →</div>
        </button>

        <button
          onClick={() => router.push(`/Teacher/courses/${courseId}/grades`)}
          className="p-6 bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 hover:border-white/40 transition-all duration-300 text-left"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <Award className="w-6 h-6 text-white/80" />
            </div>
            <h3 className="text-white font-semibold text-lg">Grade Management</h3>
          </div>
          <p className="text-white/70">Add grades, update assessments, and track student performance</p>
          <div className="mt-3 text-yellow-400 font-medium">Manage Grades →</div>
        </button>
      </div>
    </div>
  );
};

export default CourseDetailPage;