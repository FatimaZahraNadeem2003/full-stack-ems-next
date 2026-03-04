"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import http from "@/services/http";
import toast from "react-hot-toast";
import DataTable from "@/app/components/ui/DataTable";
import SearchBar from "@/app/components/ui/SearchBar";
import ConfirmModal from "@/app/components/ui/ConfirmModal";
import AddScheduleModal from "./components/AddScheduleModal";
import { Plus, Filter, Calendar as CalendarIcon, X } from "lucide-react";
import debounce from "lodash/debounce";

interface Schedule {
  _id: string;
  courseId: {
    _id: string;
    name: string;
    code: string;
  };
  teacherId: {
    _id: string;
    userId: {
      firstName: string;
      lastName: string;
    };
  };
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  room: string;
  building: string;
  semester: string;
  academicYear: string;
  status: string;
}

const SchedulesPage = () => {
  const router = useRouter();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedDay, setSelectedDay] = useState("");
  const [selectedTeacher, setSelectedTeacher] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: "" });
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");
  const [uniqueDays] = useState([
    "monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"
  ]);
  const [uniqueStatuses] = useState(["scheduled", "cancelled", "completed"]);

  useEffect(() => {
    fetchSchedules();
  }, [currentPage, selectedDay, selectedTeacher, selectedCourse, selectedStatus]);

  useEffect(() => {
    const debouncedSearch = debounce(() => {
      setCurrentPage(1);
      fetchSchedules();
    }, 500);

    if (search !== undefined) {
      debouncedSearch();
    }

    return () => {
      debouncedSearch.cancel();
    };
  }, [search]);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "10",
      });
      
      if (search && search.trim() !== "") {
        params.append("search", search.trim());
      }
      if (selectedDay && selectedDay !== "") {
        params.append("dayOfWeek", selectedDay);
      }
      if (selectedTeacher && selectedTeacher !== "") {
        params.append("teacherId", selectedTeacher);
      }
      if (selectedCourse && selectedCourse !== "") {
        params.append("courseId", selectedCourse);
      }
      if (selectedStatus && selectedStatus !== "") {
        params.append("status", selectedStatus);
      }

      console.log("Fetching schedules with params:", params.toString());
      
      const response = await http.get(`/admin/schedules?${params}`);
      console.log("Schedules response:", response.data);
      
      if (response.data.success) {
        setSchedules(response.data.data || []);
        setTotalPages(response.data.pages || 1);
        setTotalCount(response.data.total || response.data.data.length);
      } else if (Array.isArray(response.data)) {
        setSchedules(response.data);
        setTotalPages(1);
        setTotalCount(response.data.length);
      } else {
        setSchedules([]);
        setTotalPages(1);
        setTotalCount(0);
      }
    } catch (error: any) {
      console.error("Error fetching schedules:", error);
      toast.error(error.response?.data?.msg || "Failed to load schedules");
      setSchedules([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await http.delete(`/admin/schedules/${id}`);
      toast.success("Schedule deleted successfully");
      fetchSchedules();
    } catch (error: any) {
      console.error("Error deleting schedule:", error);
      toast.error(error.response?.data?.msg || "Failed to delete schedule");
    }
  };

  const clearFilters = () => {
    setSelectedDay("");
    setSelectedTeacher("");
    setSelectedCourse("");
    setSelectedStatus("");
    setSearch("");
    setCurrentPage(1);
    setTimeout(() => {
      fetchSchedules();
    }, 100);
  };

  const getDayBadgeColor = (day: string) => {
    const colors: Record<string, string> = {
      monday: "bg-blue-500/20 text-blue-400",
      tuesday: "bg-green-500/20 text-green-400",
      wednesday: "bg-purple-500/20 text-purple-400",
      thursday: "bg-yellow-500/20 text-yellow-400",
      friday: "bg-pink-500/20 text-pink-400",
      saturday: "bg-indigo-500/20 text-indigo-400",
      sunday: "bg-red-500/20 text-red-400",
    };
    return colors[day] || "bg-gray-500/20 text-gray-400";
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      scheduled: "bg-green-500/20 text-green-400",
      cancelled: "bg-red-500/20 text-red-400",
      completed: "bg-blue-500/20 text-blue-400",
    };
    return colors[status] || "bg-gray-500/20 text-gray-400";
  };

  const dayNames: Record<string, string> = {
    monday: "Monday",
    tuesday: "Tuesday",
    wednesday: "Wednesday",
    thursday: "Thursday",
    friday: "Friday",
    saturday: "Saturday",
    sunday: "Sunday",
  };

  const columns = [
    {
      key: "dayOfWeek",
      header: "Day",
      render: (schedule: Schedule) => (
        <span className={`px-2 py-1 rounded-full text-xs capitalize ${getDayBadgeColor(schedule.dayOfWeek)}`}>
          {dayNames[schedule.dayOfWeek] || schedule.dayOfWeek}
        </span>
      ),
    },
    {
      key: "time",
      header: "Time",
      render: (schedule: Schedule) => (
        <span className="text-white">
          {schedule.startTime} - {schedule.endTime}
        </span>
      ),
    },
    {
      key: "course",
      header: "Course",
      render: (schedule: Schedule) => (
        <div>
          <p className="text-white font-medium">{schedule.courseId?.name || 'N/A'}</p>
          <p className="text-white/60 text-xs">{schedule.courseId?.code || 'N/A'}</p>
        </div>
      ),
    },
    {
      key: "teacher",
      header: "Teacher",
      render: (schedule: Schedule) => (
        <span className="text-white">
          {schedule.teacherId?.userId?.firstName || ''} {schedule.teacherId?.userId?.lastName || ''}
        </span>
      ),
    },
    {
      key: "room",
      header: "Room",
      render: (schedule: Schedule) => (
        <div>
          <p className="text-white">{schedule.room}</p>
          {schedule.building && (
            <p className="text-white/60 text-xs">{schedule.building}</p>
          )}
        </div>
      ),
    },
    {
      key: "semester",
      header: "Semester",
      render: (schedule: Schedule) => (
        <div>
          <p className="text-white">{schedule.semester}</p>
          <p className="text-white/60 text-xs">{schedule.academicYear}</p>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (schedule: Schedule) => (
        <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadge(schedule.status)}`}>
          {schedule.status}
        </span>
      ),
    },
  ];

  const CalendarView = () => {
    const groupedByDay = uniqueDays.reduce((acc, day) => {
      acc[day] = schedules.filter(s => s.dayOfWeek === day);
      return acc;
    }, {} as Record<string, Schedule[]>);

    return (
      <div className="grid grid-cols-1 md:grid-cols-7 gap-2">
        {uniqueDays.map((day) => (
          <div key={day} className="bg-white/5 rounded-lg border border-white/10">
            <div className="p-2 border-b border-white/10 bg-white/5">
              <h3 className="text-white font-medium capitalize text-center">{dayNames[day]}</h3>
            </div>
            <div className="p-2 space-y-2 min-h-[200px] max-h-[400px] overflow-y-auto">
              {groupedByDay[day]?.map((schedule) => (
                <div
                  key={schedule._id}
                  className="p-2 bg-white/10 rounded-lg text-xs cursor-pointer hover:bg-white/20 transition-colors"
                  onClick={() => router.push(`/Admin/schedules/${schedule._id}`)}
                >
                  <p className="text-white font-medium">{schedule.startTime}</p>
                  <p className="text-white/80 truncate">{schedule.courseId?.name}</p>
                  <p className="text-white/60">Room {schedule.room}</p>
                </div>
              ))}
              {(!groupedByDay[day] || groupedByDay[day].length === 0) && (
                <p className="text-white/40 text-center text-xs py-4">No classes</p>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Schedule Management</h1>
          <p className="text-white/60 mt-1">Total Schedules: {totalCount}</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setViewMode(viewMode === "list" ? "calendar" : "list")}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-lg text-white hover:bg-white/20 transition-colors"
          >
            <CalendarIcon className="w-4 h-4" />
            {viewMode === "list" ? "Calendar View" : "List View"}
          </button>
          <button
            onClick={() => setFilterOpen(!filterOpen)}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-lg text-white hover:bg-white/20 transition-colors"
          >
            <Filter className="w-4 h-4" />
            {filterOpen ? "Hide Filters" : "Show Filters"}
          </button>
          <button
            onClick={() => setAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-lg text-white hover:from-yellow-500 hover:to-orange-500 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Schedule
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <SearchBar
          value={search}
          onChange={(value) => setSearch(value)}
          placeholder="Search by course, teacher, room..."
        />

        {filterOpen && (
          <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-white font-medium">Filters</h3>
              <button
                onClick={clearFilters}
                className="text-sm text-yellow-400 hover:text-yellow-300 flex items-center gap-1"
              >
                <X className="w-3 h-3" /> Clear All
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <select
                value={selectedDay}
                onChange={(e) => {
                  setSelectedDay(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
              >
                <option value="">All Days</option>
                {uniqueDays.map(day => (
                  <option key={day} value={day}>{dayNames[day]}</option>
                ))}
              </select>
              
              <input
                type="text"
                placeholder="Teacher ID"
                value={selectedTeacher}
                onChange={(e) => {
                  setSelectedTeacher(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40"
              />
              
              <input
                type="text"
                placeholder="Course ID"
                value={selectedCourse}
                onChange={(e) => {
                  setSelectedCourse(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40"
              />
              
              <select
                value={selectedStatus}
                onChange={(e) => {
                  setSelectedStatus(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
              >
                <option value="">All Status</option>
                {uniqueStatuses.map(status => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
              
              <button
                onClick={clearFilters}
                className="px-4 py-2 bg-white/10 rounded-lg text-white hover:bg-white/20 transition-colors"
              >
                Apply Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {viewMode === "list" ? (
        <DataTable
          columns={columns}
          data={schedules}
          loading={loading}
          onView={(schedule) => router.push(`/Admin/schedules/${schedule._id}`)}
          onEdit={(schedule) => router.push(`/Admin/schedules/${schedule._id}/edit`)}
          onDelete={(schedule) => setDeleteModal({ isOpen: true, id: schedule._id })}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      ) : (
        <CalendarView />
      )}

      <AddScheduleModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSuccess={() => {
          setAddModalOpen(false);
          fetchSchedules();
        }}
      />

      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, id: "" })}
        onConfirm={() => handleDelete(deleteModal.id)}
        title="Delete Schedule"
        message="Are you sure you want to delete this schedule? This action cannot be undone."
      />
    </div>
  );
};

export default SchedulesPage;