"use client";

import React, { useState, useEffect } from "react";
import http from "@/services/http";
import toast from "react-hot-toast";
import { Award, BookOpen, TrendingUp, ChevronDown, ChevronUp } from "lucide-react";

interface CourseGrade {
  course: {
    id: string;
    name: string;
    code: string;
    credits: number;
  };
  grades: Array<{
    assessmentType: string;
    assessmentName: string;
    maxMarks: number;
    obtainedMarks: number;
    percentage: number;
    grade: string;
    submittedAt: string;
    remarks?: string;
  }>;
  courseAverage: string;
}

interface GradesData {
  statistics: {
    totalGrades: number;
    overallPercentage: string;
    totalCourses: number;
    gpa: string;
  };
  data: CourseGrade[];
}

const StudentGradesPage = () => {
  const [grades, setGrades] = useState<GradesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedCourses, setExpandedCourses] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchGrades();
  }, []);

  const fetchGrades = async () => {
    try {
      setLoading(true);
      const response = await http.get("/student/grades");
      setGrades(response.data);
      
      if (response.data.data.length > 0) {
        setExpandedCourses(new Set([response.data.data[0].course.id]));
      }
    } catch (error: any) {
      console.error("Error fetching grades:", error);
      toast.error(error.response?.data?.msg || "Failed to load grades");
    } finally {
      setLoading(false);
    }
  };

  const toggleCourse = (courseId: string) => {
    const newExpanded = new Set(expandedCourses);
    if (newExpanded.has(courseId)) {
      newExpanded.delete(courseId);
    } else {
      newExpanded.add(courseId);
    }
    setExpandedCourses(newExpanded);
  };

  const getGradeColor = (grade: string) => {
    if (grade.startsWith('A')) return "text-green-400";
    if (grade.startsWith('B')) return "text-blue-400";
    if (grade.startsWith('C')) return "text-yellow-400";
    if (grade.startsWith('D')) return "text-orange-400";
    if (grade === 'F') return "text-red-400";
    return "text-white";
  };

  const StatCard = ({ title, value, icon, color }: any) => (
    <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-6">
      <div className="flex items-center gap-3 mb-2">
        <div className={`p-2 rounded-lg bg-gradient-to-r ${color}`}>
          {icon}
        </div>
        <h3 className="text-white/60 text-sm">{title}</h3>
      </div>
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
      <h1 className="text-2xl font-bold text-white">My Grades</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Overall Percentage"
          value={`${grades?.statistics.overallPercentage}%`}
          icon={<TrendingUp className="w-5 h-5 text-white" />}
          color="from-blue-400 to-indigo-500"
        />
        <StatCard
          title="GPA"
          value={grades?.statistics.gpa}
          icon={<Award className="w-5 h-5 text-white" />}
          color="from-green-400 to-emerald-500"
        />
        <StatCard
          title="Total Courses"
          value={grades?.statistics.totalCourses}
          icon={<BookOpen className="w-5 h-5 text-white" />}
          color="from-purple-400 to-pink-500"
        />
        <StatCard
          title="Total Assessments"
          value={grades?.statistics.totalGrades}
          icon={<Award className="w-5 h-5 text-white" />}
          color="from-orange-400 to-red-500"
        />
      </div>

      <div className="space-y-4">
        {grades?.data.map((courseGrade) => (
          <div
            key={courseGrade.course.id}
            className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 overflow-hidden"
          >
            <div
              className="p-4 bg-white/5 cursor-pointer hover:bg-white/10 transition-colors"
              onClick={() => toggleCourse(courseGrade.course.id)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-white font-semibold">{courseGrade.course.name}</h3>
                  <p className="text-white/60 text-sm">
                    {courseGrade.course.code} • {courseGrade.course.credits} Credits
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-white/60 text-xs">Course Average</p>
                    <p className="text-white font-bold">{courseGrade.courseAverage}%</p>
                  </div>
                  {expandedCourses.has(courseGrade.course.id) ? (
                    <ChevronUp className="w-5 h-5 text-white/60" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-white/60" />
                  )}
                </div>
              </div>
            </div>

            {expandedCourses.has(courseGrade.course.id) && (
              <div className="p-4 overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/20">
                      <th className="px-4 py-2 text-left text-sm font-medium text-white/80">Assessment</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-white/80">Type</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-white/80">Max Marks</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-white/80">Obtained</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-white/80">Percentage</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-white/80">Grade</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-white/80">Date</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-white/80">Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {courseGrade.grades.map((grade, index) => (
                      <tr key={index} className="border-b border-white/10 last:border-0">
                        <td className="px-4 py-3 text-white">{grade.assessmentName}</td>
                        <td className="px-4 py-3 text-white/80 capitalize">{grade.assessmentType}</td>
                        <td className="px-4 py-3 text-white">{grade.maxMarks}</td>
                        <td className="px-4 py-3 text-white">{grade.obtainedMarks}</td>
                        <td className="px-4 py-3 text-white">{grade.percentage.toFixed(1)}%</td>
                        <td className={`px-4 py-3 font-bold ${getGradeColor(grade.grade)}`}>
                          {grade.grade}
                        </td>
                        <td className="px-4 py-3 text-white/60 text-sm">
                          {new Date(grade.submittedAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 text-white/60 text-sm">
                          {grade.remarks || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ))}

        {grades?.data.length === 0 && (
          <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-8 text-center">
            <Award className="w-12 h-12 text-white/40 mx-auto mb-3" />
            <p className="text-white/60">No grades available yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentGradesPage;