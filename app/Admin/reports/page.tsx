"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

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

interface DetailedData {
  students: any[];
  courses: any[];
  enrollments: any[];
  teachers: any[];
}

const ReportsPage = () => {
  const [data, setData] = useState<ReportsData | null>(null);
  const [detailedData, setDetailedData] = useState<DetailedData | null>(null);
  const [loading, setLoading] = useState(true);
  const [exportLoading, setExportLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    fetchReports();
    fetchDetailedData();
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

  const fetchDetailedData = async () => {
    try {
      const [students, courses, enrollments, teachers] = await Promise.all([
        http.get("/admin/students?limit=1000"),
        http.get("/admin/courses?limit=1000"),
        http.get("/admin/enrollments?limit=1000"),
        http.get("/admin/teachers?limit=1000"),
      ]);

      setDetailedData({
        students: students.data.data || [],
        courses: courses.data.data || [],
        enrollments: enrollments.data.data || [],
        teachers: teachers.data.data || [],
      });
    } catch (error) {
      console.error("Error fetching detailed data:", error);
    }
  };

  const exportToCSV = async () => {
    try {
      setExportLoading(true);
      
      let exportData = detailedData;
      if (!exportData) {
        await fetchDetailedData();
        exportData = detailedData;
      }

      let csvContent = "EDUCATION MANAGEMENT SYSTEM - COMPREHENSIVE REPORT\n";
      csvContent += `Generated on: ${new Date().toLocaleString()}\n\n`;

      csvContent += "=== OVERVIEW STATISTICS ===\n";
      csvContent += `Total Students,${data?.overview.totalStudents || 0}\n`;
      csvContent += `Total Teachers,${data?.overview.totalTeachers || 0}\n`;
      csvContent += `Total Courses,${data?.overview.totalCourses || 0}\n`;
      csvContent += `Total Enrollments,${data?.overview.totalEnrollments || 0}\n`;
      csvContent += `Active Courses,${data?.overview.activeCourses || 0}\n`;
      csvContent += `Active Enrollments,${data?.overview.activeEnrollments || 0}\n`;
      csvContent += `Completion Rate,${data?.overview.completionRate || 0}%\n`;
      csvContent += `Avg Students Per Course,${data?.overview.avgStudentsPerCourse || 0}\n\n`;

      csvContent += "=== STUDENT STATUS DISTRIBUTION ===\n";
      csvContent += "Status,Count\n";
      data?.distributions.studentsByStatus.forEach((item) => {
        csvContent += `${item._id || 'unknown'},${item.count}\n`;
      });
      csvContent += "\n";

      csvContent += "=== COURSE STATUS DISTRIBUTION ===\n";
      csvContent += "Status,Count\n";
      data?.distributions.coursesByStatus.forEach((item) => {
        csvContent += `${item._id || 'unknown'},${item.count}\n`;
      });
      csvContent += "\n";

      csvContent += "=== DEPARTMENT DISTRIBUTION ===\n";
      csvContent += "Department,Count,Percentage\n";
      data?.distributions.byDepartment.forEach((item) => {
        csvContent += `${item.department},${item.count},${item.percentage}%\n`;
      });
      csvContent += "\n";

      csvContent += "=== COURSE LEVEL DISTRIBUTION ===\n";
      csvContent += "Level,Count,Percentage\n";
      Object.entries(data?.distributions.byLevel || {}).forEach(([level, info]) => {
        csvContent += `${level},${info.count},${info.percentage}%\n`;
      });
      csvContent += "\n";

      csvContent += "=== MOST POPULAR COURSES ===\n";
      csvContent += "Course Name,Course Code,Enrolled Students\n";
      data?.popularCourses.forEach((item) => {
        csvContent += `${item.course?.name || 'N/A'},${item.course?.code || 'N/A'},${item.count}\n`;
      });
      csvContent += "\n";

      if (exportData?.students && exportData.students.length > 0) {
        csvContent += "=== DETAILED STUDENTS LIST ===\n";
        csvContent += "ID,Name,Email,Roll Number,Class,Section,Status,Admission Date\n";
        exportData.students.forEach((student: any) => {
          const name = student.userId ? 
            `${student.userId.firstName || ''} ${student.userId.lastName || ''}`.trim() : 
            'N/A';
          const email = student.userId?.email || 'N/A';
          csvContent += `${student._id || 'N/A'},"${name}",${email},${student.rollNumber || 'N/A'},${student.class || 'N/A'},${student.section || 'N/A'},${student.status || 'N/A'},${student.admissionDate ? new Date(student.admissionDate).toLocaleDateString() : 'N/A'}\n`;
        });
        csvContent += "\n";
      }

      if (exportData?.teachers && exportData.teachers.length > 0) {
        csvContent += "=== DETAILED TEACHERS LIST ===\n";
        csvContent += "ID,Name,Email,Employee ID,Qualification,Specialization,Experience,Status\n";
        exportData.teachers.forEach((teacher: any) => {
          const name = teacher.userId ? 
            `${teacher.userId.firstName || ''} ${teacher.userId.lastName || ''}`.trim() : 
            'N/A';
          const email = teacher.userId?.email || 'N/A';
          csvContent += `${teacher._id || 'N/A'},"${name}",${email},${teacher.employeeId || 'N/A'},${teacher.qualification || 'N/A'},${teacher.specialization || 'N/A'},${teacher.experience || 0},${teacher.status || 'N/A'}\n`;
        });
        csvContent += "\n";
      }

      if (exportData?.courses && exportData.courses.length > 0) {
        csvContent += "=== DETAILED COURSES LIST ===\n";
        csvContent += "ID,Name,Code,Department,Credits,Level,Status,Max Students,Enrolled Count\n";
        exportData.courses.forEach((course: any) => {
          csvContent += `${course._id || 'N/A'},${course.name || 'N/A'},${course.code || 'N/A'},${course.department || 'N/A'},${course.credits || 0},${course.level || 'N/A'},${course.status || 'N/A'},${course.maxStudents || 0},${course.enrolledCount || 0}\n`;
        });
        csvContent += "\n";
      }

      if (exportData?.enrollments && exportData.enrollments.length > 0) {
        csvContent += "=== DETAILED ENROLLMENTS LIST ===\n";
        csvContent += "ID,Student Name,Course Name,Enrollment Date,Status,Progress,Grade\n";
        exportData.enrollments.forEach((enrollment: any) => {
          const studentName = enrollment.studentId?.userId ? 
            `${enrollment.studentId.userId.firstName || ''} ${enrollment.studentId.userId.lastName || ''}`.trim() : 
            'N/A';
          const courseName = enrollment.courseId?.name || 'N/A';
          csvContent += `${enrollment._id || 'N/A'},"${studentName}","${courseName}",${enrollment.enrollmentDate ? new Date(enrollment.enrollmentDate).toLocaleDateString() : 'N/A'},${enrollment.status || 'N/A'},${enrollment.progress || 0}%,${enrollment.grade || 'N/A'}\n`;
        });
      }

      csvContent += "\n=== GRADE STATISTICS ===\n";
      csvContent += "Category,Count\n";
      
      const completedEnrollments = exportData?.enrollments?.filter((e: any) => e.status === 'completed') || [];
      const passedCount = completedEnrollments.filter((e: any) => 
        e.grade && !['F', 'Incomplete', 'Not Graded'].includes(e.grade)
      ).length;
      const failedCount = completedEnrollments.filter((e: any) => 
        e.grade === 'F'
      ).length;
      const inProgressCount = exportData?.enrollments?.filter((e: any) => e.status === 'enrolled').length || 0;
      const droppedCount = exportData?.enrollments?.filter((e: any) => e.status === 'dropped').length || 0;

      csvContent += `Total Enrollments,${exportData?.enrollments?.length || 0}\n`;
      csvContent += `Completed,${completedEnrollments.length}\n`;
      csvContent += `Passed,${passedCount}\n`;
      csvContent += `Failed,${failedCount}\n`;
      csvContent += `In Progress,${inProgressCount}\n`;
      csvContent += `Dropped,${droppedCount}\n`;

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.href = url;
      link.setAttribute('download', `education_report_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success("Report exported successfully!");
    } catch (error) {
      console.error("Error exporting report:", error);
      toast.error("Failed to export report");
    } finally {
      setExportLoading(false);
    }
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
          disabled={exportLoading}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-400 to-emerald-500 rounded-lg text-white hover:from-green-500 hover:to-emerald-600 transition-colors font-bold disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          {exportLoading ? "Exporting..." : "Export Report"}
        </button>
      </div>

      <div className="flex gap-2 border-b border-white/20">
        {["overview", "students", "courses", "popular"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-bold capitalize transition-colors relative ${
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
                <h3 className="text-white/80 text-sm font-bold">Total Students</h3>
              </div>
              <p className="text-white text-3xl font-bold">{data?.overview.totalStudents}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-white/80 text-sm font-bold">Total Teachers</h3>
              </div>
              <p className="text-white text-3xl font-bold">{data?.overview.totalTeachers}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <BookOpen className="w-5 h-5 text-purple-400" />
                </div>
                <h3 className="text-white/80 text-sm font-bold">Total Courses</h3>
              </div>
              <p className="text-white text-3xl font-bold">{data?.overview.totalCourses}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-orange-500/20 rounded-lg">
                  <BarChart3 className="w-5 h-5 text-orange-400" />
                </div>
                <h3 className="text-white/80 text-sm font-bold">Completion Rate</h3>
              </div>
              <p className="text-white text-3xl font-bold">{data?.overview.completionRate}%</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-6">
              <h3 className="text-white font-bold mb-4">Course Status Distribution</h3>
              <div className="space-y-3">
                {data?.distributions.coursesByStatus.map((item) => (
                  <div key={item._id} className="flex items-center justify-between">
                    <span className="text-white/90 font-medium capitalize">{item._id}</span>
                    <span className="text-white font-bold">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-6">
              <h3 className="text-white font-bold mb-4">Student Status Distribution</h3>
              <div className="space-y-3">
                {data?.distributions.studentsByStatus.map((item) => (
                  <div key={item._id} className="flex items-center justify-between">
                    <span className="text-white/90 font-medium capitalize">{item._id}</span>
                    <span className="text-white font-bold">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "students" && (
        <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-6">
          <h3 className="text-white font-bold mb-4">Students by Class</h3>
          <div className="space-y-3">
            {data?.distributions.byDepartment.map((item) => (
              <div key={item.department} className="flex items-center gap-4">
                <span className="text-white/90 font-medium w-32">{item.department}</span>
                <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-yellow-400 to-orange-400"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
                <span className="text-white font-bold">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "popular" && (
        <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-6">
          <h3 className="text-white font-bold mb-4">Most Popular Courses</h3>
          <div className="space-y-4">
            {data?.popularCourses.map((course, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div>
                  <p className="text-white font-bold">{course.course?.name}</p>
                  <p className="text-white/80 text-sm font-medium">{course.course?.code}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-yellow-400 font-bold">{course.count} students</span>
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