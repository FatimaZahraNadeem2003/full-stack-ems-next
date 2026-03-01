"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import http from "@/services/http";
import toast from "react-hot-toast";
import DataTable from "@/app/components/ui/DataTable";
import SearchBar from "@/app/components/ui/SearchBar";
import ConfirmModal from "@/app/components/ui/ConfirmModal";
import { Plus, Filter } from "lucide-react";

interface Teacher {
  _id: string;
  userId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  employeeId: string;
  qualification: string;
  specialization: string;
  experience: number;
  status: string;
  createdAt: string;
}

const TeachersPage = () => {
  const router = useRouter();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedSpecialization, setSelectedSpecialization] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: "" });
  const [filterOpen, setFilterOpen] = useState(false);

  useEffect(() => {
    fetchTeachers();
  }, [currentPage, selectedSpecialization, selectedStatus]);

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "10",
      });
      if (search) params.append("search", search);
      if (selectedSpecialization) params.append("specialization", selectedSpecialization);
      if (selectedStatus) params.append("status", selectedStatus);

      const response = await http.get(`/admin/teachers?${params}`);
      setTeachers(response.data.data);
      setTotalPages(response.data.pages || 1);
    } catch (error) {
      console.error("Error fetching teachers:", error);
      toast.error("Failed to load teachers");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await http.delete(`/admin/teachers/${id}`);
      toast.success("Teacher deleted successfully");
      fetchTeachers();
    } catch (error) {
      console.error("Error deleting teacher:", error);
      toast.error("Failed to delete teacher");
    }
  };

  const columns = [
    { key: "employeeId", header: "Employee ID" },
    {
      key: "name",
      header: "Name",
      render: (teacher: Teacher) => (
        <span>
          {teacher.userId?.firstName} {teacher.userId?.lastName}
        </span>
      ),
    },
    { key: "qualification", header: "Qualification" },
    { key: "specialization", header: "Specialization" },
    { key: "experience", header: "Experience (years)" },
    {
      key: "status",
      header: "Status",
      render: (teacher: Teacher) => (
        <span
          className={`px-2 py-1 rounded-full text-xs ${
            teacher.status === "active"
              ? "bg-green-500/20 text-green-400"
              : teacher.status === "on-leave"
              ? "bg-yellow-500/20 text-yellow-400"
              : "bg-gray-500/20 text-gray-400"
          }`}
        >
          {teacher.status}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Teachers Management</h1>
        <div className="flex gap-3">
          <button
            onClick={() => setFilterOpen(!filterOpen)}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-lg text-white hover:bg-white/20 transition-colors"
          >
            <Filter className="w-4 h-4" />
            Filter
          </button>
          <button
            onClick={() => router.push("/Admin/teachers/add")}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-lg text-white hover:from-yellow-500 hover:to-orange-500 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Teacher
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <SearchBar
          value={search}
          onChange={setSearch}
          onSearch={() => {
            setCurrentPage(1);
            fetchTeachers();
          }}
          placeholder="Search by name, email, employee ID..."
        />

        {filterOpen && (
          <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="text"
                placeholder="Specialization"
                value={selectedSpecialization}
                onChange={(e) => setSelectedSpecialization(e.target.value)}
                className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40"
              />
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="on-leave">On Leave</option>
                <option value="inactive">Inactive</option>
              </select>
              <button
                onClick={() => {
                  setSelectedSpecialization("");
                  setSelectedStatus("");
                  setCurrentPage(1);
                  fetchTeachers();
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
        data={teachers}
        loading={loading}
        onView={(teacher) => router.push(`/Admin/teachers/${teacher._id}`)}
        onEdit={(teacher) => router.push(`/Admin/teachers/${teacher._id}/edit`)}
        onDelete={(teacher) => setDeleteModal({ isOpen: true, id: teacher._id })}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />

      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, id: "" })}
        onConfirm={() => handleDelete(deleteModal.id)}
        title="Delete Teacher"
        message="Are you sure you want to delete this teacher? This will also remove all associated courses."
      />
    </div>
  );
};

export default TeachersPage;