"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import http from "@/services/http";
import toast from "react-hot-toast";
import { BookOpen, Users, Clock, GraduationCap, Search, CheckCircle, XCircle } from "lucide-react";

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

const AvailableCoursesPage = () => {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [enrolling, setEnrolling] = useState<string | null>(null);

  useEffect(() => {
    fetchAvailableCourses();
  }, []);

  const fetchAvailableCourses = async () => {
    try {
      setLoading(true);
      const response = await http.get("/admin/courses?status=active");
      setCourses(response.data.data);
    } catch (error) {
      console.error("Error fetching available courses:", error);
      toast.error("Failed to load available courses");
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (courseId: string) => {
    try {
      setEnrolling(courseId);
      await http.post("/enrollments/student/enroll", { courseId });
      toast.success("Successfully enrolled in course!");
      fetchAvailableCourses();
    } catch (error: any) {
      console.error("Error enrolling in course:", error);
      toast.error(error.response?.data?.msg || "Failed to enroll in course");
    } finally {
      setEnrolling(null);
    }
  };

  const isCourseFull = (course: Course) => {
    return course.enrolledCount >= (course.maxStudents || 50);
  };

  const isAlreadyEnrolled = (course: Course) => {
   
    return false; 
  };

  const filteredCourses = courses.filter(course =>
    (course.name.toLowerCase().includes(search.toLowerCase()) ||
    course.code.toLowerCase().includes(search.toLowerCase()) ||
    course.department.toLowerCase().includes(search.toLowerCase())) &&
    course.status === 'active'
  );

  const getLevelBadge = (level: string) => {
    const colors = {
      beginner: "bg-green-500/20 text-green-400",
      intermediate: "bg-yellow-500/20 text-yellow-400",
      advanced: "bg-red-500/20 text-red-400",
    };
    return colors[level as keyof typeof colors] || "bg-gray-500/20 text-gray-400";
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
        <h1 className="text-2xl font-bold text-white">Available Courses</h1>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search available courses..."
            className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-yellow-400"
          />
        </div>
      </div>

      {filteredCourses.length === 0 ? (
        <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-8 text-center">
          <BookOpen className="w-12 h-12 text-white/40 mx-auto mb-3" />
          <p className="text-white/60">No available courses found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredCourses.map((course) => (
            <div
              key={course._id}
              className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-6 hover:border-white/40 transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-white font-semibold text-lg">{course.name}</h3>
                  <p className="text-white/60 text-sm">{course.code}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs capitalize ${getLevelBadge(course.level)}`}>
                  {course.level}
                </span>
              </div>

              <p className="text-white/70 text-sm mb-4 line-clamp-2">{course.description}</p>

              <div className="flex items-center gap-4 text-sm mb-4">
                <span className="text-white/60">
                  <Clock className="w-4 h-4 inline mr-1" />
                  {course.duration}
                </span>
                <span className="text-white/60">
                  <GraduationCap className="w-4 h-4 inline mr-1" />
                  {course.credits} Credits
                </span>
              </div>

              <div className="flex items-center gap-4 text-sm mb-4">
                <span className="text-white/60">
                  <Users className="w-4 h-4 inline mr-1" />
                  {course.enrolledCount || 0}/{course.maxStudents || 50} Enrolled
                </span>
                <span className="text-white/60">
                  {course.department}
                </span>
              </div>

              {course.teacherId && (
                <div className="bg-white/5 rounded-lg p-3 mb-4">
                  <p className="text-white/80 text-sm font-medium mb-1">Instructor</p>
                  <p className="text-white">
                    {course.teacherId.userId.firstName} {course.teacherId.userId.lastName}
                  </p>
                  <p className="text-white/60 text-xs">{course.teacherId.specialization}</p>
                </div>
              )}

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleEnroll(course._id)}
                  disabled={enrolling === course._id || isCourseFull(course)}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-white transition-colors ${
                    isCourseFull(course)
                      ? "bg-gray-500/50 cursor-not-allowed"
                      : "bg-gradient-to-r from-green-400 to-teal-400 hover:from-green-500 hover:to-teal-500"
                  }`}
                >
                  {enrolling === course._id ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                      Enrolling...
                    </>
                  ) : isCourseFull(course) ? (
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AvailableCoursesPage;