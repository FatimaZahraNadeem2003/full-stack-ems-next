"use client";

import React, { useState, useEffect } from "react";
import http from "@/services/http";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import {
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Save,
  Edit2,
  ArrowLeft,
  BookOpen,
  GraduationCap,
  Hash,
  Users,
  Home,
  UserCircle,
  VenusAndMars,
} from "lucide-react";

interface StudentProfileData {
  profile: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    rollNumber: string;
    class: string;
    section: string;
    dateOfBirth?: string;
    gender?: string;
    contactNumber?: string;
    address?: string;
    parentName?: string;
    parentContact?: string;
    admissionDate: string;
    status: string;
  };
  statistics: {
    totalCourses: number;
    completedCourses: number;
    inProgressCourses: number;
    averageProgress: number;
  };
  recentGrades: any[];
}

export default function StudentProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<StudentProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    contactNumber: "",
    address: "",
    dateOfBirth: "",
    gender: "",
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await http.get("/student/profile");
      setProfile(response.data);
      
      setForm({
        contactNumber: response.data.data.profile.contactNumber || "",
        address: response.data.data.profile.address || "",
        dateOfBirth: response.data.data.profile.dateOfBirth 
          ? new Date(response.data.data.profile.dateOfBirth).toISOString().split("T")[0] 
          : "",
        gender: response.data.data.profile.gender || "",
      });
    } catch (error: any) {
      console.error("Error fetching profile:", error);
      toast.error(error.response?.data?.msg || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (form.contactNumber && !/^[0-9+\-\s]+$/.test(form.contactNumber)) {
      toast.error("Please enter a valid contact number");
      return;
    }

    try {
      setSaving(true);
      await http.put("/student/profile", form);
      toast.success("Profile updated successfully");
      setEditing(false);
      fetchProfile(); 
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast.error(error.response?.data?.msg || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setForm({
        contactNumber: profile.data.profile.contactNumber || "",
        address: profile.data.profile.address || "",
        dateOfBirth: profile.data.profile.dateOfBirth 
          ? new Date(profile.data.profile.dateOfBirth).toISOString().split("T")[0] 
          : "",
        gender: profile.data.profile.gender || "",
      });
    }
    setEditing(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-400"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-8">
        <p className="text-white">Profile not found</p>
      </div>
    );
  }

  const { profile: student } = profile.data;

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

  const InfoRow = ({ icon, label, value }: any) => (
    <div className="flex items-start gap-3 p-3 bg-white/5 rounded-lg border border-white/10">
      <div className="p-2 bg-yellow-400/20 rounded-lg">
        {icon}
      </div>
      <div>
        <p className="text-white/60 text-xs">{label}</p>
        <p className="text-white font-medium">{value || "Not provided"}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 bg-white/10 rounded-lg text-white hover:bg-white/20 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold text-white">My Profile</h1>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Courses"
          value={profile.data.statistics.totalCourses}
          icon={<BookOpen className="w-4 h-4 text-white" />}
          color="from-blue-400 to-indigo-500"
        />
        <StatCard
          title="In Progress"
          value={profile.data.statistics.inProgressCourses}
          icon={<GraduationCap className="w-4 h-4 text-white" />}
          color="from-yellow-400 to-orange-400"
        />
        <StatCard
          title="Completed"
          value={profile.data.statistics.completedCourses}
          icon={<Users className="w-4 h-4 text-white" />}
          color="from-green-400 to-emerald-500"
        />
        <StatCard
          title="Avg Progress"
          value={`${profile.data.statistics.averageProgress}%`}
          icon={<Hash className="w-4 h-4 text-white" />}
          color="from-purple-400 to-pink-500"
        />
      </div>

      {/* Main Profile Card */}
      <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 overflow-hidden">
        {/* Profile Header */}
        <div className="relative h-32 bg-gradient-to-r from-yellow-400 to-orange-400">
          <div className="absolute -bottom-12 left-6">
            <div className="w-24 h-24 rounded-full bg-gradient-to-r from-yellow-400 to-orange-400 border-4 border-white/20 flex items-center justify-center">
              <UserCircle className="w-16 h-16 text-white" />
            </div>
          </div>
          {!editing && (
            <button
              onClick={() => setEditing(true)}
              className="absolute top-4 right-4 flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg text-white hover:bg-white/30 transition-colors"
            >
              <Edit2 className="w-4 h-4" />
              Edit Profile
            </button>
          )}
        </div>

        {/* Profile Content */}
        <div className="pt-16 p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white">
              {student.firstName} {student.lastName}
            </h2>
            <p className="text-white/60 flex items-center gap-1 mt-1">
              <Mail className="w-4 h-4" />
              {student.email}
            </p>
          </div>

          {!editing ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoRow
                icon={<Hash className="w-4 h-4 text-yellow-400" />}
                label="Roll Number"
                value={student.rollNumber}
              />
              <InfoRow
                icon={<BookOpen className="w-4 h-4 text-yellow-400" />}
                label="Class"
                value={`${student.class} ${student.section}`}
              />
              <InfoRow
                icon={<Calendar className="w-4 h-4 text-yellow-400" />}
                label="Date of Birth"
                value={student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString() : null}
              />
              <InfoRow
                icon={<VenusAndMars className="w-4 h-4 text-yellow-400" />}
                label="Gender"
                value={student.gender ? student.gender.charAt(0).toUpperCase() + student.gender.slice(1) : null}
              />
              <InfoRow
                icon={<Phone className="w-4 h-4 text-yellow-400" />}
                label="Contact Number"
                value={student.contactNumber}
              />
              <InfoRow
                icon={<Users className="w-4 h-4 text-yellow-400" />}
                label="Parent Name"
                value={student.parentName}
              />
              <InfoRow
                icon={<Phone className="w-4 h-4 text-yellow-400" />}
                label="Parent Contact"
                value={student.parentContact}
              />
              <InfoRow
                icon={<Calendar className="w-4 h-4 text-yellow-400" />}
                label="Admission Date"
                value={new Date(student.admissionDate).toLocaleDateString()}
              />
              <div className="md:col-span-2">
                <InfoRow
                  icon={<Home className="w-4 h-4 text-yellow-400" />}
                  label="Address"
                  value={student.address}
                />
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Contact Number
                  </label>
                  <input
                    type="tel"
                    value={form.contactNumber}
                    onChange={(e) => setForm({ ...form, contactNumber: e.target.value })}
                    placeholder="e.g., +1 234 567 8900"
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-yellow-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    value={form.dateOfBirth}
                    onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-yellow-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Gender
                  </label>
                  <select
                    value={form.gender}
                    onChange={(e) => setForm({ ...form, gender: e.target.value })}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-yellow-400"
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Address
                  </label>
                  <textarea
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    rows={3}
                    placeholder="Enter your full address"
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-yellow-400"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-green-400 to-emerald-500 text-white hover:from-green-500 hover:to-emerald-600 transition-colors disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {profile.data.recentGrades && profile.data.recentGrades.length > 0 && (
        <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-6">
          <h3 className="text-white font-semibold mb-4">Recent Grades</h3>
          <div className="space-y-3">
            {profile.data.recentGrades.map((grade: any) => (
              <div
                key={grade._id}
                className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
              >
                <div>
                  <p className="text-white font-medium">{grade.courseId?.name}</p>
                  <p className="text-white/60 text-sm">{grade.assessmentName}</p>
                </div>
                <div className="text-right">
                  <p className="text-white font-bold text-lg">{grade.grade}</p>
                  <p className="text-white/60 text-xs">{grade.percentage}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}