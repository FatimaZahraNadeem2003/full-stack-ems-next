"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import http from "@/services/http";
import toast from "react-hot-toast";
import DataTable from "@/app/components/ui/DataTable";
import SearchBar from "@/app/components/ui/SearchBar";
import ConfirmModal from "@/app/components/ui/ConfirmModal";
import AddCourseModal from "./components/AddCourseModal";
import { Plus, Filter, X } from "lucide-react";
import debounce from "lodash/debounce";

interface Course {
  _id: string;
  name: string;
  code: string;
  credits: number;
  department: string;
  level: string;
  status: string;
  enrolledCount: number;
  maxStudents?: number;
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
  const [totalCount, setTotalCount] = useState(0);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: "" });
  const [filterOpen, setFilterOpen] = useState(false);
  const [addCourseModal, setAddCourseModal] = useState({ isOpen: false });
  const [uniqueDepartments, setUniqueDepartments] = useState<string[]>([]);

  useEffect(() => {
    fetchCourses();
    fetchUniqueDepartments();
  }, [currentPage, selectedDepartment, selectedLevel, selectedStatus]);

  useEffect(() => {
    const debouncedSearch = debounce(() => {
      setCurrentPage(1);
      fetchCourses();
    }, 500);

    if (search !== undefined) {
      debouncedSearch();
    }

    return () => {
      debouncedSearch.cancel();
    };
  }, [search]);

  const fetchUniqueDepartments = async () => {
    try {
      const response = await http.get("/admin/courses?limit=1000");
      const allCourses = response.data.data || [];
      const departments = [...new Set(allCourses.map((c: Course) => c.department).filter(Boolean))];
      setUniqueDepartments(departments);
    } catch (error) {
      console.error("Error fetching departments:", error);
    }
  };

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "10",
      });
      
      if (search && search.trim() !== "") {
        params.append("search", search.trim());
      }
      if (selectedDepartment && selectedDepartment !== "") {
        params.append("department", selectedDepartment);
      }
      if (selectedLevel && selectedLevel !== "") {
        params.append("level", selectedLevel);
      }
      if (selectedStatus && selectedStatus !== "") {
        params.append("status", selectedStatus);
      }

      console.log("Fetching with params:", params.toString());
      
      const response = await http.get(`/admin/courses?${params}`);
      
      if (response.data.success) {
        setCourses(response.data.data || []);
        setTotalPages(response.data.pages || 1);
        setTotalCount(response.data.total || response.data.data.length);
      } else {
        setCourses([]);
        setTotalPages(1);
        setTotalCount(0);
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
      toast.error("Failed to load courses");
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCourseSuccess = () => {
    fetchCourses();
    fetchUniqueDepartments();
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

  const clearFilters = () => {
    setSelectedDepartment("");
    setSelectedLevel("");
    setSelectedStatus("");
    setSearch("");
    setCurrentPage(1);
    setTimeout(() => {
      fetchCourses();
    }, 100);
  };

  const columns = [
    { key: "code", header: "Code" },
    { key: "name", header: "Course Name" },
    {
      key: "teacher",
      header: "Teacher",
      render: (course: Course) => (
        <span className="text-white font-medium">
          {course.teacherId?.userId?.firstName || ''} {course.teacherId?.userId?.lastName || ''}
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
        <span className="text-white font-medium">{course.enrolledCount || 0}/{course.maxStudents || 50}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (course: Course) => {
        const colors = {
          active: "bg-green-600 text-white",
          upcoming: "bg-blue-600 text-white",
          completed: "bg-gray-600 text-white",
          inactive: "bg-yellow-600 text-white",
        };
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-bold ${colors[course.status as keyof typeof colors] || "bg-gray-500/20 text-gray-400"}`}>
            {course.status.toUpperCase()}
          </span>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Courses Management</h1>
          <p className="text-white/60 mt-1">Total Courses: {totalCount}</p>
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
            onClick={() => setAddCourseModal({ isOpen: true })}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-lg text-white hover:from-yellow-500 hover:to-orange-500 transition-colors font-bold"
          >
            <Plus className="w-4 h-4" />
            Add Course
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <SearchBar
          value={search}
          onChange={(value) => setSearch(value)}
          placeholder="Search by name, code, department..."
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
                value={selectedDepartment}
                onChange={(e) => {
                  setSelectedDepartment(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white/95 focus:outline-none focus:border-yellow-400 font-medium"
              >
                <option value="" className="bg-gray-800 text-white">All Departments</option>
                {uniqueDepartments.map(dept => (
                  <option key={dept} value={dept} className="bg-gray-800 text-white">{dept}</option>
                ))}
              </select>
              
              <select
                value={selectedLevel}
                onChange={(e) => {
                  setSelectedLevel(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white/95 focus:outline-none focus:border-yellow-400 font-medium"
              >
                <option value="" className="bg-gray-800 text-white">All Levels</option>
                <option value="beginner" className="bg-gray-800 text-white">Beginner</option>
                <option value="intermediate" className="bg-gray-800 text-white">Intermediate</option>
                <option value="advanced" className="bg-gray-800 text-white">Advanced</option>
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
                <option value="upcoming" className="bg-gray-800 text-white">Upcoming</option>
                <option value="completed" className="bg-gray-800 text-white">Completed</option>
                <option value="inactive" className="bg-gray-800 text-white">Inactive</option>
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

      <AddCourseModal
        isOpen={addCourseModal.isOpen}
        onClose={() => setAddCourseModal({ isOpen: false })}
        onSuccess={handleAddCourseSuccess}
      />
    </div>
  );
};

export default CoursesPage;