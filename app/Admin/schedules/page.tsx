"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState, useEffect, useCallback } from "react";
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
  }, [currentPage, selectedDay, selectedTeacher, selectedCourse, selectedStatus, search]);

  const debouncedFetch = useCallback(
    debounce(() => {
      setCurrentPage(1);
      fetchSchedules();
    }, 500),
    [selectedDay, selectedTeacher, selectedCourse, selectedStatus]
  );

  const handleSearchChange = (value: string) => {
    setSearch(value);
    debouncedFetch();
  };

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      
      const params: any = {
        page: currentPage,
        limit: 10
      };
      
      if (search && search.trim() !== "") {
        params.search = search.trim();
        console.log("Search param added:", params.search);
      }
      
      if (selectedDay && selectedDay !== "") {
        params.dayOfWeek = selectedDay;
        console.log("Day filter added:", params.dayOfWeek);
      }
      
      if (selectedTeacher && selectedTeacher !== "") {
        params.teacherId = selectedTeacher;
        console.log("Teacher filter added:", params.teacherId);
      }
      
      if (selectedCourse && selectedCourse !== "") {
        params.courseId = selectedCourse;
        console.log("Course filter added:", params.courseId);
      }
      
      if (selectedStatus && selectedStatus !== "") {
        params.status = selectedStatus;
        console.log("Status filter added:", params.status);
      }

      console.log("Fetching schedules with params:", params);
      
      const response = await http.get("/admin/schedules", { params });
      console.log("Schedules response:", response.data);
      
      if (response.data.success) {
        setSchedules(response.data.data || []);
        setTotalPages(response.data.pages || 1);
        setTotalCount(response.data.total || response.data.data.length);
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
    console.log("Clearing all filters");
    setSelectedDay("");
    setSelectedTeacher("");
    setSelectedCourse("");
    setSelectedStatus("");
    setSearch("");
    setCurrentPage(1);
  };

  const handleFilterChange = (filterType: string, value: string) => {
    console.log(`Filter ${filterType} changed to:`, value);
    setCurrentPage(1); 
    
    switch(filterType) {
      case 'day':
        setSelectedDay(value);
        break;
      case 'teacher':
        setSelectedTeacher(value);
        break;
      case 'course':
        setSelectedCourse(value);
        break;
      case 'status':
        setSelectedStatus(value);
        break;
    }
  };

  const getDayBadgeColor = (day: string) => {
    const colors: Record<string, string> = {
      monday: "bg-blue-600 text-white",
      tuesday: "bg-green-600 text-white",
      wednesday: "bg-purple-600 text-white",
      thursday: "bg-yellow-600 text-white",
      friday: "bg-pink-600 text-white",
      saturday: "bg-indigo-600 text-white",
      sunday: "bg-red-600 text-white",
    };
    return colors[day] || "bg-gray-600 text-white";
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      scheduled: "bg-green-600 text-white",
      cancelled: "bg-red-600 text-white",
      completed: "bg-blue-600 text-white",
    };
    return colors[status] || "bg-gray-600 text-white";
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
        <span className={`px-2 py-1 rounded-full text-xs font-bold capitalize ${getDayBadgeColor(schedule.dayOfWeek)}`}>
          {dayNames[schedule.dayOfWeek] || schedule.dayOfWeek}
        </span>
      ),
    },
    {
      key: "time",
      header: "Time",
      render: (schedule: Schedule) => (
        <span className="text-white font-medium">
          {schedule.startTime} - {schedule.endTime}
        </span>
      ),
    },
    {
      key: "course",
      header: "Course",
      render: (schedule: Schedule) => (
        <div>
          <p className="text-white font-bold">{schedule.courseId?.name || 'N/A'}</p>
          <p className="text-white/80 text-xs font-medium">{schedule.courseId?.code || 'N/A'}</p>
        </div>
      ),
    },
    {
      key: "teacher",
      header: "Teacher",
      render: (schedule: Schedule) => (
        <span className="text-white font-medium">
          {schedule.teacherId?.userId?.firstName || ''} {schedule.teacherId?.userId?.lastName || ''}
        </span>
      ),
    },
    {
      key: "room",
      header: "Room",
      render: (schedule: Schedule) => (
        <div>
          <p className="text-white font-medium">{schedule.room}</p>
          {schedule.building && (
            <p className="text-white/80 text-xs font-medium">{schedule.building}</p>
          )}
        </div>
      ),
    },
    {
      key: "semester",
      header: "Semester",
      render: (schedule: Schedule) => (
        <div>
          <p className="text-white font-medium">{schedule.semester}</p>
          <p className="text-white/80 text-xs font-medium">{schedule.academicYear}</p>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (schedule: Schedule) => (
        <span className={`px-2 py-1 rounded-full text-xs font-bold ${getStatusBadge(schedule.status)}`}>
          {schedule.status.toUpperCase()}
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
              <h3 className="text-white font-bold capitalize text-center">{dayNames[day]}</h3>
            </div>
            <div className="p-2 space-y-2 min-h-[200px] max-h-[400px] overflow-y-auto">
              {groupedByDay[day]?.map((schedule) => (
                <div
                  key={schedule._id}
                  className="p-2 bg-white/10 rounded-lg text-xs cursor-pointer hover:bg-white/20 transition-colors"
                  onClick={() => router.push(`/Admin/schedules/${schedule._id}`)}
                >
                  <p className="text-white font-bold">{schedule.startTime}</p>
                  <p className="text-white/90 font-medium truncate">{schedule.courseId?.name}</p>
                  <p className="text-white/80">Room {schedule.room}</p>
                </div>
              ))}
              {(!groupedByDay[day] || groupedByDay[day].length === 0) && (
                <p className="text-white/60 text-center text-xs py-4 font-medium">No classes</p>
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
            className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-lg text-white hover:bg-white/20 transition-colors font-medium"
          >
            <CalendarIcon className="w-4 h-4" />
            {viewMode === "list" ? "Calendar View" : "List View"}
          </button>
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
            Add Schedule
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <SearchBar
          value={search}
          onChange={handleSearchChange}
          placeholder="Search by course name, teacher name, room..."
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
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <select
                value={selectedDay}
                onChange={(e) => handleFilterChange('day', e.target.value)}
                className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white/95 focus:outline-none focus:border-yellow-400 font-medium"
              >
                <option value="" className="bg-gray-800 text-white">All Days</option>
                {uniqueDays.map(day => (
                  <option key={day} value={day} className="bg-gray-800 text-white capitalize">
                    {dayNames[day]}
                  </option>
                ))}
              </select>
              
              <input
                type="text"
                placeholder="Teacher ID / Name"
                value={selectedTeacher}
                onChange={(e) => handleFilterChange('teacher', e.target.value)}
                className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white/95 placeholder-white/50 focus:outline-none focus:border-yellow-400 font-medium"
              />
              
              <input
                type="text"
                placeholder="Course ID / Name"
                value={selectedCourse}
                onChange={(e) => handleFilterChange('course', e.target.value)}
                className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white/95 placeholder-white/50 focus:outline-none focus:border-yellow-400 font-medium"
              />
              
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