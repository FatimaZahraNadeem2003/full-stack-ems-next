"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import http from "@/services/http";
import toast from "react-hot-toast";
import { 
  ArrowLeft, 
  Edit, 
  Trash2,
  Calendar,
  Clock,
  MapPin,
  User,
  BookOpen,
  Building,
  Hash,
  Tag,
  Award,
  Mail
} from "lucide-react";
import LoadingSpinner from "@/app/components/ui/LoadingSpinner";
import ConfirmModal from "@/app/components/ui/ConfirmModal";

interface ScheduleDetail {
  _id: string;
  courseId: {
    _id: string;
    name: string;
    code: string;
    credits: number;
    department: string;
  };
  teacherId: {
    _id: string;
    userId: {
      firstName: string;
      lastName: string;
      email: string;
    };
    specialization: string;
    qualification: string;
  };
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  room: string;
  building?: string;
  duration?: number;
  semester: string;
  academicYear: string;
  isRecurring: boolean;
  status: string;
  createdAt: string;
  updatedAt: string;
}

const ScheduleDetailPage = () => {
  const router = useRouter();
  const params = useParams();
  const scheduleId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [schedule, setSchedule] = useState<ScheduleDetail | null>(null);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: "" });

  useEffect(() => {
    if (scheduleId) {
      fetchScheduleDetails();
    }
  }, [scheduleId]);

  const fetchScheduleDetails = async () => {
    try {
      setLoading(true);
      const response = await http.get(`/admin/schedules/${scheduleId}`);
      console.log("Schedule details:", response.data);
      
      const scheduleData = response.data.data || response.data;
      setSchedule(scheduleData);
      
    } catch (error: any) {
      console.error("Error fetching schedule:", error);
      toast.error(error.response?.data?.msg || "Failed to load schedule details");
      router.push("/Admin/schedules");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await http.delete(`/admin/schedules/${scheduleId}`);
      toast.success("Schedule deleted successfully");
      router.push("/Admin/schedules");
    } catch (error: any) {
      console.error("Error deleting schedule:", error);
      toast.error(error.response?.data?.msg || "Failed to delete schedule");
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      scheduled: "bg-green-600 text-white/80",
      cancelled: "bg-red-600 text-white/80",
      completed: "bg-blue-600 text-white/80",
    };
    return colors[status as keyof typeof colors] || "bg-gray-500/20 text-gray-400";
  };

  const getDayDisplay = (day: string) => {
    const days = {
      monday: "Monday",
      tuesday: "Tuesday",
      wednesday: "Wednesday",
      thursday: "Thursday",
      friday: "Friday",
      saturday: "Saturday",
      sunday: "Sunday",
    };
    return days[day as keyof typeof days] || day;
  };

  const InfoRow = ({ icon, label, value }: any) => (
    <div className="flex items-start gap-3 p-3 bg-white/5 rounded-lg border border-white/10">
      <div className="p-2 bg-yellow-400/20 rounded-lg">{icon}</div>
      <div>
        <p className="text-white/60 text-xs">{label}</p>
        <p className="text-white font-medium break-words">{value || "Not provided"}</p>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!schedule) {
    return (
      <div className="text-center py-8">
        <Calendar className="w-16 h-16 text-white/40 mx-auto mb-4" />
        <p className="text-white">Schedule not found</p>
        <button
          onClick={() => router.push("/Admin/schedules")}
          className="mt-4 px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-lg text-white"
        >
          Back to Schedules
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 bg-white/10 rounded-lg text-white hover:bg-white/20 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white">Schedule Details</h1>
            <p className="text-white/60">ID: {schedule._id.slice(-6)}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => router.push(`/Admin/schedules/${scheduleId}/edit`)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-lg text-white hover:from-yellow-500 hover:to-orange-500 transition-colors"
          >
            <Edit className="w-4 h-4" />
            Edit Schedule
          </button>
          <button
            onClick={() => setDeleteModal({ isOpen: true, id: scheduleId })}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white/80 rounded-lg hover:bg-red-500/30 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span className={`px-3 py-1 rounded-full text-sm ${getStatusBadge(schedule.status)}`}>
          {schedule.status}
        </span>
        {schedule.isRecurring && (
          <span className="px-3 py-1 rounded-full text-sm bg-purple-700 text-white">
            Recurring Weekly
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-yellow-400" /> Schedule Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-white/5 rounded-lg">
                <p className="text-white/60 text-sm mb-1">Day</p>
                <p className="text-white text-lg font-semibold capitalize">{getDayDisplay(schedule.dayOfWeek)}</p>
              </div>
              <div className="p-4 bg-white/5 rounded-lg">
                <p className="text-white/60 text-sm mb-1">Time</p>
                <p className="text-white text-lg font-semibold">{schedule.startTime} - {schedule.endTime}</p>
              </div>
              <div className="p-4 bg-white/5 rounded-lg">
                <p className="text-white/60 text-sm mb-1">Duration</p>
                <p className="text-white text-lg font-semibold">{schedule.duration || 90} minutes</p>
              </div>
              <div className="p-4 bg-white/5 rounded-lg">
                <p className="text-white/60 text-sm mb-1">Room</p>
                <p className="text-white text-lg font-semibold">{schedule.room}</p>
              </div>
            </div>
            {schedule.building && (
              <div className="mt-4 p-3 bg-white/5 rounded-lg">
                <p className="text-white/60 text-sm">Building</p>
                <p className="text-white">{schedule.building}</p>
              </div>
            )}
          </div>

          <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-yellow-400" /> Course Information
            </h2>
            <div className="space-y-3">
              <InfoRow 
                icon={<BookOpen className="w-4 h-4" />} 
                label="Course Name" 
                value={schedule.courseId?.name} 
              />
              <InfoRow 
                icon={<Hash className="w-4 h-4" />} 
                label="Course Code" 
                value={schedule.courseId?.code} 
              />
              <InfoRow 
                icon={<Award className="w-4 h-4" />} 
                label="Credits" 
                value={schedule.courseId?.credits} 
              />
              <InfoRow 
                icon={<Tag className="w-4 h-4" />} 
                label="Department" 
                value={schedule.courseId?.department} 
              />
            </div>
            <button
              onClick={() => router.push(`/Admin/courses/${schedule.courseId?._id}`)}
              className="mt-4 w-full py-2 bg-white/10 rounded-lg text-white hover:bg-white/20 transition-colors"
            >
              View Course Details
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-yellow-400" /> Teacher
            </h2>
            {schedule.teacherId ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-yellow-400 to-orange-400 flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-medium">
                      {schedule.teacherId.userId?.firstName} {schedule.teacherId.userId?.lastName}
                    </p>
                    <p className="text-white/60 text-sm">{schedule.teacherId.specialization}</p>
                  </div>
                </div>
                <InfoRow
                  icon={<Mail className="w-4 h-4" />}
                  label="Email"
                  value={schedule.teacherId.userId?.email}
                />
                <InfoRow
                  icon={<Award className="w-4 h-4" />}
                  label="Qualification"
                  value={schedule.teacherId.qualification}
                />
                <button
                  onClick={() => router.push(`/Admin/teachers/${schedule.teacherId._id}`)}
                  className="mt-2 w-full py-2 bg-white/10 rounded-lg text-white hover:bg-white/20 transition-colors"
                >
                  View Teacher Profile
                </button>
              </div>
            ) : (
              <div className="text-center py-4">
                <User className="w-12 h-12 text-white/40 mx-auto mb-3" />
                <p className="text-white/60">No teacher assigned</p>
              </div>
            )}
          </div>

          <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Academic Details</h2>
            <div className="space-y-3">
              <InfoRow 
                icon={<Calendar className="w-4 h-4" />} 
                label="Semester" 
                value={schedule.semester} 
              />
              <InfoRow 
                icon={<Calendar className="w-4 h-4" />} 
                label="Academic Year" 
                value={schedule.academicYear} 
              />
              <InfoRow 
                icon={<Clock className="w-4 h-4" />} 
                label="Created" 
                value={new Date(schedule.createdAt).toLocaleDateString()} 
              />
              <InfoRow 
                icon={<Clock className="w-4 h-4" />} 
                label="Last Updated" 
                value={new Date(schedule.updatedAt).toLocaleDateString()} 
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={() => router.push(`/Admin/schedules?courseId=${schedule.courseId?._id}`)}
          className="p-4 bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 hover:border-white/40 transition-all duration-300 text-left"
        >
          <Calendar className="w-6 h-6 text-yellow-400 mb-2" />
          <h3 className="text-white font-medium">View All Schedules for this Course</h3>
          <p className="text-white/60 text-sm">Check other classes for {schedule.courseId?.name}</p>
        </button>

        <button
          onClick={() => router.push(`/Admin/schedules?teacherId=${schedule.teacherId?._id}`)}
          className="p-4 bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 hover:border-white/40 transition-all duration-300 text-left"
        >
          <User className="w-6 h-6 text-yellow-400 mb-2" />
          <h3 className="text-white font-medium">View {`Teacher's`} Schedule</h3>
          <p className="text-white/60 text-sm">See all classes for this teacher</p>
        </button>
      </div>

      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, id: "" })}
        onConfirm={handleDelete}
        title="Delete Schedule"
        message="Are you sure you want to delete this schedule? This action cannot be undone."
      />
    </div>
  );
};

export default ScheduleDetailPage;