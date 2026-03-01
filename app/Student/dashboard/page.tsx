"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import http from "@/services/http";
import toast from "react-hot-toast";
import {
  BookOpen,
  Calendar,
  Clock,
  ArrowRight,
  TrendingUp,
  Award,
} from "lucide-react";

interface DashboardData {
  profile: {
    firstName: string;
    lastName: string;
    email: string;
    rollNumber: string;
    class: string;
    section: string;
  };
  statistics: {
    totalCourses: number;
    completedCourses: number;
    inProgressCourses: number;
    averageProgress: number;
  };
  recentGrades: Array<{
    _id: string;
    courseId: {
      name: string;
      code: string;
    };
    assessmentName: string;
    grade: string;
    percentage: number;
    submittedAt: string;
  }>;
  todayClasses: Array<{
    _id: string;
    courseId: {
      name: string;
      code: string;
    };
    startTime: string;
    endTime: string;
    room: string;
    teacherId: {
      userId: {
        firstName: string;
        lastName: string;
      };
    };
  }>;
  courses: Array<{
    _id: string;
    name: string;
    code: string;
    progress: number;
    status: string;
  }>;
}

const StudentDashboard = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DashboardData | null>(null);
  const [timeGreeting, setTimeGreeting] = useState("");

  useEffect(() => {
    setGreeting();
    fetchDashboardData();
  }, []);

  const setGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) setTimeGreeting("Good Morning");
    else if (hour < 18) setTimeGreeting("Good Afternoon");
    else setTimeGreeting("Good Evening");
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch student profile
      const profileRes = await http.get("/student/profile");
      
      // Fetch student courses
      const coursesRes = await http.get("/student/courses");
      
      // Fetch student grades
      const gradesRes = await http.get("/student/grades");
      
      // Fetch student schedule
      const scheduleRes = await http.get("/student/schedule");

      // Get today's classes from schedule
      const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
      const todayClasses = scheduleRes.data.today?.classes || [];

      setData({
        profile: profileRes.data.data.profile,
        statistics: profileRes.data.data.statistics,
        recentGrades: gradesRes.data.data.slice(0, 5) || [],
        todayClasses,
        courses: coursesRes.data.data || [],
      });

    } catch (error: any) {
      console.error("Error fetching dashboard data:", error);
      toast.error(error.response?.data?.msg || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon, color }: any) => (
    <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-6 hover:border-white/40 transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg bg-gradient-to-r ${color}`}>
          {icon}
        </div>
      </div>
      <h3 className="text-white/60 text-sm mb-1">{title}</h3>
      <p className="text-white text-2xl font-bold">{value}</p>
    </div>
  );

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
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-400"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-6">
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
          {timeGreeting}, {data?.profile.firstName}! 👋
        </h1>
        <p className="text-white/70">
          Welcome back to your student dashboard. Here's your learning progress.
        </p>
        <div className="mt-4 flex flex-wrap gap-4 text-sm text-white/60">
          <span>📚 Class: {data?.profile.class} {data?.profile.section}</span>
          <span>🎫 Roll No: {data?.profile.rollNumber}</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Courses"
          value={data?.statistics.totalCourses || 0}
          icon={<BookOpen className="w-6 h-6 text-white" />}
          color="from-blue-400 to-indigo-500"
        />
        <StatCard
          title="In Progress"
          value={data?.statistics.inProgressCourses || 0}
          icon={<Clock className="w-6 h-6 text-white" />}
          color="from-green-400 to-emerald-500"
        />
        <StatCard
          title="Completed"
          value={data?.statistics.completedCourses || 0}
          icon={<Award className="w-6 h-6 text-white" />}
          color="from-purple-400 to-pink-500"
        />
        <StatCard
          title="Avg Progress"
          value={`${data?.statistics.averageProgress || 0}%`}
          icon={<TrendingUp className="w-6 h-6 text-white" />}
          color="from-orange-400 to-red-500"
        />
      </div>

      {/* Today's Classes & Recent Grades */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Classes */}
        <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-semibold flex items-center gap-2">
              <Calendar className="w-5 h-5 text-yellow-400" />
              Today's Classes
            </h2>
            <button
              onClick={() => router.push("/Student/schedule")}
              className="text-yellow-400 hover:text-yellow-300 text-sm flex items-center gap-1"
            >
              View Schedule <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-3">
            {data?.todayClasses && data.todayClasses.length > 0 ? (
              data.todayClasses.map((cls) => (
                <div
                  key={cls._id}
                  className="p-3 bg-white/5 rounded-lg border border-white/10"
                >
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-white font-medium">{cls.courseId?.name}</p>
                    <span className="text-white/60 text-sm">{cls.courseId?.code}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/60">
                      {cls.startTime} - {cls.endTime}
                    </span>
                    <span className="text-white/60">Room {cls.room}</span>
                  </div>
                  <p className="text-white/60 text-xs mt-1">
                    Teacher: {cls.teacherId?.userId?.firstName} {cls.teacherId?.userId?.lastName}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-white/60 text-center py-4">No classes scheduled for today</p>
            )}
          </div>
        </div>

        {/* Recent Grades */}
        <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-semibold flex items-center gap-2">
              <Award className="w-5 h-5 text-yellow-400" />
              Recent Grades
            </h2>
            <button
              onClick={() => router.push("/Student/grades")}
              className="text-yellow-400 hover:text-yellow-300 text-sm flex items-center gap-1"
            >
              View All <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-3">
            {data?.recentGrades && data.recentGrades.length > 0 ? (
              data.recentGrades.map((grade) => (
                <div
                  key={grade._id}
                  className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10"
                >
                  <div>
                    <p className="text-white font-medium">{grade.courseId?.name}</p>
                    <p className="text-white/60 text-sm">{grade.assessmentName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-bold text-lg">{grade.grade}</p>
                    <p className="text-white/60 text-xs">{grade.percentage}%</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-white/60 text-center py-4">No grades available</p>
            )}
          </div>
        </div>
      </div>

      {/* My Courses Progress */}
      <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-semibold flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-yellow-400" />
            My Courses Progress
          </h2>
          <button
            onClick={() => router.push("/Student/courses")}
            className="text-yellow-400 hover:text-yellow-300 text-sm flex items-center gap-1"
          >
            View All Courses <ArrowRight className="w-4 h-4" />
          </button>
        </div>
        <div className="space-y-4">
          {data?.courses && data.courses.length > 0 ? (
            data.courses.map((course) => (
              <div
                key={course._id}
                className="p-4 bg-white/5 rounded-lg border border-white/10 cursor-pointer hover:bg-white/10 transition-colors"
                onClick={() => router.push(`/Student/courses/${course._id}`)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-white font-medium">{course.name}</p>
                    <p className="text-white/60 text-sm">{course.code}</p>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      course.status === "completed"
                        ? "bg-green-500/20 text-green-400"
                        : "bg-blue-500/20 text-blue-400"
                    }`}
                  >
                    {course.status}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <ProgressBar progress={course.progress} />
                  <span className="text-white/60 text-sm min-w-[45px]">
                    {course.progress}%
                  </span>
                </div>
              </div>
            ))
          ) : (
            <p className="text-white/60 text-center py-4">No courses enrolled yet</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;