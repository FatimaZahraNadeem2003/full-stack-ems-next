"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import http from "@/services/http";
import toast from "react-hot-toast";
import DataTable from "@/app/components/ui/DataTable";
import SearchBar from "@/app/components/ui/SearchBar";
import ConfirmModal from "@/app/components/ui/ConfirmModal";
import AddScheduleModal from "./components/AddScheduleModal";
import { Plus, Filter, Calendar as CalendarIcon } from "lucide-react";

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
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: "" });
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");

  const daysOfWeek = [
    "monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"
  ];

  useEffect(() => {
    fetchSchedules();
  }, [currentPage, selectedDay, selectedTeacher, selectedCourse, selectedStatus]);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "10",
      });
      if (search) params.append("search", search);
      if (selectedDay) params.append("dayOfWeek", selectedDay);
      if (selectedTeacher) params.append("teacherId", selectedTeacher);
      if (selectedCourse) params.append("courseId", selectedCourse);
      if (selectedStatus) params.append("status", selectedStatus);

      const response = await http.get(`/admin/schedules?${params}`);
      setSchedules(response.data.data);
      setTotalPages(response.data.pages || 1);
    } catch (error) {
      console.error("Error fetching schedules:", error);
      toast.error("Failed to load schedules");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await http.delete(`/admin/schedules/${id}`);
      toast.success("Schedule deleted successfully");
      fetchSchedules();
    } catch (error) {
      console.error("Error deleting schedule:", error);
      toast.error("Failed to delete schedule");
    }
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

  const columns = [
    {
      key: "dayOfWeek",
      header: "Day",
      render: (schedule: Schedule) => (
        <span className={`px-2 py-1 rounded-full text-xs capitalize ${getDayBadgeColor(schedule.dayOfWeek)}`}>
          {schedule.dayOfWeek}
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
          <p className="text-white font-medium">{schedule.courseId?.name}</p>
          <p className="text-white/60 text-xs">{schedule.courseId?.code}</p>
        </div>
      ),
    },
    {
      key: "teacher",
      header: "Teacher",
      render: (schedule: Schedule) => (
        <span className="text-white">
          {schedule.teacherId?.userId?.firstName} {schedule.teacherId?.userId?.lastName}
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
        <span
          className={`px-2 py-1 rounded-full text-xs ${
            schedule.status === "scheduled"
              ? "bg-green-500/20 text-green-400"
              : schedule.status === "cancelled"
              ? "bg-red-500/20 text-red-400"
              : "bg-blue-500/20 text-blue-400"
          }`}
        >
          {schedule.status}
        </span>
      ),
    },
  ];

  const CalendarView = () => {
    const groupedByDay = daysOfWeek.reduce((acc, day) => {
      acc[day] = schedules.filter(s => s.dayOfWeek === day);
      return acc;
    }, {} as Record<string, Schedule[]>);

    return (
      <div className="grid grid-cols-7 gap-2">
        {daysOfWeek.map((day) => (
          <div key={day} className="bg-white/5 rounded-lg border border-white/10">
            <div className="p-2 border-b border-white/10">
              <h3 className="text-white font-medium capitalize text-center">{day}</h3>
            </div>
            <div className="p-2 space-y-2 min-h-[200px]">
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
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Schedule Management</h1>
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
            Filter
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
          onChange={setSearch}
          onSearch={() => {
            setCurrentPage(1);
            fetchSchedules();
          }}
          placeholder="Search by course, teacher, room..."
        />

        {filterOpen && (
          <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <select
                value={selectedDay}
                onChange={(e) => setSelectedDay(e.target.value)}
                className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
              >
                <option value="">All Days</option>
                {daysOfWeek.map((day) => (
                  <option key={day} value={day} className="capitalize">
                    {day}
                  </option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Teacher ID"
                value={selectedTeacher}
                onChange={(e) => setSelectedTeacher(e.target.value)}
                className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40"
              />
              <input
                type="text"
                placeholder="Course ID"
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40"
              />
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
              >
                <option value="">All Status</option>
                <option value="scheduled">Scheduled</option>
                <option value="cancelled">Cancelled</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div className="flex justify-end mt-4">
              <button
                onClick={() => {
                  setSelectedDay("");
                  setSelectedTeacher("");
                  setSelectedCourse("");
                  setSelectedStatus("");
                  setCurrentPage(1);
                  fetchSchedules();
                }}
                className="px-4 py-2 bg-white/10 rounded-lg text-white hover:bg-white/20 transition-colors"
              >
                Clear Filters
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