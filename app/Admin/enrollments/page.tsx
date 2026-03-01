"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import http from "@/services/http";
import toast from "react-hot-toast";
import DataTable from "@/app/components/ui/DataTable";
import SearchBar from "@/app/components/ui/SearchBar";
import ConfirmModal from "@/app/components/ui/ConfirmModal";
import AddEnrollmentModal from "./components/AddEnrollmentModal";
import { Plus, Filter, Users, BookOpen } from "lucide-react";

interface Enrollment {
  _id: string;
  studentId: {
    _id: string;
    userId: {
      firstName: string;
      lastName: string;
      email: string;
    };
    rollNumber: string;
    class: string;
    section: string;
  };
  courseId: {
    _id: string;
    name: string;
    code: string;
    credits: number;
  };
  enrollmentDate: string;
  status: string;
  progress: number;
  grade: string;
  marksObtained?: number;
}

const EnrollmentsPage = () => {
  const router = useRouter();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedStudent, setSelectedStudent] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: "" });
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    completed: 0,
    dropped: 0,
  });

  useEffect(() => {
    fetchEnrollments();
    fetchStats();
  }, [currentPage, selectedStatus, selectedCourse, selectedStudent]);

  const fetchEnrollments = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "10",
      });
      if (search) params.append("search", search);
      if (selectedStatus) params.append("status", selectedStatus);
      if (selectedCourse) params.append("courseId", selectedCourse);
      if (selectedStudent) params.append("studentId", selectedStudent);

      const response = await http.get(`/admin/enrollments?${params}`);
      setEnrollments(response.data.data);
      setTotalPages(response.data.pages || 1);
    } catch (error) {
      console.error("Error fetching enrollments:", error);
      toast.error("Failed to load enrollments");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await http.get("/admin/enrollments?limit=1");
      const data = response.data;
      setStats({
        total: data.total || 0,
        active: data.data?.filter((e: Enrollment) => e.status === "enrolled").length || 0,
        completed: data.data?.filter((e: Enrollment) => e.status === "completed").length || 0,
        dropped: data.data?.filter((e: Enrollment) => e.status === "dropped").length || 0,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await http.delete(`/admin/enrollments/${id}`);
      toast.success("Enrollment removed successfully");
      fetchEnrollments();
      fetchStats();
    } catch (error) {
      console.error("Error deleting enrollment:", error);
      toast.error("Failed to remove enrollment");
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await http.put(`/admin/enrollments/${id}`, { status });
      toast.success(`Enrollment ${status} successfully`);
      fetchEnrollments();
      fetchStats();
    } catch (error) {
      console.error("Error updating enrollment:", error);
      toast.error("Failed to update enrollment");
    }
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      enrolled: "bg-green-500/20 text-green-400",
      completed: "bg-blue-500/20 text-blue-400",
      dropped: "bg-red-500/20 text-red-400",
      pending: "bg-yellow-500/20 text-yellow-400",
    };
    return colors[status] || "bg-gray-500/20 text-gray-400";
  };

  const columns = [
    {
      key: "student",
      header: "Student",
      render: (enrollment: Enrollment) => (
        <div>
          <p className="text-white font-medium">
            {enrollment.studentId?.userId?.firstName} {enrollment.studentId?.userId?.lastName}
          </p>
          <p className="text-white/60 text-xs">{enrollment.studentId?.rollNumber}</p>
        </div>
      ),
    },
    {
      key: "course",
      header: "Course",
      render: (enrollment: Enrollment) => (
        <div>
          <p className="text-white font-medium">{enrollment.courseId?.name}</p>
          <p className="text-white/60 text-xs">{enrollment.courseId?.code}</p>
        </div>
      ),
    },
    {
      key: "enrollmentDate",
      header: "Enrolled Date",
      render: (enrollment: Enrollment) => (
        <span className="text-white">
          {new Date(enrollment.enrollmentDate).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: "progress",
      header: "Progress",
      render: (enrollment: Enrollment) => (
        <div className="w-24">
          <div className="flex items-center justify-between mb-1">
            <span className="text-white text-xs">{enrollment.progress || 0}%</span>
          </div>
          <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-yellow-400 to-orange-400"
              style={{ width: `${enrollment.progress || 0}%` }}
            />
          </div>
        </div>
      ),
    },
    {
      key: "grade",
      header: "Grade",
      render: (enrollment: Enrollment) => (
        <span className="text-white font-medium">{enrollment.grade}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (enrollment: Enrollment) => (
        <select
          value={enrollment.status}
          onChange={(e) => handleStatusChange(enrollment._id, e.target.value)}
          className={`px-2 py-1 rounded-full text-xs capitalize ${getStatusBadge(enrollment.status)} border-0 focus:ring-2 focus:ring-yellow-400`}
        >
          <option value="enrolled" className="bg-gray-800">Enrolled</option>
          <option value="completed" className="bg-gray-800">Completed</option>
          <option value="dropped" className="bg-gray-800">Dropped</option>
          <option value="pending" className="bg-gray-800">Pending</option>
        </select>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Enrollment Management</h1>
        <div className="flex gap-3">
          <button
            onClick={() => setFilterOpen(!filterOpen)}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-lg text-white hover:bg-white/20 transition-colors"
          >
            <Filter className="w-4 h-4" />
            Filter
          </button>
          <button
            onClick={() => setAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-lg text-white hover:from-yellow-500 hover:to-orange-500 transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Enrollment
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Users className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-white/60 text-sm">Total Enrollments</p>
              <p className="text-white text-xl font-bold">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <Users className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-white/60 text-sm">Active</p>
              <p className="text-white text-xl font-bold">{stats.active}</p>
            </div>
          </div>
        </div>
        <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <BookOpen className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-white/60 text-sm">Completed</p>
              <p className="text-white text-xl font-bold">{stats.completed}</p>
            </div>
          </div>
        </div>
        <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500/20 rounded-lg">
              <Users className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <p className="text-white/60 text-sm">Dropped</p>
              <p className="text-white text-xl font-bold">{stats.dropped}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        <SearchBar
          value={search}
          onChange={setSearch}
          onSearch={() => {
            setCurrentPage(1);
            fetchEnrollments();
          }}
          placeholder="Search by student name, roll number, course..."
        />

        {filterOpen && (
          <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
              >
                <option value="">All Status</option>
                <option value="enrolled">Enrolled</option>
                <option value="completed">Completed</option>
                <option value="dropped">Dropped</option>
                <option value="pending">Pending</option>
              </select>
              <input
                type="text"
                placeholder="Course ID"
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40"
              />
              <input
                type="text"
                placeholder="Student ID"
                value={selectedStudent}
                onChange={(e) => setSelectedStudent(e.target.value)}
                className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40"
              />
            </div>
            <div className="flex justify-end mt-4">
              <button
                onClick={() => {
                  setSelectedStatus("");
                  setSelectedCourse("");
                  setSelectedStudent("");
                  setCurrentPage(1);
                  fetchEnrollments();
                }}
                className="px-4 py-2 bg-white/10 rounded-lg text-white hover:bg-white/20 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Enrollments Table */}
      <DataTable
        columns={columns}
        data={enrollments}
        loading={loading}
        onView={(enrollment) => router.push(`/Admin/enrollments/${enrollment._id}`)}
        onEdit={(enrollment) => router.push(`/Admin/enrollments/${enrollment._id}/edit`)}
        onDelete={(enrollment) => setDeleteModal({ isOpen: true, id: enrollment._id })}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />

      {/* Add Enrollment Modal */}
      <AddEnrollmentModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSuccess={() => {
          setAddModalOpen(false);
          fetchEnrollments();
          fetchStats();
        }}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, id: "" })}
        onConfirm={() => handleDelete(deleteModal.id)}
        title="Remove Enrollment"
        message="Are you sure you want to remove this enrollment? This action cannot be undone."
      />
    </div>
  );
};

export default EnrollmentsPage;