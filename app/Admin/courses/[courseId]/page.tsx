"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import http from "@/services/http";
import toast from "react-hot-toast";
import { ArrowLeft, User, BookOpen, GraduationCap, Users, Plus, Trash2 } from "lucide-react";

interface Course {
  _id: string;
  name: string;
  code: string;
  description: string;
  credits: number;
  department: string;
  level: string;
  status: string;
  duration: string;
  maxStudents: number;
  teacherId?: {
    _id: string;
    userId: {
      firstName: string;
      lastName: string;
    };
    specialization: string;
  };
  enrolledCount: number;
  enrolledStudents: any[];
  createdAt: string;
}

interface Teacher {
  _id: string;
  userId: {
    firstName: string;
    lastName: string;
  };
  specialization: string;
}

interface Student {
  _id: string;
  userId: {
    firstName: string;
    lastName: string;
    email: string;
  };
  rollNumber: string;
  class: string;
  section: string;
}

const CourseDetailPage = () => {
  const { courseId } = useParams();
  const router = useRouter();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [assignTeacherLoading, setAssignTeacherLoading] = useState(false);
  const [addStudentLoading, setAddStudentLoading] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState("");
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);

  useEffect(() => {
    if (courseId) {
      fetchCourseDetails();
      fetchTeachers();
      fetchStudents();
    }
  }, [courseId]);

  const fetchCourseDetails = async () => {
    try {
      setLoading(true);
      const response = await http.get(`/admin/courses/${courseId}`);
      setCourse(response.data.data);
    } catch (error) {
      console.error("Error fetching course details:", error);
      toast.error("Failed to load course details");
    } finally {
      setLoading(false);
    }
  };

  const fetchTeachers = async () => {
    try {
      const response = await http.get("/admin/teachers?status=active&limit=100");
      setTeachers(response.data.data);
    } catch (error) {
      console.error("Error fetching teachers:", error);
      toast.error("Failed to load teachers");
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await http.get("/admin/students?status=active&limit=100");
      setStudents(response.data.data);
    } catch (error) {
      console.error("Error fetching students:", error);
      toast.error("Failed to load students");
    }
  };

  const handleAssignTeacher = async () => {
    if (!selectedTeacher) {
      toast.error("Please select a teacher");
      return;
    }

    try {
      setAssignTeacherLoading(true);
      await http.put(`/admin/courses/${courseId}`, { teacherId: selectedTeacher });
      toast.success("Teacher assigned successfully");
      fetchCourseDetails();
      setSelectedTeacher("");
    } catch (error) {
      console.error("Error assigning teacher:", error);
      toast.error("Failed to assign teacher");
    } finally {
      setAssignTeacherLoading(false);
    }
  };

  const handleAddStudents = async () => {
    if (selectedStudents.length === 0) {
      toast.error("Please select students to add");
      return;
    }

    try {
      setAddStudentLoading(true);
      const payload = {
        courseId,
        studentIds: selectedStudents
      };
      await http.post("/enrollments/admin/bulk", payload);
      toast.success(`${selectedStudents.length} students added successfully`);
      fetchCourseDetails();
      setSelectedStudents([]);
    } catch (error) {
      console.error("Error adding students:", error);
      toast.error("Failed to add students");
    } finally {
      setAddStudentLoading(false);
    }
  };

  const handleRemoveStudent = async (studentId: string) => {
    try {
      // Find the enrollment ID for this student in this course
      const enrollment = course?.enrolledStudents?.find(
        (e: any) => e.studentId._id === studentId
      );
      
      if (enrollment) {
        await http.delete(`/enrollments/admin/${enrollment._id}`);
        toast.success("Student removed successfully");
        fetchCourseDetails();
      }
    } catch (error) {
      console.error("Error removing student:", error);
      toast.error("Failed to remove student");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-400"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="text-center py-8">
        <p className="text-white">Course not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-lg text-white hover:bg-white/20 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <h1 className="text-2xl font-bold text-white">Course Details</h1>
        <div></div> {/* Spacer */}
      </div>

      <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-yellow-400" />
              Course Information
            </h2>
            <div className="space-y-3">
              <div>
                <p className="text-white/60 text-sm">Name</p>
                <p className="text-white">{course.name}</p>
              </div>
              <div>
                <p className="text-white/60 text-sm">Code</p>
                <p className="text-white">{course.code}</p>
              </div>
              <div>
                <p className="text-white/60 text-sm">Description</p>
                <p className="text-white">{course.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-white/60 text-sm">Credits</p>
                  <p className="text-white">{course.credits}</p>
                </div>
                <div>
                  <p className="text-white/60 text-sm">Duration</p>
                  <p className="text-white">{course.duration}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-white/60 text-sm">Department</p>
                  <p className="text-white">{course.department}</p>
                </div>
                <div>
                  <p className="text-white/60 text-sm">Level</p>
                  <p className="text-white capitalize">{course.level}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-white/60 text-sm">Status</p>
                  <p className="text-white capitalize">{course.status}</p>
                </div>
                <div>
                  <p className="text-white/60 text-sm">Max Students</p>
                  <p className="text-white">{course.maxStudents}</p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-yellow-400" />
              Teacher Assignment
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Current Teacher
                </label>
                {course.teacherId ? (
                  <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                    <p className="text-white">
                      {course.teacherId.userId.firstName} {course.teacherId.userId.lastName}
                    </p>
                    <p className="text-white/60 text-sm">
                      {course.teacherId.specialization}
                    </p>
                  </div>
                ) : (
                  <p className="text-white/60 italic">No teacher assigned</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Assign Teacher
                </label>
                <select
                  value={selectedTeacher}
                  onChange={(e) => setSelectedTeacher(e.target.value)}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-yellow-400"
                >
                  <option value="">Select a teacher</option>
                  {teachers.map((teacher) => (
                    <option key={teacher._id} value={teacher._id}>
                      {teacher.userId.firstName} {teacher.userId.lastName} - {teacher.specialization}
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleAssignTeacher}
                  disabled={assignTeacherLoading || !selectedTeacher}
                  className="mt-2 w-full px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-lg text-white hover:from-yellow-500 hover:to-orange-500 transition-colors disabled:opacity-50"
                >
                  {assignTeacherLoading ? "Assigning..." : "Assign Teacher"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-yellow-400" />
            Students ({course.enrolledCount})
          </h2>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-white/80 mb-2">
            Add Students to Course
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select
              multiple
              value={selectedStudents}
              onChange={(e) => {
                const values = Array.from(e.target.selectedOptions).map(option => option.value);
                setSelectedStudents(values);
              }}
              className="w-full h-32 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-yellow-400"
            >
              {students
                .filter(student => !course.enrolledStudents?.some((enrolled: any) => enrolled.studentId._id === student._id))
                .map((student) => (
                  <option key={student._id} value={student._id}>
                    {student.userId.firstName} {student.userId.lastName} ({student.rollNumber})
                  </option>
                ))}
            </select>
            <div>
              <p className="text-white/60 text-sm mb-2">Selected Students</p>
              <div className="h-32 overflow-y-auto bg-white/5 rounded-lg border border-white/10 p-2">
                {selectedStudents.length > 0 ? (
                  selectedStudents.map(studentId => {
                    const student = students.find(s => s._id === studentId);
                    return (
                      <div key={studentId} className="text-white text-sm py-1 border-b border-white/10 last:border-b-0">
                        {student?.userId.firstName} {student?.userId.lastName}
                      </div>
                    );
                  })
                ) : (
                  <p className="text-white/60 text-sm">No students selected</p>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={handleAddStudents}
            disabled={addStudentLoading || selectedStudents.length === 0}
            className="mt-2 w-full px-4 py-2 bg-gradient-to-r from-green-400 to-teal-400 rounded-lg text-white hover:from-green-500 hover:to-teal-500 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            {addStudentLoading ? "Adding..." : `Add ${selectedStudents.length} Students`}
          </button>
        </div>

        <div>
          <h3 className="text-lg font-medium text-white mb-3">Enrolled Students</h3>
          {course.enrolledStudents && course.enrolledStudents.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/20">
                    <th className="text-left py-2 text-white/80">Name</th>
                    <th className="text-left py-2 text-white/80">Roll Number</th>
                    <th className="text-left py-2 text-white/80">Class</th>
                    <th className="text-left py-2 text-white/80">Section</th>
                    <th className="text-left py-2 text-white/80">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {course.enrolledStudents.map((enrollment: any) => (
                    <tr key={enrollment._id} className="border-b border-white/10">
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-yellow-400" />
                          <span className="text-white">
                            {enrollment.studentId.userId.firstName} {enrollment.studentId.userId.lastName}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 text-white">{enrollment.studentId.rollNumber}</td>
                      <td className="py-3 text-white">{enrollment.studentId.class}</td>
                      <td className="py-3 text-white">{enrollment.studentId.section}</td>
                      <td className="py-3">
                        <button
                          onClick={() => handleRemoveStudent(enrollment.studentId._id)}
                          className="text-red-400 hover:text-red-300 flex items-center gap-1"
                        >
                          <Trash2 className="w-4 h-4" />
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-white/60 text-center py-4">No students enrolled in this course</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseDetailPage;