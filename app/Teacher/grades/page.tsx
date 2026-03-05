"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import http from "@/services/http";
import toast from "react-hot-toast";
import { BookOpen, Save, ArrowLeft, Loader2 } from "lucide-react";

interface Course {
  _id: string;
  name: string;
  code: string;
  enrolledCount: number;
}

interface Grade {
  _id?: string;
  assessmentType: string;
  assessmentName: string;
  maxMarks: number;
  obtainedMarks: number;
  remarks?: string;
  percentage?: number;
}

interface Student {
  _id: string;
  enrollmentId: string;
  name: string;
  rollNumber: string;
  grades: Grade[];
}

const GradeManagementPage = () => {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fetchingGrades, setFetchingGrades] = useState(false);
  const [assessmentTypes] = useState([
    "quiz", "assignment", "midterm", "final", "project", "participation"
  ]);

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      fetchStudentsAndGrades();
    }
  }, [selectedCourse]);

  const fetchCourses = async () => {
    try {
      const response = await http.get("/teacher/courses");
      setCourses(response.data.data);
      if (response.data.data.length > 0) {
        setSelectedCourse(response.data.data[0]._id);
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
      toast.error("Failed to load courses");
    }
  };

  const fetchStudentsAndGrades = async () => {
    if (!selectedCourse) return;
    
    try {
      setLoading(true);
      setFetchingGrades(true);
      
      const studentsRes = await http.get(`/teacher/courses/${selectedCourse}/students`);
      console.log("Students response:", studentsRes.data);
      
      let gradesData = [];
      try {
        const gradesRes = await http.get(`/teacher/grades/course/${selectedCourse}`);
        console.log("Grades response:", gradesRes.data);
        gradesData = gradesRes.data.data || [];
      } catch (error) {
        console.log("No existing grades found");
      }

      const studentsWithGrades = studentsRes.data.data.map((student: any) => {
        const studentId = student.studentId || student._id;
        
        const studentGradesData = gradesData.find((g: any) => g.student?.id === studentId);
        
        let grades: Grade[] = [];
        
        if (studentGradesData && studentGradesData.grades && studentGradesData.grades.length > 0) {
          grades = studentGradesData.grades.map((g: any) => ({
            _id: g.id,
            assessmentType: g.assessmentType,
            assessmentName: g.assessmentName,
            maxMarks: g.maxMarks,
            obtainedMarks: g.obtainedMarks,
            remarks: g.remarks || "",
            percentage: g.percentage
          }));
        } else {
          grades = [{
            assessmentType: "assignment",
            assessmentName: "Assignment 1",
            maxMarks: 100,
            obtainedMarks: 0,
            remarks: "",
            percentage: 0
          }];
        }
        
        return {
          _id: studentId,
          enrollmentId: student.enrollmentId,
          name: student.name,
          rollNumber: student.rollNumber,
          grades: grades
        };
      });
      
      setStudents(studentsWithGrades);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
      setFetchingGrades(false);
    }
  };

  const handleGradeChange = (studentIndex: number, gradeIndex: number, field: string, value: any) => {
    const updatedStudents = [...students];
    
    if (field === "maxMarks" || field === "obtainedMarks") {
      value = value === '' ? 0 : parseInt(value) || 0;
    }
    
    updatedStudents[studentIndex].grades[gradeIndex][field] = value;
    
    const grade = updatedStudents[studentIndex].grades[gradeIndex];
    if (grade.maxMarks > 0) {
      grade.percentage = Number(((grade.obtainedMarks / grade.maxMarks) * 100).toFixed(1));
    } else {
      grade.percentage = 0;
    }
    
    setStudents(updatedStudents);
  };

  const addGradeRow = (studentIndex: number) => {
    const updatedStudents = [...students];
    const newGrade = {
      assessmentType: "assignment",
      assessmentName: `Assessment ${updatedStudents[studentIndex].grades.length + 1}`,
      maxMarks: 100,
      obtainedMarks: 0,
      remarks: "",
      percentage: 0
    };
    
    updatedStudents[studentIndex].grades.push(newGrade);
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
      
      const savePromises = [];
      const savedGrades = [];

      for (const student of students) {
        for (const grade of student.grades) {
          const isDefaultGrade = grade.assessmentName === "Assignment 1" && 
                                 grade.obtainedMarks === 0 && 
                                 !grade.remarks && 
                                 !grade._id;
          
          if (isDefaultGrade) {
            continue;
          }

          const gradeData = {
            studentId: student._id,
            courseId: selectedCourse,
            assessmentType: grade.assessmentType,
            assessmentName: grade.assessmentName,
            maxMarks: grade.maxMarks,
            obtainedMarks: grade.obtainedMarks,
            remarks: grade.remarks || "",
          };

          console.log("Saving grade:", gradeData);

          if (grade._id) {
            const promise = http.put(`/teacher/grades/${grade._id}`, gradeData)
              .then(res => {
                console.log("Grade updated:", res.data);
                savedGrades.push(res.data);
                return res.data;
              });
            savePromises.push(promise);
          } else {
            const promise = http.post("/teacher/grades", gradeData)
              .then(res => {
                console.log("Grade created:", res.data);
                savedGrades.push(res.data);
                return res.data;
              });
            savePromises.push(promise);
          }
        }
      }

      if (savePromises.length === 0) {
        toast.info("No grades to save");
        setSaving(false);
        return;
      }

      await Promise.all(savePromises);
      
      toast.success(`${savePromises.length} grades saved successfully!`);
      
      await fetchStudentsAndGrades();
      
    } catch (error: any) {
      console.error("Error saving grades:", error);
      toast.error(error.response?.data?.msg || "Failed to save grades");
    } finally {
      setSaving(false);
    }
  };

  if (loading && selectedCourse) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-yellow-400 animate-spin" />
        <span className="ml-2 text-white font-medium">Loading students...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 bg-white/10 rounded-lg text-white hover:bg-white/20 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold text-white">Grade Management</h1>
        </div>
        <button
          onClick={saveAllGrades}
          disabled={saving || students.length === 0}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-400 to-emerald-500 rounded-lg text-white hover:from-green-500 hover:to-emerald-600 transition-colors disabled:opacity-50 font-bold"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              SAVING...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              SAVE ALL GRADES
            </>
          )}
        </button>
      </div>

      <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-4">
        <label className="block text-sm font-medium text-white/90 mb-2">
          Select Course
        </label>
        <select
          value={selectedCourse}
          onChange={(e) => setSelectedCourse(e.target.value)}
          className="w-full max-w-md px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white/95 focus:outline-none focus:border-yellow-400 font-medium"
        >
          {courses.map((course) => (
            <option key={course._id} value={course._id} className="bg-gray-800 text-white">
              {course.name} ({course.code}) - {course.enrolledCount || 0} Students
            </option>
          ))}
        </select>
      </div>

      {selectedCourse && students.length === 0 && !loading && (
        <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-8 text-center">
          <BookOpen className="w-12 h-12 text-white/40 mx-auto mb-3" />
          <p className="text-white/80 font-medium">No students enrolled in this course</p>
        </div>
      )}

      {selectedCourse && students.length > 0 && (
        <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 overflow-hidden">
          {fetchingGrades && (
            <div className="p-2 bg-yellow-500/20 text-yellow-400 text-center text-sm font-medium">
              Loading existing grades...
            </div>
          )}
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
                  <React.Fragment key={student._id}>
                    {student.grades.map((grade, gIdx) => {
                      const percentage = grade.percentage || 
                        (grade.maxMarks > 0 ? ((grade.obtainedMarks / grade.maxMarks) * 100).toFixed(1) : 0);
                      
                      return (
                        <tr key={`${student._id}-${gIdx}`} className="border-b border-white/10 last:border-0 hover:bg-white/5">
                          {gIdx === 0 && (
                            <>
                              <td rowSpan={student.grades.length} className="px-4 py-3 text-white font-bold align-top">
                                {student.name}
                              </td>
                              <td rowSpan={student.grades.length} className="px-4 py-3 text-white font-bold align-top">
                                {student.rollNumber}
                              </td>
                            </>
                          )}
                          <td className="px-4 py-3">
                            <input
                              type="text"
                              value={grade.assessmentName || ''}
                              onChange={(e) => handleGradeChange(sIdx, gIdx, "assessmentName", e.target.value)}
                              className="w-32 px-2 py-1 bg-white/10 border border-white/20 rounded text-white/95 text-sm font-semibold"
                              placeholder="Name"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <select
                              value={grade.assessmentType || 'assignment'}
                              onChange={(e) => handleGradeChange(sIdx, gIdx, "assessmentType", e.target.value)}
                              className="w-28 px-2 py-1 bg-white/10 border border-white/20 rounded text-white/95 text-sm font-semibold"
                            >
                              {assessmentTypes.map(type => (
                                <option key={type} value={type} className="bg-gray-800 text-white">
                                  {type.toUpperCase()}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="number"
                              value={grade.maxMarks || 100}
                              onChange={(e) => handleGradeChange(sIdx, gIdx, "maxMarks", e.target.value)}
                              className="w-20 px-2 py-1 bg-white/10 border border-white/20 rounded text-white/95 text-sm font-semibold"
                              min="1"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="number"
                              value={grade.obtainedMarks || 0}
                              onChange={(e) => handleGradeChange(sIdx, gIdx, "obtainedMarks", e.target.value)}
                              className="w-20 px-2 py-1 bg-white/10 border border-white/20 rounded text-white/95 text-sm font-semibold"
                              min="0"
                              max={grade.maxMarks || 100}
                            />
                          </td>
                          <td className="px-4 py-3 text-white font-bold">
                            {percentage}%
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="text"
                              value={grade.remarks || ''}
                              onChange={(e) => handleGradeChange(sIdx, gIdx, "remarks", e.target.value)}
                              className="w-32 px-2 py-1 bg-white/10 border border-white/20 rounded text-white/95 text-sm font-semibold"
                              placeholder="Remarks"
                            />
                          </td>
                          <td className="px-4 py-3">
                            {gIdx === student.grades.length - 1 ? (
                              <button
                                onClick={() => addGradeRow(sIdx)}
                                className="text-green-400 hover:text-green-300 text-sm font-bold mr-2"
                              >
                                + ADD
                              </button>
                            ) : (
                              <button
                                onClick={() => removeGradeRow(sIdx, gIdx)}
                                className="text-red-400 hover:text-red-300 text-sm font-bold"
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
      )}
    </div>
  );
};

export default GradeManagementPage;