"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import http from "@/services/http";
import toast from "react-hot-toast";
import { 
  ArrowLeft, 
  Edit, 
  Mail, 
  Phone, 
  Calendar, 
  MapPin, 
  BookOpen, 
  Hash, 
  Users, 
  Home, 
  UserCircle, 
  VenusAndMars,
  Briefcase,
  Award,
  Clock,
  GraduationCap,
  AlertCircle
} from "lucide-react";
import LoadingSpinner from "@/app/components/ui/LoadingSpinner";
import ConfirmModal from "@/app/components/ui/ConfirmModal";

interface TeacherDetail {
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
  dateOfBirth?: string;
  gender?: string;
  contactNumber: string;
  emergencyContact?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  joiningDate: string;
  status: string;
  bio?: string;
  profilePicture?: string;
  createdAt: string;
  updatedAt: string;
}

const TeacherDetailPage = () => {
  const router = useRouter();
  const params = useParams();
  const teacherId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [teacher, setTeacher] = useState<TeacherDetail | null>(null);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: "" });

  useEffect(() => {
    if (teacherId) {
      fetchTeacherDetails();
    }
  }, [teacherId]);

  const fetchTeacherDetails = async () => {
    try {
      setLoading(true);
      const response = await http.get(`/admin/teachers/${teacherId}`);
      console.log("Teacher details:", response.data);
      
      const teacherData = response.data.data || response.data;
      setTeacher(teacherData);
      
    } catch (error: any) {
      console.error("Error fetching teacher:", error);
      toast.error(error.response?.data?.msg || "Failed to load teacher details");
      router.push("/Admin/teachers");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await http.delete(`/admin/teachers/${teacherId}`);
      toast.success("Teacher deleted successfully");
      router.push("/Admin/teachers");
    } catch (error: any) {
      console.error("Error deleting teacher:", error);
      toast.error(error.response?.data?.msg || "Failed to delete teacher");
    }
  };

  const formatAddress = () => {
    if (!teacher?.address) return "Not provided";
    
    const addr = teacher.address;
    const parts = [
      addr.street,
      addr.city,
      addr.state,
      addr.zipCode,
      addr.country
    ].filter(Boolean);
    
    return parts.length > 0 ? parts.join(", ") : "Not provided";
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      active: "bg-green-600 text-white",
      inactive: "bg-gray-600 text-white",
      "on-leave": "bg-yellow-600 text-white",
      resigned: "bg-red-600 text-white",
    };
    return colors[status as keyof typeof colors] || "bg-gray-600 text-white";
  };

  const InfoRow = ({ icon, label, value }: any) => (
    <div className="flex items-start gap-3 p-3 bg-white/5 rounded-lg border border-white/10">
      <div className="p-2 bg-yellow-400/20 rounded-lg">
        {icon}
      </div>
      <div>
        <p className="text-white/60 text-xs">{label}</p>
        <p className="text-white font-medium break-words">{value || "Not provided"}</p>
      </div>
    </div>
  );

  const StatCard = ({ title, value, icon, color }: any) => (
    <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-4">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg bg-gradient-to-r ${color}`}>
          {icon}
        </div>
        <div>
          <p className="text-white/60 text-xs">{title}</p>
          <p className="text-white font-bold text-lg">{value}</p>
        </div>
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

  if (!teacher) {
    return (
      <div className="text-center py-8">
        <UserCircle className="w-16 h-16 text-white/40 mx-auto mb-4" />
        <p className="text-white">Teacher not found</p>
        <button
          onClick={() => router.push("/Admin/teachers")}
          className="mt-4 px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-lg text-white"
        >
          Back to Teachers
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
          <h1 className="text-2xl font-bold text-white">Teacher Details</h1>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => router.push(`/Admin/teachers/${teacherId}/edit`)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-lg text-white hover:from-yellow-500 hover:to-orange-500 transition-colors"
          >
            <Edit className="w-4 h-4" />
            Edit Teacher
          </button>
          <button
            onClick={() => setDeleteModal({ isOpen: true, id: teacherId })}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>

      <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 overflow-hidden">
        <div className="relative h-32 bg-gradient-to-r from-yellow-400 to-orange-400">
          <div className="absolute -bottom-12 left-6">
            <div className="w-24 h-24 rounded-full bg-gradient-to-r from-yellow-400 to-orange-400 border-4 border-white/20 flex items-center justify-center">
              <UserCircle className="w-16 h-16 text-white" />
            </div>
          </div>
        </div>

        <div className="pt-16 p-6">
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {teacher.userId?.firstName} {teacher.userId?.lastName}
                </h2>
                <p className="text-white/60 flex items-center gap-1 mt-1">
                  <Mail className="w-4 h-4" />
                  {teacher.userId?.email}
                </p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-bold ${getStatusBadge(teacher.status)}`}>
                {teacher.status.toUpperCase()}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoRow
              icon={<Hash className="w-4 h-4 text-yellow-400" />}
              label="Employee ID"
              value={teacher.employeeId}
            />
            <InfoRow
              icon={<Award className="w-4 h-4 text-yellow-400" />}
              label="Qualification"
              value={teacher.qualification}
            />
            <InfoRow
              icon={<Briefcase className="w-4 h-4 text-yellow-400" />}
              label="Specialization"
              value={teacher.specialization}
            />
            <InfoRow
              icon={<Clock className="w-4 h-4 text-yellow-400" />}
              label="Experience"
              value={teacher.experience ? `${teacher.experience} years` : null}
            />
            <InfoRow
              icon={<Calendar className="w-4 h-4 text-yellow-400" />}
              label="Date of Birth"
              value={teacher.dateOfBirth ? new Date(teacher.dateOfBirth).toLocaleDateString() : null}
            />
            <InfoRow
              icon={<VenusAndMars className="w-4 h-4 text-yellow-400" />}
              label="Gender"
              value={teacher.gender ? teacher.gender.charAt(0).toUpperCase() + teacher.gender.slice(1) : null}
            />
            <InfoRow
              icon={<Phone className="w-4 h-4 text-yellow-400" />}
              label="Contact Number"
              value={teacher.contactNumber}
            />
            <InfoRow
              icon={<Phone className="w-4 h-4 text-yellow-400" />}
              label="Emergency Contact"
              value={teacher.emergencyContact}
            />
            <InfoRow
              icon={<Calendar className="w-4 h-4 text-yellow-400" />}
              label="Joining Date"
              value={new Date(teacher.joiningDate).toLocaleDateString()}
            />
            <InfoRow
              icon={<GraduationCap className="w-4 h-4 text-yellow-400" />}
              label="Status"
              value={teacher.status ? teacher.status.charAt(0).toUpperCase() + teacher.status.slice(1) : null}
            />
            <div className="md:col-span-2">
              <InfoRow
                icon={<Home className="w-4 h-4 text-yellow-400" />}
                label="Address"
                value={formatAddress()}
              />
            </div>
            {teacher.bio && (
              <div className="md:col-span-2">
                <InfoRow
                  icon={<UserCircle className="w-4 h-4 text-yellow-400" />}
                  label="Bio"
                  value={teacher.bio}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <BookOpen className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-white/60 text-sm">Assigned Courses</p>
              <p className="text-white text-xl font-bold">0</p>
            </div>
          </div>
        </div>
        <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <Users className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-white/60 text-sm">Total Students</p>
              <p className="text-white text-xl font-bold">0</p>
            </div>
          </div>
        </div>
        <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <Clock className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-white/60 text-sm">Weekly Classes</p>
              <p className="text-white text-xl font-bold">0</p>
            </div>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, id: "" })}
        onConfirm={handleDelete}
        title="Delete Teacher"
        message="Are you sure you want to delete this teacher? This action cannot be undone and will remove all associated courses."
      />
    </div>
  );
};

export default TeacherDetailPage;