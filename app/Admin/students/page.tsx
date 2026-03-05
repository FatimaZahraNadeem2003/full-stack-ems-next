"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import http from "@/services/http";
import DataTable from "@/app/components/ui/DataTable";
import SearchBar from "@/app/components/ui/SearchBar";
import ConfirmModal from "@/app/components/ui/ConfirmModal";
import AddStudentModal from "./components/AddStudentModal";
import { Plus, Filter, X } from "lucide-react";
import toast from "react-hot-toast";
import debounce from "lodash/debounce";

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
  const [uniqueClasses, setUniqueClasses] = useState<string[]>([]);

  useEffect(() => {
    fetchStudents();
    fetchUniqueClasses();
  }, [currentPage, selectedClass, selectedStatus]);

  useEffect(() => {
    const debouncedSearch = debounce(() => {
      setCurrentPage(1);
      fetchStudents();
    }, 500);

    if (search !== undefined) {
      debouncedSearch();
    }

    return () => {
      debouncedSearch.cancel();
    };
  }, [search]);

  const fetchUniqueClasses = async () => {
    try {
      const response = await http.get("/admin/students?limit=1000");
      const allStudents = response.data.data || [];
      const classes = [...new Set(allStudents.map((s: Student) => s.class).filter(Boolean))];
      setUniqueClasses(classes);
    } catch (error) {
      console.error("Error fetching classes:", error);
    }
  };

  const fetchStudents = async () => {
    try {
      setLoading(true);
      
      const params: any = {
        page: currentPage,
        limit: 10
      };
      
      if (search && search.trim() !== "") {
        params.search = search.trim();
      }
      if (selectedClass && selectedClass !== "") {
        params.class = selectedClass;
      }
      if (selectedStatus && selectedStatus !== "") {
        params.status = selectedStatus;
      }

      console.log("Fetching with params:", params);
      
      const response = await http.get("/admin/students", { params });
      
      console.log("API Response:", response.data);
      
      if (response.data.success && response.data.data) {
        setStudents(response.data.data);
        setTotalPages(response.data.pages || 1);
        setTotalCount(response.data.total || response.data.data.length);
      } else {
        setStudents([]);
        setTotalPages(1);
        setTotalCount(0);
      }
      
    } catch (error: any) {
      console.error("Error fetching students:", error);
      toast.error(error.response?.data?.msg || "Failed to load students");
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearch(value);
  };

  const clearFilters = () => {
    setSelectedClass("");
    setSelectedStatus("");
    setSearch("");
    setCurrentPage(1);
    setTimeout(() => {
      fetchStudents();
    }, 100);
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
      render: (student: Student) => <span className="text-white font-medium">{student.rollNumber || 'N/A'}</span>
    },
    {
      key: "name",
      header: "Name",
      render: (student: Student) => (
        <span className="text-white font-bold">
          {student.userId?.firstName || ''} {student.userId?.lastName || ''}
        </span>
      ),
    },
    { 
      key: "class", 
      header: "Class",
      render: (student: Student) => <span className="text-white font-medium">{student.class || 'N/A'}</span>
    },
    { 
      key: "section", 
      header: "Section",
      render: (student: Student) => <span className="text-white font-medium">{student.section || 'N/A'}</span>
    },
    {
      key: "status",
      header: "Status",
      render: (student: Student) => {
        const status = student.status || 'unknown';
        const colorClass = 
          status === "active" ? "bg-green-600 text-white" :
          status === "inactive" ? "bg-yellow-600 text-white" :
          status === "graduated" ? "bg-blue-600 text-white" :
          status === "suspended" ? "bg-red-600 text-white" :
          "bg-gray-600 text-white";
        
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-bold capitalize ${colorClass}`}>
            {status}
          </span>
        );
      },
    },
    {
      key: "createdAt",
      header: "Joined",
      render: (student: Student) => (
        <span className="text-white font-medium">
          {student.createdAt ? new Date(student.createdAt).toLocaleDateString() : 'N/A'}
        </span>
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
            Add Student
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <SearchBar
          value={search}
          onChange={handleSearch}
          placeholder="Search by name, email, roll number..."
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <select
                value={selectedClass}
                onChange={(e) => {
                  setSelectedClass(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white/95 focus:outline-none focus:border-yellow-400 font-medium"
              >
                <option value="" className="bg-gray-800 text-white">All Classes</option>
                {uniqueClasses.map(cls => (
                  <option key={cls} value={cls} className="bg-gray-800 text-white">{cls}</option>
                ))}
              </select>
              
              <select
                value={selectedStatus}
                onChange={(e) => {
                  setSelectedStatus(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white/95 focus:outline-none focus:border-yellow-400 font-medium"
              >
                <option value="" className="bg-gray-800 text-white">All Status</option>
                <option value="active" className="bg-gray-800 text-white">Active</option>
                <option value="inactive" className="bg-gray-800 text-white">Inactive</option>
                <option value="graduated" className="bg-gray-800 text-white">Graduated</option>
                <option value="suspended" className="bg-gray-800 text-white">Suspended</option>
              </select>
              
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