"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import http from "@/services/http";
import toast from "react-hot-toast";
import DataTable from "@/app/components/ui/DataTable";
import SearchBar from "@/app/components/ui/SearchBar";
import ConfirmModal from "@/app/components/ui/ConfirmModal";
import AddTeacherModal from "./components/AddTeacherModal";
import { Plus, Filter } from "lucide-react";
import debounce from "lodash/debounce";

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
  const [totalCount, setTotalCount] = useState(0);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: "" });
  const [filterOpen, setFilterOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);

  useEffect(() => {
    fetchTeachers();
  }, [currentPage, selectedSpecialization, selectedStatus, search]);

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "10",
      });
      
      if (search && search.trim() !== "") {
        params.append("search", search.trim());
      }
      if (selectedSpecialization && selectedSpecialization.trim() !== "") {
        params.append("specialization", selectedSpecialization.trim());
      }
      if (selectedStatus && selectedStatus !== "") {
        params.append("status", selectedStatus);
      }

      console.log("Fetching teachers with params:", params.toString());
      
      const response = await http.get(`/admin/teachers?${params}`);
      console.log("Teachers response:", response.data);
      
      if (response.data.success) {
        setTeachers(response.data.data || []);
        setTotalPages(response.data.pages || 1);
        setTotalCount(response.data.total || response.data.data.length);
      } else {
        setTeachers([]);
        setTotalPages(1);
        setTotalCount(0);
      }
    } catch (error) {
      console.error("Error fetching teachers:", error);
      toast.error("Failed to load teachers");
      setTeachers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setCurrentPage(1);
  };

  const handleAddSuccess = () => {
    fetchTeachers();
    setAddModalOpen(false);
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

  const clearFilters = () => {
    setSelectedSpecialization("");
    setSelectedStatus("");
    setSearch("");
    setCurrentPage(1);
    fetchTeachers();
  };

  const columns = [
    { 
      key: "employeeId", 
      header: "Employee ID",
      render: (teacher: Teacher) => (
        <span className="text-white font-medium">{teacher.employeeId || 'N/A'}</span>
      )
    },
    {
      key: "name",
      header: "Name",
      render: (teacher: Teacher) => (
        <span className="text-white font-bold">
          {teacher.userId?.firstName} {teacher.userId?.lastName}
        </span>
      ),
    },
    { 
      key: "qualification", 
      header: "Qualification",
      render: (teacher: Teacher) => (
        <span className="text-white font-medium">{teacher.qualification || 'N/A'}</span>
      )
    },
    { 
      key: "specialization", 
      header: "Specialization",
      render: (teacher: Teacher) => (
        <span className="text-white font-medium">{teacher.specialization || 'N/A'}</span>
      )
    },
    { 
      key: "experience", 
      header: "Experience (years)",
      render: (teacher: Teacher) => (
        <span className="text-white font-medium">{teacher.experience || 0}</span>
      )
    },
    {
      key: "status",
      header: "Status",
      render: (teacher: Teacher) => {
        const status = teacher.status || 'unknown';
        const colorClass = 
          status === "active" ? "bg-green-600 text-white" :
          status === "on-leave" ? "bg-yellow-600 text-white" :
          status === "inactive" ? "bg-gray-600 text-white" :
          status === "resigned" ? "bg-red-600 text-white" :
          "bg-gray-600 text-white";
        
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-bold capitalize ${colorClass}`}>
            {status}
          </span>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Teachers Management</h1>
          <p className="text-white/60 mt-1">Total Teachers: {totalCount}</p>
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
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-400 to-emerald-500 rounded-lg text-white hover:from-green-500 hover:to-emerald-600 transition-colors font-bold"
          >
            <Plus className="w-4 h-4" />
            Add Teacher
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <SearchBar
          value={search}
          onChange={handleSearchChange}
          placeholder="Search by name, email, employee ID..."
        />

        {filterOpen && (
          <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="text"
                placeholder="Specialization"
                value={selectedSpecialization}
                onChange={(e) => {
                  setSelectedSpecialization(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white/95 placeholder-white/50 focus:outline-none focus:border-yellow-400 font-medium"
              />
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
                <option value="on-leave" className="bg-gray-800 text-white">On Leave</option>
                <option value="inactive" className="bg-gray-800 text-white">Inactive</option>
                <option value="resigned" className="bg-gray-800 text-white">Resigned</option>
              </select>
              <button
                onClick={clearFilters}
                className="px-4 py-2 bg-white/10 rounded-lg text-white hover:bg-white/20 transition-colors font-bold"
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

      <AddTeacherModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSuccess={handleAddSuccess}
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