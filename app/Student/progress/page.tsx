"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

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
  Loader2
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
      submittedAt: string;
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
    grades?: Array<{
      percentage: number;
      maxMarks: number;
      obtainedMarks: number;
    }>;
  }>;
}

const StudentProgressPage = () => {
  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProgress();
  }, []);

  const fetchProgress = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log("Fetching student progress...");
      const response = await http.get("/student/progress");
      console.log("Progress response:", response.data);
      
      const progressData = response.data.data || response.data;
      console.log("Progress data:", progressData);
      
      setProgress(progressData);
    } catch (error: any) {
      console.error("Error fetching progress:", error);
      const errorMessage = error.response?.data?.msg || "Failed to load progress data";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const calculateCourseProgress = (course: any) => {
    if (course.grades && course.grades.length > 0) {
      const totalPercentage = course.grades.reduce((sum: number, grade: any) => {
        return sum + (grade.percentage || 0);
      }, 0);
      return Math.round(totalPercentage / course.grades.length);
    }
    return course.progress || 0;
  };

  const calculateOverallAverage = () => {
    if (!progress?.courses || progress.courses.length === 0) return 0;
    
    const totalProgress = progress.courses.reduce((sum, course) => {
      return sum + calculateCourseProgress(course);
    }, 0);
    
    return Math.round(totalProgress / progress.courses.length);
  };

  const calculateCompletionRate = () => {
    if (!progress?.courses || progress.courses.length === 0) return 0;
    
    const completedCount = progress.courses.filter(c => 
      c.status === 'completed' || calculateCourseProgress(c) >= 100
    ).length;
    
    return Math.round((completedCount / progress.courses.length) * 100);
  };

  const StatCard = ({ title, value, icon, color }: any) => (
    <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg bg-gradient-to-r ${color}`}>
          {icon}
        </div>
      </div>
      <h3 className="text-white/80 text-sm font-medium mb-1">{title}</h3>
      <p className="text-white text-2xl font-bold">{value}</p>
    </div>
  );

  const ProgressBar = ({ progress, label, showPercentage = true }: { progress: number; label?: string; showPercentage?: boolean }) => (
    <div className="space-y-1">
      {label && (
        <div className="flex items-center justify-between">
          <span className="text-white/80 text-sm font-medium">{label}</span>
          {showPercentage && <span className="text-white font-bold text-sm">{progress}%</span>}
        </div>
      )}
      <div className="w-full bg-white/10 rounded-full h-2.5 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full transition-all duration-300"
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-yellow-400 animate-spin" />
        <span className="ml-2 text-white font-medium">Loading progress...</span>
      </div>
    );
  }

  if (error || !progress) {
    return (
      <div className="text-center py-8">
        <Target className="w-16 h-16 text-white/40 mx-auto mb-4" />
        <p className="text-white font-bold text-xl mb-2">Error Loading Progress</p>
        <p className="text-white/80 mb-6">{error || "No progress data available"}</p>
        <button
          onClick={fetchProgress}
          className="px-6 py-2 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-lg text-white font-bold hover:from-yellow-500 hover:to-orange-500 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  const overallAverage = calculateOverallAverage();
  const realCompletionRate = calculateCompletionRate();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">My Learning Progress</h1>
        <button
          onClick={fetchProgress}
          className="px-4 py-2 bg-white/10 rounded-lg text-white hover:bg-white/20 transition-colors font-medium text-sm"
        >
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Courses"
          value={progress.overview?.totalCourses || progress.courses?.length || 0}
          icon={<BookOpen className="w-6 h-6 text-white" />}
          color="from-blue-400 to-indigo-500"
        />
        <StatCard
          title="In Progress"
          value={progress.overview?.inProgress || progress.courses?.filter(c => c.status === 'enrolled').length || 0}
          icon={<Clock className="w-6 h-6 text-white" />}
          color="from-yellow-400 to-orange-400"
        />
        <StatCard
          title="Completed"
          value={progress.overview?.completedCourses || progress.courses?.filter(c => c.status === 'completed').length || 0}
          icon={<CheckCircle className="w-6 h-6 text-white" />}
          color="from-green-400 to-emerald-500"
        />
        <StatCard
          title="Completion Rate"
          value={`${realCompletionRate}%`}
          icon={<Target className="w-6 h-6 text-white" />}
          color="from-purple-400 to-pink-500"
        />
      </div>

      <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-bold flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-yellow-400" />
            OVERALL PROGRESS
          </h2>
          <span className="text-white text-2xl font-bold">{overallAverage}%</span>
        </div>
        <ProgressBar progress={overallAverage} />
        <p className="text-white/60 text-xs mt-2">
          Based on {progress.courses?.length || 0} course(s)
        </p>
      </div>

      <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-6">
        <h2 className="text-white font-bold mb-4">COURSE PROGRESS</h2>
        <div className="space-y-6">
          {progress.courses && progress.courses.length > 0 ? (
            progress.courses.map((course) => {
              const courseProgress = calculateCourseProgress(course);
              return (
                <div key={course.course.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-bold">{course.course.name}</p>
                      <p className="text-white/80 text-sm font-medium">{course.course.code}</p>
                    </div>
                    <div className="text-right">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${
                          course.status === "completed" || courseProgress >= 100
                            ? "bg-green-600 text-white"
                            : "bg-blue-600 text-white"
                        }`}
                      >
                        {course.status === "completed" || courseProgress >= 100 ? "COMPLETED" : "IN PROGRESS"}
                      </span>
                    </div>
                  </div>
                  <ProgressBar progress={courseProgress} />
                  {course.grades && course.grades.length > 0 && (
                    <p className="text-white/60 text-xs">
                      Based on {course.grades.length} assessment(s)
                    </p>
                  )}
                </div>
              );
            })
          ) : (
            <p className="text-white/60 text-center py-4">No courses enrolled yet</p>
          )}
        </div>
      </div>

      {progress.performance?.monthlyTrend && progress.performance.monthlyTrend.length > 0 && (
        <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-6">
          <h2 className="text-white font-bold mb-4">MONTHLY PERFORMANCE</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {progress.performance.monthlyTrend.map((month) => (
              <div key={month.month} className="text-center p-3 bg-white/5 rounded-lg">
                <p className="text-white/80 text-sm font-medium mb-1">{month.month}</p>
                <p className="text-white font-bold text-lg">{month.average}%</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {progress.performance?.recentGrades && progress.performance.recentGrades.length > 0 && (
        <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-6">
          <h2 className="text-white font-bold mb-4">RECENT GRADES</h2>
          <div className="space-y-3">
            {progress.performance.recentGrades.map((grade) => (
              <div
                key={grade._id}
                className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10"
              >
                <div>
                  <p className="text-white font-bold">{grade.courseId?.name || 'Unknown Course'}</p>
                  <p className="text-white/80 text-sm font-medium">{grade.assessmentName}</p>
                  <p className="text-white/60 text-xs mt-1">
                    {new Date(grade.submittedAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-white font-bold text-xl">{grade.grade || 'N/A'}</p>
                  <p className="text-yellow-400 font-bold">{grade.percentage}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {(!progress.performance?.recentGrades || progress.performance.recentGrades.length === 0) && 
       (!progress.courses || progress.courses.length === 0) && (
        <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-12 text-center">
          <Award className="w-16 h-16 text-white/40 mx-auto mb-4" />
          <h3 className="text-white font-bold text-lg mb-2">No Progress Data</h3>
          <p className="text-white/80">Start learning to see your progress here!</p>
        </div>
      )}
    </div>
  );
};

export default StudentProgressPage;