"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import http from "@/services/http";
import toast from "react-hot-toast";
import { ArrowLeft, Save, Plus, Trash2 } from "lucide-react";

interface Student {
  _id: string;
  enrollmentId: string;
  studentId: string;
  name: string;
  rollNumber: string;
  grades: Grade[];
}

interface Grade {
  _id?: string;
  assessmentType: string;
  assessmentName: string;
  maxMarks: number;
  obtainedMarks: number;
  remarks?: string;
}

interface Course {
  _id: string;
  name: string;
  code: string;
  enrolledCount: number;
}

const TeacherGradesPage = () => {
  const router = useRouter();
  const params = useParams();
  const courseId = params.courseId as string;
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [course, setCourse] = useState<Course | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [assessmentTypes] = useState([
    "quiz", "assignment", "midterm", "final", "project", "participation"
  ]);

  useEffect(() => {
    if (courseId) {
      fetchCourseDetails();
      fetchStudents();
    }
  }, [courseId]);

  const fetchCourseDetails = async () => {
    try {
      const response = await http.get(`/teacher/courses/${courseId}`);
      setCourse(response.data.data);
    } catch (error) {
      console.error("Error fetching course:", error);
      toast.error("Failed to load course details");
    }
  };

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await http.get(`/teacher/courses/${courseId}/students`);
      
      const studentsWithGrades = (response.data.data || []).map((student: any) => ({
        ...student,
        grades: student.grades || [
          {
            assessmentType: "assignment",
            assessmentName: "Assignment 1",
            maxMarks: 100,
            obtainedMarks: 0,
            remarks: "",
          },
        ],
      }));
      
      setStudents(studentsWithGrades);
    } catch (error: any) {
      console.error("Error fetching students:", error);
      toast.error(error.response?.data?.msg || "Failed to load students");
    } finally {
      setLoading(false);
    }
  };

  const handleGradeChange = (studentIndex: number, gradeIndex: number, field: string, value: any) => {
    const updatedStudents = [...students];
    updatedStudents[studentIndex].grades[gradeIndex][field] = value;
    setStudents(updatedStudents);
  };

  const addGradeRow = (studentIndex: number) => {
    const updatedStudents = [...students];
    updatedStudents[studentIndex].grades.push({
      assessmentType: "assignment",
      assessmentName: `Assessment ${updatedStudents[studentIndex].grades.length + 1}`,
      maxMarks: 100,
      obtainedMarks: 0,
      remarks: "",
    });
    setStudents(updatedStudents);
  };

  const removeGradeRow = (studentIndex: number, gradeIndex: number) => {
    const updatedStudents = [...students];
    updatedStudents[studentIndex].grades.splice(gradeIndex, 1);
    setStudents(updatedStudents);
  };

  const saveAllGrades = async () => {
    try {
      setSaving(true);
      
      const gradesData = students.flatMap(student =>
        student.grades.map(grade => ({
          studentId: student.studentId,
          courseId: courseId,
          assessmentType: grade.assessmentType,
          assessmentName: grade.assessmentName,
          maxMarks: grade.maxMarks,
          obtainedMarks: grade.obtainedMarks,
          remarks: grade.remarks,
        }))
      );

      for (const grade of gradesData) {
        if (grade._id) {
          await http.put(`/teacher/grades/${grade._id}`, grade);
        } else {
          await http.post("/teacher/grades", grade);
        }
      }
      
      toast.success("All grades saved successfully");
    } catch (error: any) {
      console.error("Error saving grades:", error);
      toast.error(error.response?.data?.msg || "Failed to save grades");
    } finally {
      setSaving(false);
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
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 bg-white/10 rounded-lg text-white/90 hover:bg-white/20 transition-colors font-bold"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white/95">GRADE MANAGEMENT</h1>
            <p className="text-white/80 font-semibold">{course?.name} ({course?.code})</p>
          </div>
        </div>
        <button
          onClick={saveAllGrades}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-400 to-emerald-500 rounded-lg text-white hover:from-green-500 hover:to-emerald-600 transition-colors disabled:opacity-50 font-bold"
        >
          <Save className="w-4 h-4" />
          {saving ? "SAVING..." : "SAVE ALL GRADES"}
        </button>
      </div>

      <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/20 bg-white/5">
                <th className="px-4 py-3 text-left text-sm font-bold text-white/90">STUDENT</th>
                <th className="px-4 py-3 text-left text-sm font-bold text-white/90">ROLL NO</th>
                <th className="px-4 py-3 text-left text-sm font-bold text-white/90">ASSESSMENT</th>
                <th className="px-4 py-3 text-left text-sm font-bold text-white/90">TYPE</th>
                <th className="px-4 py-3 text-left text-sm font-bold text-white/90">MAX</th>
                <th className="px-4 py-3 text-left text-sm font-bold text-white/90">OBTAINED</th>
                <th className="px-4 py-3 text-left text-sm font-bold text-white/90">%</th>
                <th className="px-4 py-3 text-left text-sm font-bold text-white/90">REMARKS</th>
                <th className="px-4 py-3 text-left text-sm font-bold text-white/90">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student, sIdx) => (
                <React.Fragment key={student.studentId}>
                  {student.grades.map((grade, gIdx) => {
                    const percentage = grade.maxMarks ? ((grade.obtainedMarks / grade.maxMarks) * 100).toFixed(1) : 0;
                    
                    return (
                      <tr key={`${student.studentId}-${gIdx}`} className="border-b border-white/10 last:border-0 hover:bg-white/5">
                        {gIdx === 0 && (
                          <>
                            <td rowSpan={student.grades.length} className="px-4 py-3 text-white/90 align-top font-bold">
                              {student.name || 'N/A'}
                            </td>
                            <td rowSpan={student.grades.length} className="px-4 py-3 text-white/90 align-top font-bold">
                              {student.rollNumber || 'N/A'}
                            </td>
                          </>
                        )}
                        <td className="px-4 py-3">
                          <input
                            type="text"
                            value={grade.assessmentName || ''}
                            onChange={(e) => handleGradeChange(sIdx, gIdx, "assessmentName", e.target.value)}
                            className="w-32 px-2 py-1 bg-white/10 border border-white/20 rounded text-white/90 text-sm font-semibold"
                            placeholder="Name"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <select
                            value={grade.assessmentType || 'assignment'}
                            onChange={(e) => handleGradeChange(sIdx, gIdx, "assessmentType", e.target.value)}
                            className="w-28 px-2 py-1 bg-white/10 border border-white/20 rounded text-white/90 text-sm font-semibold"
                          >
                            {assessmentTypes.map(type => (
                              <option key={type} value={type} className="bg-gray-800 text-white/90 font-bold">
                                {type.toUpperCase()}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            value={grade.maxMarks || 100}
                            onChange={(e) => handleGradeChange(sIdx, gIdx, "maxMarks", parseInt(e.target.value) || 0)}
                            className="w-20 px-2 py-1 bg-white/10 border border-white/20 rounded text-white/90 text-sm font-semibold"
                            min="1"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            value={grade.obtainedMarks || 0}
                            onChange={(e) => handleGradeChange(sIdx, gIdx, "obtainedMarks", parseInt(e.target.value) || 0)}
                            className="w-20 px-2 py-1 bg-white/10 border border-white/20 rounded text-white/90 text-sm font-semibold"
                            min="0"
                            max={grade.maxMarks || 100}
                          />
                        </td>
                        <td className="px-4 py-3 text-white/90 font-bold">
                          {percentage}%
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="text"
                            value={grade.remarks || ''}
                            onChange={(e) => handleGradeChange(sIdx, gIdx, "remarks", e.target.value)}
                            className="w-32 px-2 py-1 bg-white/10 border border-white/20 rounded text-white/90 text-sm font-semibold"
                            placeholder="Remarks"
                          />
                        </td>
                        <td className="px-4 py-3">
                          {gIdx === student.grades.length - 1 ? (
                            <button
                              onClick={() => addGradeRow(sIdx)}
                              className="text-white/80 hover:text-white/80 text-sm font-bold mr-2"
                            >
                              + ADD
                            </button>
                          ) : (
                            <button
                              onClick={() => removeGradeRow(sIdx, gIdx)}
                              className="text-white/80-300 hover:text-red-200 text-sm font-bold"
                            >
                              REMOVE
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {students.length === 0 && (
        <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-12 text-center">
          <p className="text-white/80 font-bold">NO STUDENTS ENROLLED IN THIS COURSE</p>
        </div>
      )}
    </div>
  );
};

export default TeacherGradesPage;