"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import http from "@/services/http";
import toast from "react-hot-toast";
import {
  Users,
  GraduationCap,
  BookOpen,
  Calendar,
  ArrowUpRight,
  Clock,
  UserPlus,
  FileText,
} from "lucide-react";

interface DashboardStats {
  overview: {
    totalStudents: number;
    totalTeachers: number;
    totalCourses: number;
    totalEnrollments: number;
    activeCourses: number;
    activeEnrollments: number;
    completionRate: number;
    avgStudentsPerCourse: number;
  };
  todayClasses: {
    count: number;
    classes: any[];
  };
  popularCourses: any[];
  recentActivity: {
    enrollments: any[];
  };
}

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeGreeting, setTimeGreeting] = useState("");

  useEffect(() => {
    fetchDashboardStats();
    setGreeting();
  }, []);

  const setGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) setTimeGreeting("Good Morning");
    else if (hour < 18) setTimeGreeting("Good Afternoon");
    else setTimeGreeting("Good Evening");
  };

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await http.get("/admin/reports/dashboard");
      setStats(response.data.data);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      toast.error("Failed to load dashboard statistics");
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon, trend, color }: any) => (
    <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-6 hover:border-white/40 transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg bg-gradient-to-r ${color}`}>
          {icon}
        </div>
        {trend && (
          <span className="flex items-center text-green-400 text-sm">
            <ArrowUpRight className="w-4 h-4" />
            {trend}%
          </span>
        )}
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
          Welcome back to your admin dashboard. Here's what's happening today.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Students"
          value={stats?.overview.totalStudents || 0}
          icon={<Users className="w-6 h-6 text-white" />}
          color="from-blue-400 to-indigo-500"
        />
        <StatCard
          title="Total Teachers"
          value={stats?.overview.totalTeachers || 0}
          icon={<GraduationCap className="w-6 h-6 text-white" />}
          color="from-green-400 to-emerald-500"
        />
        <StatCard
          title="Total Courses"
          value={stats?.overview.totalCourses || 0}
          icon={<BookOpen className="w-6 h-6 text-white" />}
          color="from-purple-400 to-pink-500"
        />
        <StatCard
          title="Active Enrollments"
          value={stats?.overview.activeEnrollments || 0}
          icon={<FileText className="w-6 h-6 text-white" />}
          color="from-orange-400 to-red-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-semibold flex items-center gap-2">
              <Calendar className="w-5 h-5 text-yellow-400" />
              Today's Classes
            </h2>
            <span className="text-white/60 text-sm">
              {stats?.todayClasses.count || 0} classes
            </span>
          </div>
          <div className="space-y-3">
            {stats?.todayClasses.classes && stats.todayClasses.classes.length > 0 ? (
              stats.todayClasses.classes.map((cls: any, index: number) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10"
                >
                  <div>
                    <p className="text-white font-medium">{cls.courseId?.name}</p>
                    <p className="text-white/60 text-sm">{cls.teacherId?.userId?.firstName} {cls.teacherId?.userId?.lastName}</p>
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
              <Clock className="w-5 h-5 text-yellow-400" />
              Recent Enrollments
            </h2>
          </div>
          <div className="space-y-3">
            {stats?.recentActivity.enrollments && stats.recentActivity.enrollments.length > 0 ? (
              stats.recentActivity.enrollments.map((enrollment: any, index: number) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10"
                >
                  <div>
                    <p className="text-white font-medium">
                      {enrollment.studentId?.userId?.firstName} {enrollment.studentId?.userId?.lastName}
                    </p>
                    <p className="text-white/60 text-sm">{enrollment.courseId?.name}</p>
                  </div>
                  <span className="text-xs text-white/60">
                    {new Date(enrollment.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-white/60 text-center py-4">No recent enrollments</p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-6">
        <h2 className="text-white font-semibold mb-4">Popular Courses</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {stats?.popularCourses && stats.popularCourses.length > 0 ? (
            stats.popularCourses.map((course: any, index: number) => (
              <div
                key={index}
                className="p-4 bg-white/5 rounded-lg border border-white/10"
              >
                <h3 className="text-white font-medium">{course.course?.name}</h3>
                <p className="text-white/60 text-sm mb-2">{course.course?.code}</p>
                <div className="flex items-center justify-between">
                  <span className="text-white/60 text-sm">Department:</span>
                  <span className="text-white text-sm">{course.course?.department}</span>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-white/60 text-sm">Enrolled:</span>
                  <span className="text-yellow-400 font-semibold">{course.count} students</span>
                </div>
              </div>
            ))
          ) : (
            <p className="text-white/60 col-span-3 text-center py-4">No popular courses data</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;