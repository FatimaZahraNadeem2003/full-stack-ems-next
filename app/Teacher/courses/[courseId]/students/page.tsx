"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import http from "@/services/http";
import toast from "react-hot-toast";
import { ArrowLeft, Users, Search } from "lucide-react";
import DataTable from "@/app/components/ui/DataTable";

interface Student {
  _id?: string;
  enrollmentId: string;
  studentId: string;
  name: string;
  email: string;
  rollNumber?: string;
  class?: string;
  section?: string;
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
      console.log("Students response:", response.data);
      setStudents(response.data.data || []);
    } catch (error: any) {
      console.error("Error fetching students:", error);
      toast.error(error.response?.data?.msg || "Failed to load students");
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter(student => {
    const searchLower = search.toLowerCase();
    const name = student.name || "";
    const email = student.email || "";
    const rollNumber = student.rollNumber || "";
    
    return (
      name.toLowerCase().includes(searchLower) ||
      email.toLowerCase().includes(searchLower) ||
      rollNumber.toLowerCase().includes(searchLower)
    );
  });

  const columns = [
    { 
      key: "rollNumber", 
      header: "Roll No",
      render: (student: Student) => (
        <span className="text-white font-medium">{student.rollNumber || 'N/A'}</span>
      )
    },
    { 
      key: "name", 
      header: "Student Name",
      render: (student: Student) => (
        <span className="text-white font-bold">{student.name || 'N/A'}</span>
      )
    },
    { 
      key: "email", 
      header: "Email",
      render: (student: Student) => (
        <span className="text-white font-medium">{student.email || 'N/A'}</span>
      )
    },
    { 
      key: "class", 
      header: "Class",
      render: (student: Student) => (
        <span className="text-white font-medium">{student.class || 'N/A'}</span>
      )
    },
    { 
      key: "section", 
      header: "Section",
      render: (student: Student) => (
        <span className="text-white font-medium">{student.section || 'N/A'}</span>
      )
    },
    {
      key: "status",
      header: "Status",
      render: (student: Student) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-bold ${
            student.status === "enrolled"
              ? "bg-green-600 text-white"
              : student.status === "completed"
              ? "bg-blue-600 text-white"
              : "bg-yellow-600 text-white"
          }`}
        >
          {student.status?.toUpperCase() || 'N/A'}
        </span>
      ),
    },
    {
      key: "progress",
      header: "Progress",
      render: (student: Student) => (
        <div className="w-24">
          <div className="flex items-center justify-between mb-1">
            <span className="text-white text-xs font-bold">{student.progress || 0}%</span>
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
          <h1 className="text-2xl font-bold text-white">{course?.name || 'Course'}</h1>
          <p className="text-white/80 font-medium">{course?.code} - Enrolled Students</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Users className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-white/80 text-xs font-medium">Total Students</p>
              <p className="text-white text-xl font-bold">{students.length}</p>
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
            className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-yellow-400 font-medium"
          />
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filteredStudents}
        loading={loading}
      />
    </div>
  );
};

export default CourseStudentsPage;