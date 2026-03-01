"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { adminApi } from "@/lib/api";
import { usePaginatedApi } from "@/hooks/useApi";
import DataTable from "@/components/ui/DataTable";
import SearchBar from "@/components/ui/SearchBar";
import ConfirmModal from "@/components/ui/ConfirmModal";
import LoadingOverlay from "@/components/ui/LoadingOverlay";
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
  const [search, setSearch] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: "" });
  
  const { 
    data: students, 
    loading, 
    pagination, 
    fetchData, 
    setPage,
    setData 
  } = usePaginatedApi<Student>();

  useEffect(() => {
    loadStudents();
  }, [pagination.page, selectedClass, selectedStatus]);

  const loadStudents = async () => {
    const params: any = {};
    if (search) params.search = search;
    if (selectedClass) params.class = selectedClass;
    if (selectedStatus) params.status = selectedStatus;

    await fetchData(adminApi.students.getAll, params);
  };

  const handleSearch = () => {
    setPage(1);
    loadStudents();
  };

  const handleDelete = async (id: string) => {
    try {
      await adminApi.students.delete(id);
      toast.success("Student deleted successfully");
      loadStudents();
    } catch (error) {
    }
  };

  const columns = [
    { key: "rollNumber", header: "Roll No" },
    {
      key: "name",
      header: "Name",
      render: (student: Student) => (
        <span>
          {student.userId?.firstName} {student.userId?.lastName}
        </span>
      ),
    },
    { key: "class", header: "Class" },
    { key: "section", header: "Section" },
    {
      key: "status",
      header: "Status",
      render: (student: Student) => (
        <span
          className={`px-2 py-1 rounded-full text-xs ${
            student.status === "active"
              ? "bg-green-500/20 text-green-400"
              : student.status === "inactive"
              ? "bg-yellow-500/20 text-yellow-400"
              : "bg-gray-500/20 text-gray-400"
          }`}
        >
          {student.status}
        </span>
      ),
    },
    {
      key: "createdAt",
      header: "Joined",
      render: (student: Student) => (
        <span>{new Date(student.createdAt).toLocaleDateString()}</span>
      ),
    },
  ];

  return (
    <LoadingOverlay loading={loading} message="Loading students...">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">Students Management</h1>
          <div className="flex gap-3">
            <button
              onClick={() => setFilterOpen(!filterOpen)}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-lg text-white hover:bg-white/20 transition-colors"
            >
              <Filter className="w-4 h-4" />
              Filter
            </button>
            <button
              onClick={() => router.push("/Admin/students/add")}
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
                <select
                  value={selectedClass}
                  onChange={(e) => {
                    setSelectedClass(e.target.value);
                    setPage(1);
                  }}
                  className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                >
                  <option value="">All Classes</option>
                  <option value="10th">10th Grade</option>
                  <option value="11th">11th Grade</option>
                  <option value="12th">12th Grade</option>
                </select>
                <select
                  value={selectedStatus}
                  onChange={(e) => {
                    setSelectedStatus(e.target.value);
                    setPage(1);
                  }}
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
                    setPage(1);
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
          currentPage={pagination.page}
          totalPages={pagination.pages}
          onPageChange={setPage}
        />

        <ConfirmModal
          isOpen={deleteModal.isOpen}
          onClose={() => setDeleteModal({ isOpen: false, id: "" })}
          onConfirm={() => handleDelete(deleteModal.id)}
          title="Delete Student"
          message="Are you sure you want to delete this student? This action cannot be undone."
        />
      </div>
    </LoadingOverlay>
  );
};

export default StudentsPage;