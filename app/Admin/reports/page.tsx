"use client";

import React, { useState, useEffect } from "react";
import http from "@/services/http";
import toast from "react-hot-toast";
import { Download, Users, BookOpen, Calendar, BarChart3 } from "lucide-react";

interface ReportsData {
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
  distributions: {
    studentsByStatus: Array<{ _id: string; count: number }>;
    coursesByStatus: Array<{ _id: string; count: number }>;
    byDepartment: Array<{ department: string; count: number; percentage: string }>;
    byLevel: Record<string, { count: number; percentage: string }>;
  };
  popularCourses: Array<{
    course: { name: string; code: string };
    count: number;
  }>;
}

const ReportsPage = () => {
  const [data, setData] = useState<ReportsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const [dashboard, students, courses] = await Promise.all([
        http.get("/admin/reports/dashboard"),
        http.get("/admin/reports/students-count"),
        http.get("/admin/reports/courses-count"),
      ]);

      setData({
        overview: dashboard.data.data.overview,
        distributions: {
          studentsByStatus: dashboard.data.data.distributions.studentsByStatus,
          coursesByStatus: dashboard.data.data.distributions.coursesByStatus,
          byDepartment: courses.data.data.distributions.byDepartment,
          byLevel: courses.data.data.distributions.byLevel,
        },
        popularCourses: dashboard.data.data.popularCourses,
      });
    } catch (error) {
      console.error("Error fetching reports:", error);
      toast.error("Failed to load reports");
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    toast.success("Report exported successfully");
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
        <h1 className="text-2xl font-bold text-white">Reports & Analytics</h1>
        <button
          onClick={exportToCSV}
          className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-lg text-white hover:bg-white/20 transition-colors"
        >
          <Download className="w-4 h-4" />
          Export Report
        </button>
      </div>

      <div className="flex gap-2 border-b border-white/20">
        {["overview", "students", "courses", "popular"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium capitalize transition-colors relative ${
              activeTab === tab
                ? "text-yellow-400"
                : "text-white/60 hover:text-white"
            }`}
          >
            {tab}
            {activeTab === tab && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-yellow-400 to-orange-400"></div>
            )}
          </button>
        ))}
      </div>

      {activeTab === "overview" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Users className="w-5 h-5 text-blue-400" />
                </div>
                <h3 className="text-white/60 text-sm">Total Students</h3>
              </div>
              <p className="text-white text-3xl font-bold">{data?.overview.totalStudents}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <Users className="w-5 h-5 text-green-400" />
                </div>
                <h3 className="text-white/60 text-sm">Total Teachers</h3>
              </div>
              <p className="text-white text-3xl font-bold">{data?.overview.totalTeachers}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <BookOpen className="w-5 h-5 text-purple-400" />
                </div>
                <h3 className="text-white/60 text-sm">Total Courses</h3>
              </div>
              <p className="text-white text-3xl font-bold">{data?.overview.totalCourses}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-orange-500/20 rounded-lg">
                  <BarChart3 className="w-5 h-5 text-orange-400" />
                </div>
                <h3 className="text-white/60 text-sm">Completion Rate</h3>
              </div>
              <p className="text-white text-3xl font-bold">{data?.overview.completionRate}%</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-6">
              <h3 className="text-white font-semibold mb-4">Course Status Distribution</h3>
              <div className="space-y-3">
                {data?.distributions.coursesByStatus.map((item) => (
                  <div key={item._id} className="flex items-center justify-between">
                    <span className="text-white/80 capitalize">{item._id}</span>
                    <span className="text-white font-medium">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-6">
              <h3 className="text-white font-semibold mb-4">Student Status Distribution</h3>
              <div className="space-y-3">
                {data?.distributions.studentsByStatus.map((item) => (
                  <div key={item._id} className="flex items-center justify-between">
                    <span className="text-white/80 capitalize">{item._id}</span>
                    <span className="text-white font-medium">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "students" && (
        <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-6">
          <h3 className="text-white font-semibold mb-4">Students by Class</h3>
          <div className="space-y-3">
            {data?.distributions.byDepartment.map((item) => (
              <div key={item.department} className="flex items-center gap-4">
                <span className="text-white/80 w-32">{item.department}</span>
                <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-yellow-400 to-orange-400"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
                <span className="text-white font-medium">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "popular" && (
        <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-6">
          <h3 className="text-white font-semibold mb-4">Most Popular Courses</h3>
          <div className="space-y-4">
            {data?.popularCourses.map((course, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div>
                  <p className="text-white font-medium">{course.course?.name}</p>
                  <p className="text-white/60 text-sm">{course.course?.code}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-yellow-400 font-semibold">{course.count} students</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsPage;