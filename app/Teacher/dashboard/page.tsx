"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import http from "@/services/http";
import toast from "react-hot-toast";
import {
  BookOpen,
  Users,
  Calendar,
  Clock,
  ArrowRight,
  AlertCircle,
} from "lucide-react";

interface DashboardStats {
  totalCourses: number;
  totalStudents: number;
  todayClasses: number;
  pendingGrades: number;
}

interface Course {
  _id: string;
  name: string;
  code: string;
  enrolledCount: number;
  description: string;
}

interface TodayClass {
  _id: string;
  courseId: {
    name: string;
    code: string;
  };
  startTime: string;
  endTime: string;
  room: string;
  status: string;
}

const TeacherDashboard = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalCourses: 0,
    totalStudents: 0,
    todayClasses: 0,
    pendingGrades: 0,
  });
  const [recentCourses, setRecentCourses] = useState<Course[]>([]);
  const [todaySchedule, setTodaySchedule] = useState<TodayClass[]>([]);
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
      
      const coursesRes = await http.get("/teacher/courses");
      const courses = coursesRes.data.data;
      
      const totalStudents = courses.reduce((acc: number, course: any) => acc + (course.enrolledCount || 0), 0);
      
      setStats({
        totalCourses: courses.length,
        totalStudents,
        todayClasses: 0,
        pendingGrades: 5, 
      });

      setRecentCourses(courses.slice(0, 4));

      const scheduleRes = await http.get("/teacher/schedules");
      const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
      const todayClasses = scheduleRes.data.data[today] || [];
      setTodaySchedule(todayClasses);
      
      setStats(prev => ({
        ...prev,
        todayClasses: todayClasses.length
      }));

    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error("Failed to load dashboard data");
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-400"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-6">
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
          {timeGreeting}, {user?.firstName}! 👋
        </h1>
        <p className="text-white/70">
          Welcome back to your teacher dashboard. {`Here's what's`} happening today.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="My Courses"
          value={stats.totalCourses}
          icon={<BookOpen className="w-6 h-6 text-white" />}
          color="from-blue-400 to-indigo-500"
        />
        <StatCard
          title="Total Students"
          value={stats.totalStudents}
          icon={<Users className="w-6 h-6 text-white" />}
          color="from-green-400 to-emerald-500"
        />
        <StatCard
          title="Today's Classes"
          value={stats.todayClasses}
          icon={<Calendar className="w-6 h-6 text-white" />}
          color="from-purple-400 to-pink-500"
        />
        <StatCard
          title="Pending Grades"
          value={stats.pendingGrades}
          icon={<AlertCircle className="w-6 h-6 text-white" />}
          color="from-orange-400 to-red-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-semibold flex items-center gap-2">
              <Calendar className="w-5 h-5 text-yellow-400" />
              {`Today's Schedule1`}
            </h2>
            <button
              onClick={() => router.push("/Teacher/schedule")}
              className="text-yellow-400 hover:text-yellow-300 text-sm flex items-center gap-1"
            >
              View All <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-3">
            {todaySchedule.length > 0 ? (
              todaySchedule.map((cls) => (
                <div
                  key={cls._id}
                  className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10"
                >
                  <div>
                    <p className="text-white font-medium">{cls.courseId?.name}</p>
                    <p className="text-white/60 text-sm">{cls.courseId?.code}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-white">{cls.startTime} - {cls.endTime}</p>
                    <p className="text-white/60 text-sm">Room {cls.room}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-white/60 text-center py-4">No classes scheduled for today</p>
            )}
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-semibold flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-yellow-400" />
              My Courses
            </h2>
            <button
              onClick={() => router.push("/Teacher/courses")}
              className="text-yellow-400 hover:text-yellow-300 text-sm flex items-center gap-1"
            >
              View All <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-3">
            {recentCourses.length > 0 ? (
              recentCourses.map((course) => (
                <div
                  key={course._id}
                  className="p-3 bg-white/5 rounded-lg border border-white/10 cursor-pointer hover:bg-white/10 transition-colors"
                  onClick={() => router.push(`/Teacher/courses/${course._id}`)}
                >
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-white font-medium">{course.name}</p>
                    <span className="text-white/60 text-sm">{course.code}</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-white/60">
                      <Users className="w-4 h-4 inline mr-1" />
                      {course.enrolledCount || 0} students
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-white/60 text-center py-4">No courses assigned yet</p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-6">
        <h2 className="text-white font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => router.push("/Teacher/grades")}
            className="p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors text-left"
          >
            <ClipboardList className="w-6 h-6 text-yellow-400 mb-2" />
            <p className="text-white font-medium">Grade Submissions</p>
            <p className="text-white/60 text-sm">Update student grades</p>
          </button>
          <button
            onClick={() => router.push("/Teacher/schedule")}
            className="p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors text-left"
          >
            <Calendar className="w-6 h-6 text-yellow-400 mb-2" />
            <p className="text-white font-medium">View Schedule</p>
            <p className="text-white/60 text-sm">Check your weekly classes</p>
          </button>
          <button
            onClick={() => router.push("/Teacher/courses")}
            className="p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors text-left"
          >
            <BookOpen className="w-6 h-6 text-yellow-400 mb-2" />
            <p className="text-white font-medium">Course Materials</p>
            <p className="text-white/60 text-sm">Manage your courses</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;