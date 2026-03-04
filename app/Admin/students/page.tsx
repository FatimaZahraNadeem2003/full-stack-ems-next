"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import http from "@/services/http";
import DataTable from "@/app/components/ui/DataTable";
import SearchBar from "@/app/components/ui/SearchBar";
import ConfirmModal from "@/app/components/ui/ConfirmModal";
import AddStudentModal from "./components/AddStudentModal";
import { Plus, Filter } from "lucide-react";
import toast from "react-hot-toast";

interface Student {
  _id: string;
  userId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  class: string;
  section: string;
  rollNumber: string;
  status: string;
  createdAt: string;
}

const StudentsPage = () => {
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: "" });
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    fetchStudents();
  }, [currentPage, selectedClass, selectedStatus]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      
      const params: any = {
        page: currentPage,
        limit: 10
      };
      
      if (search) params.search = search;
      if (selectedClass) params.class = selectedClass;
      if (selectedStatus) params.status = selectedStatus;

      const response = await http.get("/admin/students", { params });
      
      console.log("API Response:", response.data);
      
      // Handle different response structures
      let studentsData = [];
      let pages = 1;
      let total = 0;
      
      if (response.data.success && response.data.data) {
        // Standard API response format
        if (Array.isArray(response.data.data)) {
          studentsData = response.data.data;
        }
        pages = response.data.pages || 1;
        total = response.data.total || studentsData.length;
      } else if (Array.isArray(response.data)) {
        // Direct array response
        studentsData = response.data;
        pages = 1;
        total = studentsData.length;
      } else if (response.data.students) {
        // Response with students property
        studentsData = response.data.students;
        pages = response.data.pages || 1;
        total = response.data.total || studentsData.length;
      }
      
      setStudents(studentsData);
      setTotalPages(pages);
      setTotalCount(total);
      
    } catch (error: any) {
      console.error("Error fetching students:", error);
      toast.error(error.response?.data?.msg || "Failed to load students");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchStudents();
  };

  const handleDelete = async (id: string) => {
    try {
      await http.delete(`/admin/students/${id}`);
      toast.success("Student deleted successfully");
      fetchStudents();
    } catch (error: any) {
      console.error("Error deleting student:", error);
      toast.error(error.response?.data?.msg || "Failed to delete student");
    }
  };

  const columns = [
    { 
      key: "rollNumber", 
      header: "Roll No",
      render: (student: Student) => <span>{student.rollNumber || 'N/A'}</span>
    },
    {
      key: "name",
      header: "Name",
      render: (student: Student) => (
        <span className="font-medium">
          {student.userId?.firstName || ''} {student.userId?.lastName || ''}
        </span>
      ),
    },
    { 
      key: "class", 
      header: "Class",
      render: (student: Student) => <span>{student.class || 'N/A'}</span>
    },
    { 
      key: "section", 
      header: "Section",
      render: (student: Student) => <span>{student.section || 'N/A'}</span>
    },
    {
      key: "status",
      header: "Status",
      render: (student: Student) => {
        const status = student.status || 'unknown';
        const colorClass = 
          status === "active" ? "bg-green-500/20 text-green-400" :
          status === "inactive" ? "bg-yellow-500/20 text-yellow-400" :
          "bg-gray-500/20 text-gray-400";
        
        return (
          <span className={`px-2 py-1 rounded-full text-xs capitalize ${colorClass}`}>
            {status}
          </span>
        );
      },
    },
    {
      key: "createdAt",
      header: "Joined",
      render: (student: Student) => (
        <span>{student.createdAt ? new Date(student.createdAt).toLocaleDateString() : 'N/A'}</span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Students Management</h1>
          <p className="text-white/60 mt-1">Total Students: {totalCount}</p>
        </div>
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
            Add Student
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <SearchBar
          value={search}
          onChange={setSearch}
          onSearch={handleSearch}
          placeholder="Search by name, email, roll number..."
        />

        {filterOpen && (
          <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="text"
                placeholder="Class (e.g., 10th)"
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40"
              />
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="graduated">Graduated</option>
              </select>
              <button
                onClick={() => {
                  setSelectedClass("");
                  setSelectedStatus("");
                  setCurrentPage(1);
                }}
                className="px-4 py-2 bg-white/10 rounded-lg text-white hover:bg-white/20 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        )}
      </div>

      <DataTable
        columns={columns}
        data={students}
        loading={loading}
        onView={(student) => router.push(`/Admin/students/${student._id}`)}
        onEdit={(student) => router.push(`/Admin/students/${student._id}/edit`)}
        onDelete={(student) => setDeleteModal({ isOpen: true, id: student._id })}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />

      <AddStudentModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSuccess={() => {
          setAddModalOpen(false);
          fetchStudents();
        }}
      />

      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, id: "" })}
        onConfirm={() => handleDelete(deleteModal.id)}
        title="Delete Student"
        message="Are you sure you want to delete this student? This action cannot be undone."
      />
    </div>
  );
};

export default StudentsPage;