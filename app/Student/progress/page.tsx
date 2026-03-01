"use client";

import React, { useState, useEffect } from "react";
import http from "@/services/http";
import toast from "react-hot-toast";
import {
  TrendingUp,
  BookOpen,
  Award,
  Clock,
  CheckCircle,
  Target,
} from "lucide-react";

interface ProgressData {
  overview: {
    totalCourses: number;
    completedCourses: number;
    inProgress: number;
    averageProgress: number;
    completionRate: string;
  };
  performance: {
    monthlyTrend: Array<{
      month: string;
      average: string;
    }>;
    recentGrades: Array<{
      _id: string;
      courseId: {
        name: string;
        code: string;
      };
      assessmentName: string;
      grade: string;
      percentage: number;
    }>;
  };
  courses: Array<{
    course: {
      id: string;
      name: string;
      code: string;
      credits: number;
    };
    progress: number;
    status: string;
    enrollmentDate: string;
  }>;
}

const StudentProgressPage = () => {
  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProgress();
  }, []);

  const fetchProgress = async () => {
    try {
      setLoading(true);
      const response = await http.get("/student/progress");
      setProgress(response.data.data);
    } catch (error: any) {
      console.error("Error fetching progress:", error);
      toast.error(error.response?.data?.msg || "Failed to load progress data");
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon, color, subtitle }: any) => (
    <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg bg-gradient-to-r ${color}`}>
          {icon}
        </div>
        {subtitle && <span className="text-white/60 text-sm">{subtitle}</span>}
      </div>
      <h3 className="text-white/60 text-sm mb-1">{title}</h3>
      <p className="text-white text-2xl font-bold">{value}</p>
    </div>
  );

  const ProgressBar = ({ progress, label }: { progress: number; label?: string }) => (
    <div className="space-y-1">
      {label && (
        <div className="flex items-center justify-between">
          <span className="text-white/60 text-sm">{label}</span>
          <span className="text-white text-sm">{progress}%</span>
        </div>
      )}
      <div className="w-full bg-white/10 rounded-full h-2">
        <div
          className="bg-gradient-to-r from-yellow-400 to-orange-400 h-2 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
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

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">My Learning Progress</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Courses"
          value={progress?.overview.totalCourses}
          icon={<BookOpen className="w-6 h-6 text-white" />}
          color="from-blue-400 to-indigo-500"
        />
        <StatCard
          title="In Progress"
          value={progress?.overview.inProgress}
          icon={<Clock className="w-6 h-6 text-white" />}
          color="from-yellow-400 to-orange-400"
        />
        <StatCard
          title="Completed"
          value={progress?.overview.completedCourses}
          icon={<CheckCircle className="w-6 h-6 text-white" />}
          color="from-green-400 to-emerald-500"
        />
        <StatCard
          title="Completion Rate"
          value={`${progress?.overview.completionRate}%`}
          icon={<Target className="w-6 h-6 text-white" />}
          color="from-purple-400 to-pink-500"
        />
      </div>

      <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-semibold flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-yellow-400" />
            Overall Progress
          </h2>
          <span className="text-white text-xl font-bold">
            {progress?.overview.averageProgress}%
          </span>
        </div>
        <ProgressBar progress={progress?.overview.averageProgress || 0} />
      </div>

      <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-6">
        <h2 className="text-white font-semibold mb-4">Course Progress</h2>
        <div className="space-y-4">
          {progress?.courses.map((course) => (
            <div key={course.course.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">{course.course.name}</p>
                  <p className="text-white/60 text-sm">{course.course.code}</p>
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
              <ProgressBar progress={course.progress} />
            </div>
          ))}
        </div>
      </div>

      {progress?.performance.monthlyTrend && progress.performance.monthlyTrend.length > 0 && (
        <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-6">
          <h2 className="text-white font-semibold mb-4">Monthly Performance Trend</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {progress.performance.monthlyTrend.map((month) => (
              <div key={month.month} className="text-center">
                <p className="text-white/60 text-sm mb-1">{month.month}</p>
                <p className="text-white font-bold text-lg">{month.average}%</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {progress?.performance.recentGrades && progress.performance.recentGrades.length > 0 && (
        <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-6">
          <h2 className="text-white font-semibold mb-4">Recent Grades</h2>
          <div className="space-y-3">
            {progress.performance.recentGrades.map((grade) => (
              <div
                key={grade._id}
                className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
              >
                <div>
                  <p className="text-white font-medium">{grade.courseId?.name}</p>
                  <p className="text-white/60 text-sm">{grade.assessmentName}</p>
                </div>
                <div className="text-right">
                  <p className="text-white font-bold">{grade.grade}</p>
                  <p className="text-white/60 text-xs">{grade.percentage}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentProgressPage;