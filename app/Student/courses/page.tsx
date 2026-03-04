"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import http from "@/services/http";
import toast from "react-hot-toast";
import { BookOpen, Users, Calendar, Clock, Search, ArrowRight } from "lucide-react";
import LoadingSpinner from "@/app/components/ui/LoadingSpinner";

interface Course {
  _id: string;
  enrollmentId: string;
  name: string;
  code: string;
  description: string;
  credits: number;
  department: string;
  level: string;
  teacher?: {
    name: string;
    specialization: string;
  } | null;
  progress: number;
  status: string;
  enrollmentDate: string;
  schedule?: Array<{
    dayOfWeek: string;
    startTime: string;
    endTime: string;
    room: string;
    building?: string;
  }>;
}

const StudentCoursesPage = () => {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await http.get("/student/courses");
      console.log("Courses response:", response.data); 
      
      let coursesData = [];
      if (response.data.data) {
        if (Array.isArray(response.data.data)) {
          coursesData = response.data.data;
        } else if (response.data.data.courses) {
          coursesData = response.data.data.courses;
        }
      } else if (Array.isArray(response.data)) {
        coursesData = response.data;
      }
      
      setCourses(coursesData);
    } catch (error: any) {
      console.error("Error fetching courses:", error);
      toast.error(error.response?.data?.msg || "Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  const filteredCourses = courses.filter(course => {
    if (!course) return false;
    
    const searchLower = search.toLowerCase();
    return (
      (course.name?.toLowerCase() || '').includes(searchLower) ||
      (course.code?.toLowerCase() || '').includes(searchLower) ||
      (course.department?.toLowerCase() || '').includes(searchLower)
    );
  });

  const getStatusBadge = (status: string) => {
    const colors = {
      enrolled: "bg-green-600 text-white/80",
      completed: "bg-blue-600 text-white/80",
      dropped: "bg-red-600 text-white/80",
      pending: "bg-yellow-600 text-white/80",
    };
    return colors[status as keyof typeof colors] || "bg-gray-500/20 text-gray-400";
  };

  const getLevelBadge = (level: string) => {
    const colors = {
      beginner: "bg-green-600 text-white/80",
      intermediate: "bg-yellow-600 text-white/80",
      advanced: "bg-red-600 text-white/80",
    };
    return colors[level as keyof typeof colors] || "bg-gray-500/20 text-gray-400";
  };

  const ProgressBar = ({ progress }: { progress: number }) => (
    <div className="w-full bg-white/10 rounded-full h-2">
      <div
        className="bg-gradient-to-r from-yellow-400 to-orange-400 h-2 rounded-full transition-all duration-300"
        style={{ width: `${progress}%` }}
      />
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">My Courses</h1>
          <p className="text-white/60 mt-1">Track your enrolled courses and progress</p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => router.push('/Student/available-courses')}
            className="px-4 py-2 bg-gradient-to-r from-green-400 to-teal-400 rounded-lg text-white hover:from-green-500 hover:to-teal-500 transition-colors flex items-center gap-2"
          >
            <BookOpen className="w-4 h-4" />
            Browse Available Courses
          </button>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search courses..."
              className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-yellow-400"
            />
          </div>
        </div>
      </div>

      {filteredCourses.length === 0 ? (
        <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-12 text-center">
          <BookOpen className="w-16 h-16 text-white/40 mx-auto mb-4" />
          <h3 className="text-white font-medium text-lg mb-2">No Courses Found</h3>
          <p className="text-white/60 mb-6">
            {search ? "No courses match your search" : "You haven't enrolled in any courses yet"}
          </p>
          {!search && (
            <button
              onClick={() => router.push('/Student/available-courses')}
              className="px-6 py-2 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-lg text-white hover:from-yellow-500 hover:to-orange-500 transition-colors"
            >
              Browse Available Courses
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filteredCourses.map((item) => (
            <div
              key={item._id || item.enrollmentId}
              className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-6 hover:border-white/40 transition-all duration-300 cursor-pointer"
              onClick={() => router.push(`/Student/courses/${item._id}`)}
            >
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-white font-semibold text-lg">{item.name || 'Untitled Course'}</h3>
                      <p className="text-white/60 text-sm">{item.code || 'N/A'}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs ${getLevelBadge(item.level)}`}>
                      {item.level || 'beginner'}
                    </span>
                  </div>

                  <p className="text-white/70 text-sm mb-4 line-clamp-2">{item.description || 'No description available'}</p>

                  <div className="flex flex-wrap gap-4 text-sm mb-4">
                    <span className="text-white/60">
                      <BookOpen className="w-4 h-4 inline mr-1" />
                      {item.credits || 0} Credits
                    </span>
                    <span className="text-white/60">
                      <Users className="w-4 h-4 inline mr-1" />
                      {item.department || 'N/A'}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadge(item.status)}`}>
                      {item.status || 'enrolled'}
                    </span>
                  </div>

                  {item.teacher && (
                    <div className="bg-white/5 rounded-lg p-3 mb-4">
                      <p className="text-white/80 text-sm font-medium mb-1">Teacher</p>
                      <p className="text-white">{item.teacher.name || 'N/A'}</p>
                      <p className="text-white/60 text-xs">{item.teacher.specialization || ''}</p>
                    </div>
                  )}

                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-white/60 text-sm">Progress</span>
                      <span className="text-white text-sm">{item.progress || 0}%</span>
                    </div>
                    <ProgressBar progress={item.progress || 0} />
                  </div>
                </div>

                {item.schedule && item.schedule.length > 0 && (
                  <div className="lg:w-80 bg-white/5 rounded-lg p-4">
                    <p className="text-white/80 text-sm font-medium mb-3 flex items-center gap-1">
                      <Calendar className="w-4 h-4" /> Schedule
                    </p>
                    <div className="space-y-2">
                      {item.schedule.map((s, idx) => (
                        <div key={idx} className="text-sm">
                          <div className="flex items-center justify-between">
                            <span className="text-white/80 capitalize">{s.dayOfWeek}</span>
                            <span className="text-white">{s.startTime} - {s.endTime}</span>
                          </div>
                          <div className="flex items-center gap-1 text-white/60 text-xs mt-1">
                            <Clock className="w-3 h-3" />
                            <span>Room {s.room} {s.building && `- ${s.building}`}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(`/Student/courses/${item._id}`);
                }}
                className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2 bg-white/10 rounded-lg text-white hover:bg-white/20 transition-colors"
              >
                View Course Details <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentCoursesPage;