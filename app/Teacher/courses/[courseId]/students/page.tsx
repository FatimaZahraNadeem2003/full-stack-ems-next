"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import http from "@/services/http";
import toast from "react-hot-toast";
import { ArrowLeft, Users, Search, Download, Plus, Trash2 } from "lucide-react";
import DataTable from "@/app/components/ui/DataTable";

interface Student {
  _id?: string;
  enrollmentId: string;
  studentId: string;
  name: string;
  email: string;
  rollNumber: string;
  class: string;
  section: string;
  enrollmentDate: string;
  status: string;
  progress: number;
}

interface Course {
  _id: string;
  name: string;
  code: string;
  description: string;
}

const CourseStudentsPage = () => {
  const params = useParams();
  const router = useRouter();
  const courseId = params.courseId as string;
  
  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState<Course | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [search, setSearch] = useState("");
  const [allStudents, setAllStudents] = useState<any[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [addStudentLoading, setAddStudentLoading] = useState(false);

  useEffect(() => {
    fetchCourseDetails();
    fetchStudents();
    fetchAllStudents();
  }, [courseId]);

  const fetchAllStudents = async () => {
    try {
      const response = await http.get("/admin/students?status=active&limit=100");
      setAllStudents(response.data.data);
    } catch (error) {
      console.error("Error fetching all students:", error);
      toast.error("Failed to load students");
    }
  };

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
      setStudents(response.data.data);
    } catch (error) {
      console.error("Error fetching students:", error);
      toast.error("Failed to load students");
    } finally {
      setLoading(false);
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
      await http.post("/enrollments/teacher/enroll", payload);
      toast.success(`${selectedStudents.length} students added successfully`);
      fetchStudents();
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
      const student = students.find(s => s.studentId === studentId);
      
      if (student && student.enrollmentId) {
        await http.delete(`/enrollments/teacher/enroll/${student.enrollmentId}`);
        toast.success("Student removed successfully");
        fetchStudents();
      }
    } catch (error) {
      console.error("Error removing student:", error);
      toast.error("Failed to remove student");
    }
  };

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(search.toLowerCase()) ||
    student.email.toLowerCase().includes(search.toLowerCase()) ||
    student.rollNumber.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    { key: "rollNumber", header: "Roll No" },
    { key: "name", header: "Student Name" },
    { key: "email", header: "Email" },
    { key: "class", header: "Class" },
    { key: "section", header: "Section" },
    {
      key: "status",
      header: "Status",
      render: (student: Student) => (
        <span
          className={`px-2 py-1 rounded-full text-xs ${
            student.status === "enrolled"
              ? "bg-green-500/20 text-green-400"
              : student.status === "completed"
              ? "bg-blue-500/20 text-blue-400"
              : "bg-yellow-500/20 text-yellow-400"
          }`}
        >
          {student.status}
        </span>
      ),
    },
    {
      key: "progress",
      header: "Progress",
      render: (student: Student) => (
        <div className="w-24">
          <div className="flex items-center justify-between mb-1">
            <span className="text-white text-xs">{student.progress || 0}%</span>
          </div>
          <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-yellow-400 to-orange-400"
              style={{ width: `${student.progress || 0}%` }}
            />
          </div>
        </div>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (student: Student) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleRemoveStudent(student.studentId);
          }}
          className="text-red-400 hover:text-red-300 flex items-center gap-1"
        >
          <Trash2 className="w-4 h-4" />
          Remove
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 bg-white/10 rounded-lg text-white hover:bg-white/20 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white">{course?.name}</h1>
          <p className="text-white/60">{course?.code} - Enrolled Students</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Users className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-white/60 text-sm">Total Students</p>
              <p className="text-white text-xl font-bold">{students.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <Users className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-white/60 text-sm">Enrolled</p>
              <p className="text-white text-xl font-bold">
                {students.filter(s => s.status === "enrolled").length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <Users className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-white/60 text-sm">Completed</p>
              <p className="text-white text-xl font-bold">
                {students.filter(s => s.status === "completed").length}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search students..."
            className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-yellow-400"
          />
        </div>
        <button
          onClick={() => router.push(`/Teacher/courses/${courseId}/grades`)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-lg text-white hover:from-yellow-500 hover:to-orange-500 transition-colors"
        >
          Manage Grades
        </button>
      </div>

      <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-6">
        <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-yellow-400" />
          Add Students to Course
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <select
            multiple
            value={selectedStudents}
            onChange={(e) => {
              const values = Array.from(e.target.selectedOptions).map(option => option.value);
              setSelectedStudents(values);
            }}
            className="w-full h-32 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-yellow-400"
          >
            {allStudents
              .filter(student => !students.some(s => s.studentId === student._id))
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
                  const student = allStudents.find(s => s._id === studentId);
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
          className="w-full px-4 py-2 bg-gradient-to-r from-green-400 to-teal-400 rounded-lg text-white hover:from-green-500 hover:to-teal-500 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          {addStudentLoading ? "Adding..." : `Add ${selectedStudents.length} Students`}
        </button>
      </div>

      <DataTable
        columns={columns}
        data={filteredStudents}
        loading={loading}
        onView={(student) => router.push(`/Teacher/students/${student.studentId}`)}
      />
    </div>
  );
};

export default CourseStudentsPage;