"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import http from "@/services/http";
import toast from "react-hot-toast";
import DataTable from "@/app/components/ui/DataTable";
import SearchBar from "@/app/components/ui/SearchBar";
import ConfirmModal from "@/app/components/ui/ConfirmModal";
import AddEnrollmentModal from "./components/AddEnrollmentModal";
import { Plus, Filter, X, Users, BookOpen } from "lucide-react";
import debounce from "lodash/debounce";

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
  const [totalCount, setTotalCount] = useState(0);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: "" });
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [uniqueStatuses] = useState(["enrolled", "completed", "dropped", "pending"]);
  const [stats, setStats] = useState({
    total: 0,
    enrolled: 0,
    completed: 0,
    dropped: 0,
  });

  // Debounced search function
  const debouncedFetch = useCallback(
    debounce(() => {
      setCurrentPage(1);
      fetchEnrollments();
    }, 500),
    [selectedStatus, selectedCourse, selectedStudent]
  );

  useEffect(() => {
    fetchEnrollments();
    fetchStats();
  }, [currentPage, selectedStatus, selectedCourse, selectedStudent, search]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    debouncedFetch();
  };

  const fetchEnrollments = async () => {
    try {
      setLoading(true);
      
      // Build params object instead of URLSearchParams for better debugging
      const params: any = {
        page: currentPage,
        limit: 10
      };
      
      if (search && search.trim() !== "") {
        params.search = search.trim();
        console.log("Search param added:", params.search);
      }
      if (selectedStatus && selectedStatus !== "") {
        params.status = selectedStatus;
        console.log("Status filter added:", params.status);
      }
      if (selectedCourse && selectedCourse !== "") {
        params.courseId = selectedCourse;
        console.log("Course filter added:", params.courseId);
      }
      if (selectedStudent && selectedStudent !== "") {
        params.studentId = selectedStudent;
        console.log("Student filter added:", params.studentId);
      }

      console.log("Fetching enrollments with params:", params);
      
      const response = await http.get("/admin/enrollments", { params });
      console.log("Enrollments response:", response.data);
      
      if (response.data.success) {
        setEnrollments(response.data.data || []);
        setTotalPages(response.data.pages || 1);
        setTotalCount(response.data.total || response.data.data.length);
      } else {
        setEnrollments([]);
        setTotalPages(1);
        setTotalCount(0);
      }
    } catch (error) {
      console.error("Error fetching enrollments:", error);
      toast.error("Failed to load enrollments");
      setEnrollments([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await http.get("/admin/enrollments?limit=1000");
      const data = response.data.data || [];
      
      setStats({
        total: data.length,
        enrolled: data.filter((e: Enrollment) => e.status === "enrolled").length,
        completed: data.filter((e: Enrollment) => e.status === "completed").length,
        dropped: data.filter((e: Enrollment) => e.status === "dropped").length,
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

  const clearFilters = () => {
    console.log("Clearing all filters");
    setSelectedStatus("");
    setSelectedCourse("");
    setSelectedStudent("");
    setSearch("");
    setCurrentPage(1);
    // Fetch will happen automatically via useEffect
  };

  const handleFilterChange = (filterType: string, value: string) => {
    console.log(`Filter ${filterType} changed to:`, value);
    setCurrentPage(1);
    
    switch(filterType) {
      case 'status':
        setSelectedStatus(value);
        break;
      case 'course':
        setSelectedCourse(value);
        break;
      case 'student':
        setSelectedStudent(value);
        break;
    }
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      enrolled: "bg-green-600 text-white",
      completed: "bg-blue-600 text-white",
      dropped: "bg-red-600 text-white",
      pending: "bg-yellow-600 text-white",
    };
    return colors[status] || "bg-gray-600 text-white";
  };

  const columns = [
    {
      key: "student",
      header: "Student",
      render: (enrollment: Enrollment) => (
        <div>
          <p className="text-white font-bold">
            {enrollment.studentId?.userId?.firstName} {enrollment.studentId?.userId?.lastName}
          </p>
          <p className="text-white/80 text-xs font-medium">{enrollment.studentId?.rollNumber}</p>
        </div>
      ),
    },
    {
      key: "course",
      header: "Course",
      render: (enrollment: Enrollment) => (
        <div>
          <p className="text-white font-bold">{enrollment.courseId?.name}</p>
          <p className="text-white/80 text-xs font-medium">{enrollment.courseId?.code}</p>
        </div>
      ),
    },
    {
      key: "enrollmentDate",
      header: "Enrolled Date",
      render: (enrollment: Enrollment) => (
        <span className="text-white font-medium">
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
            <span className="text-white text-xs font-bold">{enrollment.progress || 0}%</span>
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
        <span className="text-white font-bold">{enrollment.grade}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (enrollment: Enrollment) => (
        <select
          value={enrollment.status}
          onChange={(e) => handleStatusChange(enrollment._id, e.target.value)}
          className={`px-2 py-1 rounded-full text-xs font-bold capitalize ${getStatusBadge(enrollment.status)} border-0 focus:ring-2 focus:ring-yellow-400 cursor-pointer`}
        >
          <option value="enrolled" className="bg-gray-800 text-white">ENROLLED</option>
          <option value="completed" className="bg-gray-800 text-white">COMPLETED</option>
          <option value="dropped" className="bg-gray-800 text-white">DROPPED</option>
          <option value="pending" className="bg-gray-800 text-white">PENDING</option>
        </select>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Enrollment Management</h1>
          <p className="text-white/60 mt-1">Total Enrollments: {stats.total}</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setFilterOpen(!filterOpen)}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-lg text-white hover:bg-white/20 transition-colors font-medium"
          >
            <Filter className="w-4 h-4" />
            {filterOpen ? "Hide Filters" : "Show Filters"}
          </button>
          <button
            onClick={() => setAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-lg text-white hover:from-yellow-500 hover:to-orange-500 transition-colors font-bold"
          >
            <Plus className="w-4 h-4" />
            New Enrollment
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Users className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-white/60 text-xs">Total</p>
              <p className="text-white text-xl font-bold">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-white/60 text-xs">Enrolled</p>
              <p className="text-white text-xl font-bold">{stats.enrolled}</p>
            </div>
          </div>
        </div>
        <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <BookOpen className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-white/60 text-xs">Completed</p>
              <p className="text-white text-xl font-bold">{stats.completed}</p>
            </div>
          </div>
        </div>
        <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-600 rounded-lg">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-white/60 text-xs">Dropped</p>
              <p className="text-white text-xl font-bold">{stats.dropped}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <SearchBar
          value={search}
          onChange={handleSearchChange}
          placeholder="Search by student name, roll number, course..."
        />

        {filterOpen && (
          <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-white font-bold">Filters</h3>
              <button
                onClick={clearFilters}
                className="text-sm text-yellow-400 hover:text-yellow-300 flex items-center gap-1 font-bold"
              >
                <X className="w-3 h-3" /> Clear All
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <select
                value={selectedStatus}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white/95 focus:outline-none focus:border-yellow-400 font-medium"
              >
                <option value="" className="bg-gray-800 text-white">All Status</option>
                {uniqueStatuses.map(status => (
                  <option key={status} value={status} className="bg-gray-800 text-white">
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
              
              <input
                type="text"
                placeholder="Course ID / Name"
                value={selectedCourse}
                onChange={(e) => handleFilterChange('course', e.target.value)}
                className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white/95 placeholder-white/50 focus:outline-none focus:border-yellow-400 font-medium"
              />
              
              <input
                type="text"
                placeholder="Student ID / Name"
                value={selectedStudent}
                onChange={(e) => handleFilterChange('student', e.target.value)}
                className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white/95 placeholder-white/50 focus:outline-none focus:border-yellow-400 font-medium"
              />
              
              <button
                onClick={clearFilters}
                className="px-4 py-2 bg-white/10 rounded-lg text-white hover:bg-white/20 transition-colors font-bold"
              >
                Apply Filters
              </button>
            </div>
          </div>
        )}
      </div>

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

      <AddEnrollmentModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSuccess={() => {
          setAddModalOpen(false);
          fetchEnrollments();
          fetchStats();
        }}
      />

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