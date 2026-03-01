"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import http from "@/services/http";
import toast from "react-hot-toast";
import DataTable from "@/app/components/ui/DataTable";
import SearchBar from "@/app/components/ui/SearchBar";
import ConfirmModal from "@/app/components/ui/ConfirmModal";
import { Plus, Filter } from "lucide-react";

interface Course {
  _id: string;
  name: string;
  code: string;
  credits: number;
  department: string;
  level: string;
  status: string;
  enrolledCount: number;
  teacherId?: {
    _id: string;
    userId: {
      firstName: string;
      lastName: string;
    };
  };
  createdAt: string;
}

const CoursesPage = () => {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: "" });
  const [filterOpen, setFilterOpen] = useState(false);

  useEffect(() => {
    fetchCourses();
  }, [currentPage, selectedDepartment, selectedLevel, selectedStatus]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "10",
      });
      if (search) params.append("search", search);
      if (selectedDepartment) params.append("department", selectedDepartment);
      if (selectedLevel) params.append("level", selectedLevel);
      if (selectedStatus) params.append("status", selectedStatus);

      const response = await http.get(`/admin/courses?${params}`);
      setCourses(response.data.data);
      setTotalPages(response.data.pages || 1);
    } catch (error) {
      console.error("Error fetching courses:", error);
      toast.error("Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await http.delete(`/admin/courses/${id}`);
      toast.success("Course deleted successfully");
      fetchCourses();
    } catch (error) {
      console.error("Error deleting course:", error);
      toast.error("Failed to delete course");
    }
  };

  const columns = [
    { key: "code", header: "Code" },
    { key: "name", header: "Course Name" },
    {
      key: "teacher",
      header: "Teacher",
      render: (course: Course) => (
        <span>
          {course.teacherId?.userId?.firstName} {course.teacherId?.userId?.lastName}
        </span>
      ),
    },
    { key: "credits", header: "Credits" },
    { key: "department", header: "Department" },
    { key: "level", header: "Level" },
    {
      key: "enrolledCount",
      header: "Enrolled",
      render: (course: Course) => (
        <span>{course.enrolledCount || 0}/{course.maxStudents || 50}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (course: Course) => (
        <span
          className={`px-2 py-1 rounded-full text-xs ${
            course.status === "active"
              ? "bg-green-500/20 text-green-400"
              : course.status === "upcoming"
              ? "bg-blue-500/20 text-blue-400"
              : course.status === "completed"
              ? "bg-gray-500/20 text-gray-400"
              : "bg-yellow-500/20 text-yellow-400"
          }`}
        >
          {course.status}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Courses Management</h1>
        <div className="flex gap-3">
          <button
            onClick={() => setFilterOpen(!filterOpen)}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-lg text-white hover:bg-white/20 transition-colors"
          >
            <Filter className="w-4 h-4" />
            Filter
          </button>
          <button
            onClick={() => router.push("/Admin/courses/add")}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-lg text-white hover:from-yellow-500 hover:to-orange-500 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Course
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <SearchBar
          value={search}
          onChange={setSearch}
          onSearch={() => {
            setCurrentPage(1);
            fetchCourses();
          }}
          placeholder="Search by name, code, department..."
        />

        {filterOpen && (
          <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <input
                type="text"
                placeholder="Department"
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40"
              />
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
              >
                <option value="">All Levels</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="upcoming">Upcoming</option>
                <option value="completed">Completed</option>
                <option value="inactive">Inactive</option>
              </select>
              <button
                onClick={() => {
                  setSelectedDepartment("");
                  setSelectedLevel("");
                  setSelectedStatus("");
                  setCurrentPage(1);
                  fetchCourses();
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
        data={courses}
        loading={loading}
        onView={(course) => router.push(`/Admin/courses/${course._id}`)}
        onEdit={(course) => router.push(`/Admin/courses/${course._id}/edit`)}
        onDelete={(course) => setDeleteModal({ isOpen: true, id: course._id })}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />

      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, id: "" })}
        onConfirm={() => handleDelete(deleteModal.id)}
        title="Delete Course"
        message="Are you sure you want to delete this course? This will also remove all enrollments."
      />
    </div>
  );
};

export default CoursesPage;