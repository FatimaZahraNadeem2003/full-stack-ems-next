"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import http from "@/services/http";
import toast from "react-hot-toast";
import { BookOpen, Save, ArrowLeft } from "lucide-react";

interface Course {
  _id: string;
  name: string;
  code: string;
  enrolledCount: number;
}

interface Student {
  _id: string;
  enrollmentId: string;
  name: string;
  rollNumber: string;
  grades: Array<{
    _id?: string;
    assessmentType: string;
    assessmentName: string;
    maxMarks: number;
    obtainedMarks: number;
    remarks?: string;
  }>;
}

const GradeManagementPage = () => {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [assessmentTypes] = useState([
    "quiz", "assignment", "midterm", "final", "project", "participation"
  ]);

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      fetchStudents();
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

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await http.get(`/teacher/courses/${selectedCourse}/students`);
      
      const studentsWithGrades = response.data.data.map((student: any) => ({
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
    } catch (error) {
      console.error("Error fetching students:", error);
      toast.error("Failed to load students");
    } finally {
      setLoading(false);
    }
  };

  const handleGradeChange = (studentIndex: number, gradeIndex: number, field: string, value: any) => {
    const updatedStudents = [...students];
    updatedStudents[studentIndex].grades[gradeIndex][field] = value;
    
    if (field === "obtainedMarks" || field === "maxMarks") {
      const grade = updatedStudents[studentIndex].grades[gradeIndex];
      if (grade.maxMarks > 0) {
        grade.percentage = (grade.obtainedMarks / grade.maxMarks) * 100;
      }
    }
    
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
          studentId: student._id,
          courseId: selectedCourse,
          ...grade,
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
    } catch (error) {
      console.error("Error saving grades:", error);
      toast.error("Failed to save grades");
    } finally {
      setSaving(false);
    }
  };

  if (loading && selectedCourse) {
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
            className="p-2 bg-white/10 rounded-lg text-white hover:bg-white/20 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold text-white">Grade Management</h1>
        </div>
        <button
          onClick={saveAllGrades}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-400 to-emerald-500 rounded-lg text-white hover:from-green-500 hover:to-emerald-600 transition-colors disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {saving ? "Saving..." : "Save All Grades"}
        </button>
      </div>

      <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-4">
        <label className="block text-sm font-medium text-white/80 mb-2">
          Select Course
        </label>
        <select
          value={selectedCourse}
          onChange={(e) => setSelectedCourse(e.target.value)}
          className="w-full max-w-md px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-yellow-400"
        >
          {courses.map((course) => (
            <option key={course._id} value={course._id}>
              {course.name} ({course.code}) - {course.enrolledCount || 0} Students
            </option>
          ))}
        </select>
      </div>

      {selectedCourse && (
        <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="px-4 py-3 text-left text-sm font-medium text-white/80">Student</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-white/80">Roll No</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-white/80">Assessment</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-white/80">Type</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-white/80">Max Marks</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-white/80">Obtained</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-white/80">%</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-white/80">Remarks</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-white/80">Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student, sIdx) => (
                  <React.Fragment key={student._id}>
                    {student.grades.map((grade, gIdx) => (
                      <tr key={`${student._id}-${gIdx}`} className="border-b border-white/10 last:border-0">
                        {gIdx === 0 && (
                          <>
                            <td rowSpan={student.grades.length} className="px-4 py-3 text-white align-top">
                              {student.name}
                            </td>
                            <td rowSpan={student.grades.length} className="px-4 py-3 text-white align-top">
                              {student.rollNumber}
                            </td>
                          </>
                        )}
                        <td className="px-4 py-3">
                          <input
                            type="text"
                            value={grade.assessmentName}
                            onChange={(e) => handleGradeChange(sIdx, gIdx, "assessmentName", e.target.value)}
                            className="w-32 px-2 py-1 bg-white/10 border border-white/20 rounded text-white text-sm"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <select
                            value={grade.assessmentType}
                            onChange={(e) => handleGradeChange(sIdx, gIdx, "assessmentType", e.target.value)}
                            className="w-28 px-2 py-1 bg-white/10 border border-white/20 rounded text-white text-sm"
                          >
                            {assessmentTypes.map(type => (
                              <option key={type} value={type}>{type}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            value={grade.maxMarks}
                            onChange={(e) => handleGradeChange(sIdx, gIdx, "maxMarks", parseInt(e.target.value))}
                            className="w-20 px-2 py-1 bg-white/10 border border-white/20 rounded text-white text-sm"
                            min="1"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            value={grade.obtainedMarks}
                            onChange={(e) => handleGradeChange(sIdx, gIdx, "obtainedMarks", parseInt(e.target.value))}
                            className="w-20 px-2 py-1 bg-white/10 border border-white/20 rounded text-white text-sm"
                            min="0"
                            max={grade.maxMarks}
                          />
                        </td>
                        <td className="px-4 py-3 text-white">
                          {grade.maxMarks ? ((grade.obtainedMarks / grade.maxMarks) * 100).toFixed(1) : 0}%
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="text"
                            value={grade.remarks || ""}
                            onChange={(e) => handleGradeChange(sIdx, gIdx, "remarks", e.target.value)}
                            className="w-32 px-2 py-1 bg-white/10 border border-white/20 rounded text-white text-sm"
                            placeholder="Remarks"
                          />
                        </td>
                        <td className="px-4 py-3">
                          {gIdx === student.grades.length - 1 ? (
                            <button
                              onClick={() => addGradeRow(sIdx)}
                              className="text-green-400 hover:text-green-300 text-sm mr-2"
                            >
                              Add
                            </button>
                          ) : (
                            <button
                              onClick={() => removeGradeRow(sIdx, gIdx)}
                              className="text-red-400 hover:text-red-300 text-sm"
                            >
                              Remove
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
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