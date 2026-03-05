"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import http from "@/services/http";
import toast from "react-hot-toast";
import { ArrowLeft, Users, Search, Plus, Trash2, BookOpen, X, Loader2 } from "lucide-react";
import DataTable from "@/app/components/ui/DataTable";
import ConfirmModal from "@/app/components/ui/ConfirmModal";

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
  enrolledCount: number;
  maxStudents: number;
  department: string;
  credits: number;
  duration: string;
  level: string;
}

interface AvailableStudent {
  _id: string;
  userId: {
    firstName: string;
    lastName: string;
    email: string;
  };
  rollNumber: string;
  class: string;
  section: string;
  status: string;
}

const CourseStudentsPage = () => {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;
  
  const [loading, setLoading] = useState(true);
  const [addLoading, setAddLoading] = useState(false);
  const [fetchingAvailable, setFetchingAvailable] = useState(false);
  const [course, setCourse] = useState<Course | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [availableStudents, setAvailableStudents] = useState<AvailableStudent[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [availableSearch, setAvailableSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: "", enrollmentId: "" });

  useEffect(() => {
    if (courseId) {
      fetchCourseDetails();
      fetchEnrolledStudents();
    }
  }, [courseId]);

  useEffect(() => {
    if (showAddModal) {
      fetchAvailableStudents();
    }
  }, [showAddModal]);

  const fetchCourseDetails = async () => {
    try {
      const response = await http.get(`/admin/courses/${courseId}`);
      console.log("Course details:", response.data);
      setCourse(response.data.data);
    } catch (error) {
      console.error("Error fetching course:", error);
      toast.error("Failed to load course details");
    }
  };

  const fetchEnrolledStudents = async () => {
    try {
      setLoading(true);
      const response = await http.get(`/admin/courses/${courseId}`);
      console.log("Course data response:", response.data);
      
      const courseData = response.data.data;
      
      if (courseData) {
        setCourse(courseData);
        
        const enrolledStudents = courseData.enrolledStudents || [];
        console.log("Enrolled students raw:", enrolledStudents);
        
        const formattedStudents = enrolledStudents.map((enrollment: any) => ({
          _id: enrollment._id,
          enrollmentId: enrollment._id,
          studentId: enrollment.studentId?._id || '',
          name: enrollment.studentId?.userId ? 
            `${enrollment.studentId.userId.firstName} ${enrollment.studentId.userId.lastName}` : 
            'N/A',
          email: enrollment.studentId?.userId?.email || 'N/A',
          rollNumber: enrollment.studentId?.rollNumber || 'N/A',
          class: enrollment.studentId?.class || 'N/A',
          section: enrollment.studentId?.section || 'N/A',
          enrollmentDate: enrollment.enrollmentDate,
          status: enrollment.status,
          progress: enrollment.progress || 0
        }));
        
        console.log("Formatted students:", formattedStudents);
        setStudents(formattedStudents);
      } else {
        setStudents([]);
      }
    } catch (error: any) {
      console.error("Error fetching enrolled students:", error);
      toast.error(error.response?.data?.msg || "Failed to load students");
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableStudents = async () => {
    try {
      setFetchingAvailable(true);
      const response = await http.get("/admin/students?status=active&limit=100");
      console.log("Available students response:", response.data);
      
      const allStudents = response.data.data || [];
      
      const enrolledStudentIds = students.map(s => s.studentId);
      console.log("Enrolled student IDs:", enrolledStudentIds);
      
      const available = allStudents.filter((student: any) => 
        !enrolledStudentIds.includes(student._id)
      );
      
      console.log("Available students:", available);
      setAvailableStudents(available);
    } catch (error) {
      console.error("Error fetching available students:", error);
      toast.error("Failed to load available students");
    } finally {
      setFetchingAvailable(false);
    }
  };

  const handleAddStudents = async () => {
    if (selectedStudents.length === 0) {
      toast.error("Please select at least one student");
      return;
    }

    try {
      setAddLoading(true);
      
      const response = await http.post("/admin/enrollments/bulk", {
        courseId: courseId,
        studentIds: selectedStudents
      });
      
      console.log("Bulk enroll response:", response.data);
      
      toast.success(`${selectedStudents.length} students added successfully`);
      setShowAddModal(false);
      setSelectedStudents([]);
      await fetchEnrolledStudents();
      await fetchCourseDetails();
    } catch (error: any) {
      console.error("Error adding students:", error);
      toast.error(error.response?.data?.msg || "Failed to add students");
    } finally {
      setAddLoading(false);
    }
  };

  const handleRemoveStudent = async () => {
    if (!deleteModal.enrollmentId) return;

    try {
      await http.delete(`/admin/enrollments/${deleteModal.enrollmentId}`);
      toast.success("Student removed from course successfully");
      setDeleteModal({ isOpen: false, id: "", enrollmentId: "" });
      await fetchEnrolledStudents();
      await fetchCourseDetails();
    } catch (error: any) {
      console.error("Error removing student:", error);
      toast.error(error.response?.data?.msg || "Failed to remove student");
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

  const filteredAvailableStudents = availableStudents.filter(student => {
    const searchLower = availableSearch.toLowerCase();
    const name = `${student.userId?.firstName} ${student.userId?.lastName}`.toLowerCase();
    const email = student.userId?.email?.toLowerCase() || "";
    const rollNumber = student.rollNumber?.toLowerCase() || "";
    
    return (
      name.includes(searchLower) ||
      email.includes(searchLower) ||
      rollNumber.includes(searchLower)
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
        <span className="text-white font-medium">{student.name || 'N/A'}</span>
      )
    },
    { 
      key: "email", 
      header: "Email",
      render: (student: Student) => (
        <span className="text-white">{student.email || 'N/A'}</span>
      )
    },
    { 
      key: "class", 
      header: "Class",
      render: (student: Student) => (
        <span className="text-white">{student.class || 'N/A'}</span>
      )
    },
    { 
      key: "section", 
      header: "Section",
      render: (student: Student) => (
        <span className="text-white">{student.section || 'N/A'}</span>
      )
    },
    {
      key: "enrollmentDate",
      header: "Enrolled Date",
      render: (student: Student) => (
        <span className="text-white text-sm">
          {new Date(student.enrollmentDate).toLocaleDateString()}
        </span>
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
    {
      key: "actions",
      header: "Actions",
      render: (student: Student) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setDeleteModal({ 
              isOpen: true, 
              id: student.studentId, 
              enrollmentId: student.enrollmentId 
            });
          }}
          className="inline-flex items-center gap-1 px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors font-bold text-xs"
        >
          <Trash2 className="w-3 h-3" />
          REMOVE
        </button>
      ),
    },
  ];

  if (loading) {
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
          <div>
            <h1 className="text-2xl font-bold text-white">{course?.name || 'Course'}</h1>
            <p className="text-white/60">{course?.code} - Manage Enrolled Students</p>
          </div>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-400 to-emerald-500 text-white rounded-lg hover:from-green-500 hover:to-emerald-600 transition-colors font-bold"
        >
          <Plus className="w-4 h-4" />
          ADD STUDENTS
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Users className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-white/60 text-xs">Enrolled Students</p>
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
              <p className="text-white/60 text-xs">Available Seats</p>
              <p className="text-white text-xl font-bold">
                {course ? (course.maxStudents - students.length) : 0}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <BookOpen className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-white/60 text-xs">Max Capacity</p>
              <p className="text-white text-xl font-bold">{course?.maxStudents || 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-500/20 rounded-lg">
              <BookOpen className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <p className="text-white/60 text-xs">Department</p>
              <p className="text-white text-xl font-bold">{course?.department || 'N/A'}</p>
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
            placeholder="Search enrolled students..."
            className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-yellow-400 font-medium"
          />
        </div>
        <div className="text-white/80 text-sm font-bold">
          Total: {students.length} students
        </div>
      </div>

      {students.length === 0 ? (
        <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-12 text-center">
          <Users className="w-16 h-16 text-white/40 mx-auto mb-4" />
          <h3 className="text-white font-bold text-lg mb-2">No Students Enrolled</h3>
          <p className="text-white/70 mb-6">This course {`doesn't`} have any students yet.</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-6 py-2 bg-gradient-to-r from-green-400 to-emerald-500 text-white rounded-lg hover:from-green-500 hover:to-emerald-600 transition-colors font-bold"
          >
            Add Students Now
          </button>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={filteredStudents}
          loading={loading}
          onView={(student) => router.push(`/Admin/students/${student.studentId}`)}
        />
      )}

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="relative w-full max-w-2xl bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-6 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => {
                setShowAddModal(false);
                setSelectedStudents([]);
                setAvailableSearch("");
              }}
              className="absolute top-4 right-4 text-white/60 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-bold text-white mb-6">Add Students to Course</h2>
            
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <input
                  type="text"
                  value={availableSearch}
                  onChange={(e) => setAvailableSearch(e.target.value)}
                  placeholder="Search available students..."
                  className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-yellow-400 font-medium"
                />
              </div>

              <div className="max-h-96 overflow-y-auto bg-white/5 rounded-lg border border-white/10">
                {fetchingAvailable ? (
                  <div className="p-8 text-center">
                    <Loader2 className="w-8 h-8 text-yellow-400 animate-spin mx-auto mb-3" />
                    <p className="text-white/60">Loading available students...</p>
                  </div>
                ) : filteredAvailableStudents.length === 0 ? (
                  <div className="p-8 text-center">
                    <Users className="w-12 h-12 text-white/40 mx-auto mb-3" />
                    <p className="text-white/60">No available students found</p>
                  </div>
                ) : (
                  <div className="divide-y divide-white/10">
                    {filteredAvailableStudents.map((student) => (
                      <div
                        key={student._id}
                        className="flex items-center gap-3 p-3 hover:bg-white/5 transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={selectedStudents.includes(student._id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedStudents([...selectedStudents, student._id]);
                            } else {
                              setSelectedStudents(selectedStudents.filter(id => id !== student._id));
                            }
                          }}
                          className="w-4 h-4 bg-white/10 border border-white/20 rounded"
                        />
                        <div className="flex-1">
                          <p className="text-white font-bold">
                            {student.userId?.firstName} {student.userId?.lastName}
                          </p>
                          <p className="text-white/80 text-sm font-medium">
                            {student.rollNumber} - {student.class} {student.section}
                          </p>
                          <p className="text-white/70 text-xs">{student.userId?.email}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="text-white/90 text-sm font-bold">
                Selected: {selectedStudents.length} student(s)
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setSelectedStudents([]);
                    setAvailableSearch("");
                  }}
                  className="px-4 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors font-bold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddStudents}
                  disabled={addLoading || selectedStudents.length === 0}
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-green-400 to-emerald-500 text-white hover:from-green-500 hover:to-emerald-600 transition-colors disabled:opacity-50 font-bold"
                >
                  {addLoading ? "Adding..." : `Add ${selectedStudents.length} Students`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, id: "", enrollmentId: "" })}
        onConfirm={handleRemoveStudent}
        title="Remove Student"
        message="Are you sure you want to remove this student from the course? This action cannot be undone."
        confirmText="Remove"
        cancelText="Cancel"
      />
    </div>
  );
};

export default CourseStudentsPage;