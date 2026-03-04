"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import http from "@/services/http";
import { studentApi } from "@/lib/api";
import toast from "react-hot-toast";
import { BookOpen, Users, Clock, Search, CheckCircle, XCircle, GraduationCap, Filter } from "lucide-react";
import LoadingSpinner from "@/app/components/ui/LoadingSpinner";

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
  teacherId?: {
    _id: string;
    userId: {
      firstName: string;
      lastName: string;
    };
    specialization: string;
  };
}

interface EnrolledCourse {
  _id: string;
  name: string;
  code: string;
  status: string;
}

const AvailableCoursesPage = () => {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const availableRes = await http.get("/student/courses/available");
      setCourses(availableRes.data.data || []);
      
      const enrolledRes = await http.get("/student/courses");
      setEnrolledCourses(enrolledRes.data.data || []);
      
    } catch (error: any) {
      console.error("Error fetching available courses:", error);
      if (error.code === 'ERR_NETWORK' || !error.response) {
        toast.error("Cannot connect to backend server. Please ensure it's running.");
      } else {
        toast.error(error.response?.data?.msg || "Failed to load available courses");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (courseId: string) => {
    try {
      setEnrolling(courseId);
      await http.post("/student/enroll", { courseId });
      toast.success("Successfully enrolled in course!");
      
      await fetchData();
    } catch (error: any) {
      console.error("Error enrolling in course:", error);
      toast.error(error.response?.data?.msg || "Failed to enroll in course");
    } finally {
      setEnrolling(null);
    }
  };

  const isCourseFull = (course: Course) => {
    return (course.enrolledCount || 0) >= (course.maxStudents || 50);
  };

  const isEnrolled = (courseId: string) => {
    return enrolledCourses.some(course => course._id === courseId);
  };

  const departments = [...new Set(courses.map(c => c.department))].filter(Boolean);
  
  const filteredCourses = courses.filter(course => {
    const matchesSearch = 
      (course.name?.toLowerCase().includes(search.toLowerCase()) ||
      course.code?.toLowerCase().includes(search.toLowerCase()) ||
      course.department?.toLowerCase().includes(search.toLowerCase()));
    
    const matchesLevel = !selectedLevel || course.level === selectedLevel;
    const matchesDepartment = !selectedDepartment || course.department === selectedDepartment;
    
    return matchesSearch && matchesLevel && matchesDepartment;
  });

  const getLevelBadge = (level: string) => {
    const colors = {
      beginner: "bg-green-600 text-white/80",
      intermediate: "bg-yellow-600 text-white/80",
      advanced: "bg-red-600 text-white/80",
    };
    return colors[level as keyof typeof colors] || "bg-gray-500/20 text-gray-400";
  };

  const getStatusBadge = (course: Course) => {
    if (isEnrolled(course._id)) {
      return {
        text: "Enrolled",
        color: "bg-blue-600 text-white/80"
      };
    }
    if (isCourseFull(course)) {
      return {
        text: "Full",
        color: "bg-red-600 text-white/80"
      };
    }
    return {
      text: "Available",
      color: "bg-green-600 text-white/80"
    };
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
      <div key="header" className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Available Courses</h1>
          <p className="text-white/60 mt-1">Browse and enroll in courses</p>
        </div>
        <button
          onClick={() => router.push("/Student/courses")}
          className="px-4 py-2 bg-white/10 rounded-lg text-white hover:bg-white/20 transition-colors flex items-center gap-2"
        >
          <BookOpen className="w-4 h-4" />
          My Enrolled Courses
        </button>
      </div>

      <div key="filters" className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by course name, code, or department..."
              className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-yellow-400"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-2 bg-white/10 rounded-lg text-white hover:bg-white/20 transition-colors flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            Filters
          </button>
        </div>

        {showFilters && (
          <div key="filter-options" className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Level</label>
                <select
                  value={selectedLevel}
                  onChange={(e) => setSelectedLevel(e.target.value)}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-yellow-400"
                >
                  <option value="">All Levels</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Department</label>
                <select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-yellow-400"
                >
                  <option value="">All Departments</option>
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <button
              onClick={() => {
                setSelectedLevel("");
                setSelectedDepartment("");
              }}
              className="mt-4 px-4 py-2 bg-white/10 rounded-lg text-white hover:bg-white/20 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      <div key="results-count" className="text-white/60 text-sm">
        Found {filteredCourses.length} available courses
      </div>

      {filteredCourses.length === 0 ? (
        <div key="no-results" className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-12 text-center">
          <BookOpen className="w-16 h-16 text-white/40 mx-auto mb-4" />
          <h3 className="text-white font-medium text-lg mb-2">No Courses Found</h3>
          <p className="text-white/60">
            {search || selectedLevel || selectedDepartment 
              ? "Try adjusting your search or filters" 
              : "No available courses at the moment"}
          </p>
        </div>
      ) : (
        <div key="courses-grid" className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredCourses.map((course) => {
            const status = getStatusBadge(course);
            const enrolled = isEnrolled(course._id);
            const full = isCourseFull(course);
            
            return (
              <div
                key={course._id}
                className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-6 hover:border-white/40 transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-white font-semibold text-lg">{course.name}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs ${status.color}`}>
                        {status.text}
                      </span>
                    </div>
                    <p className="text-white/60 text-sm">{course.code}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs capitalize ${getLevelBadge(course.level)}`}>
                    {course.level}
                  </span>
                </div>

                <p className="text-white/70 text-sm mb-4 line-clamp-2">{course.description}</p>

                <div className="flex flex-wrap items-center gap-4 text-sm mb-4">
                  <span className="text-white/60">
                    <Clock className="w-4 h-4 inline mr-1" />
                    {course.duration || "N/A"}
                  </span>
                  <span className="text-white/60">
                    <GraduationCap className="w-4 h-4 inline mr-1" />
                    {course.credits} Credits
                  </span>
                  <span className="text-white/60">
                    <Users className="w-4 h-4 inline mr-1" />
                    {course.enrolledCount || 0}/{course.maxStudents || 50}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-sm mb-4">
                  <span className="text-white/60 bg-white/5 px-3 py-1 rounded-full">
                    {course.department}
                  </span>
                </div>

                {course.teacherId && (
                  <div className="bg-white/5 rounded-lg p-3 mb-4">
                    <p className="text-white/80 text-sm font-medium mb-1">Instructor</p>
                    <p className="text-white">
                      {course.teacherId.userId?.firstName} {course.teacherId.userId?.lastName}
                    </p>
                    <p className="text-white/60 text-xs">{course.teacherId.specialization}</p>
                  </div>
                )}

                <button
                  onClick={() => handleEnroll(course._id)}
                  disabled={enrolling === course._id || enrolled || full}
                  className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-white transition-colors ${
                    enrolled
                      ? "bg-blue-500/50 cursor-not-allowed"
                      : full
                      ? "bg-red-500/50 cursor-not-allowed"
                      : "bg-gradient-to-r from-green-400 to-teal-400 hover:from-green-500 hover:to-teal-500"
                  }`}
                >
                  {enrolling === course._id ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                      Enrolling...
                    </>
                  ) : enrolled ? (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Already Enrolled
                    </>
                  ) : full ? (
                    <>
                      <XCircle className="w-4 h-4" />
                      Course Full
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Enroll Now
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AvailableCoursesPage;