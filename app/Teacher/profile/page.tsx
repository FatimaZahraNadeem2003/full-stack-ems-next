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
  Briefcase,
  Award,
  Clock,
  Hash,
  Users,
  Home,
  UserCircle,
  VenusAndMars,
  AlertCircle,
} from "lucide-react";

interface TeacherProfileData {
  _id: string;
  userId: {
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
}

interface DashboardStats {
  totalCourses: number;
  totalStudents: number;
  todayClasses: number;
  pendingGrades: number;
}

export default function TeacherProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<TeacherProfileData | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    contactNumber: "",
    emergencyContact: "",
    dateOfBirth: "",
    gender: "",
    address: {
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: "",
    },
    bio: "",
  });

  useEffect(() => {
    fetchProfile();
    fetchDashboardStats();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await http.get("/teacher/profile");
      setProfile(response.data.data);
      
      setForm({
        contactNumber: response.data.data.contactNumber || "",
        emergencyContact: response.data.data.emergencyContact || "",
        dateOfBirth: response.data.data.dateOfBirth 
          ? new Date(response.data.data.dateOfBirth).toISOString().split("T")[0] 
          : "",
        gender: response.data.data.gender || "",
        address: {
          street: response.data.data.address?.street || "",
          city: response.data.data.address?.city || "",
          state: response.data.data.address?.state || "",
          zipCode: response.data.data.address?.zipCode || "",
          country: response.data.data.address?.country || "",
        },
        bio: response.data.data.bio || "",
      });
    } catch (error: any) {
      console.error("Error fetching profile:", error);
      toast.error(error.response?.data?.msg || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const fetchDashboardStats = async () => {
    try {
      const response = await http.get("/teacher/dashboard/stats");
      setStats(response.data.data);
    } catch (error) {
      console.error("Error fetching stats:", error);
      // Don't show error toast for stats
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (form.contactNumber && !/^[0-9+\-\s]+$/.test(form.contactNumber)) {
      toast.error("Please enter a valid contact number");
      return;
    }

    if (form.emergencyContact && !/^[0-9+\-\s]+$/.test(form.emergencyContact)) {
      toast.error("Please enter a valid emergency contact number");
      return;
    }

    try {
      setSaving(true);
      await http.put("/teacher/profile", form);
      toast.success("Profile updated successfully");
      setEditing(false);
      fetchProfile(); // Refresh profile data
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast.error(error.response?.data?.msg || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    // Reset form to original values
    if (profile) {
      setForm({
        contactNumber: profile.contactNumber || "",
        emergencyContact: profile.emergencyContact || "",
        dateOfBirth: profile.dateOfBirth 
          ? new Date(profile.dateOfBirth).toISOString().split("T")[0] 
          : "",
        gender: profile.gender || "",
        address: {
          street: profile.address?.street || "",
          city: profile.address?.city || "",
          state: profile.address?.state || "",
          zipCode: profile.address?.zipCode || "",
          country: profile.address?.country || "",
        },
        bio: profile.bio || "",
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

  const formatAddress = () => {
    const addr = form.address;
    const parts = [
      addr.street,
      addr.city,
      addr.state,
      addr.zipCode,
      addr.country
    ].filter(Boolean);
    return parts.join(", ") || "Not provided";
  };

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
      <div className="flex-1">
        <p className="text-white/60 text-xs">{label}</p>
        <p className="text-white font-medium break-words">{value || "Not provided"}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header with back button */}
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
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            title="My Courses"
            value={stats.totalCourses}
            icon={<BookOpen className="w-4 h-4 text-white" />}
            color="from-blue-400 to-indigo-500"
          />
          <StatCard
            title="Total Students"
            value={stats.totalStudents}
            icon={<Users className="w-4 h-4 text-white" />}
            color="from-green-400 to-emerald-500"
          />
          <StatCard
            title="Today's Classes"
            value={stats.todayClasses}
            icon={<Clock className="w-4 h-4 text-white" />}
            color="from-purple-400 to-pink-500"
          />
          <StatCard
            title="Pending Grades"
            value={stats.pendingGrades}
            icon={<AlertCircle className="w-4 h-4 text-white" />}
            color="from-orange-400 to-red-500"
          />
        </div>
      )}

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
              {profile.userId.firstName} {profile.userId.lastName}
            </h2>
            <p className="text-white/60 flex items-center gap-1 mt-1">
              <Mail className="w-4 h-4" />
              {profile.userId.email}
            </p>
          </div>

          {!editing ? (
            // View Mode
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoRow
                icon={<Hash className="w-4 h-4 text-yellow-400" />}
                label="Employee ID"
                value={profile.employeeId}
              />
              <InfoRow
                icon={<Award className="w-4 h-4 text-yellow-400" />}
                label="Qualification"
                value={profile.qualification}
              />
              <InfoRow
                icon={<Briefcase className="w-4 h-4 text-yellow-400" />}
                label="Specialization"
                value={profile.specialization}
              />
              <InfoRow
                icon={<Clock className="w-4 h-4 text-yellow-400" />}
                label="Experience"
                value={profile.experience ? `${profile.experience} years` : null}
              />
              <InfoRow
                icon={<Calendar className="w-4 h-4 text-yellow-400" />}
                label="Date of Birth"
                value={profile.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString() : null}
              />
              <InfoRow
                icon={<VenusAndMars className="w-4 h-4 text-yellow-400" />}
                label="Gender"
                value={profile.gender ? profile.gender.charAt(0).toUpperCase() + profile.gender.slice(1) : null}
              />
              <InfoRow
                icon={<Phone className="w-4 h-4 text-yellow-400" />}
                label="Contact Number"
                value={profile.contactNumber}
              />
              <InfoRow
                icon={<Phone className="w-4 h-4 text-yellow-400" />}
                label="Emergency Contact"
                value={profile.emergencyContact}
              />
              <InfoRow
                icon={<Calendar className="w-4 h-4 text-yellow-400" />}
                label="Joining Date"
                value={new Date(profile.joiningDate).toLocaleDateString()}
              />
              <InfoRow
                icon={<UserCircle className="w-4 h-4 text-yellow-400" />}
                label="Status"
                value={profile.status ? profile.status.charAt(0).toUpperCase() + profile.status.slice(1) : null}
              />
              <div className="md:col-span-2">
                <InfoRow
                  icon={<Home className="w-4 h-4 text-yellow-400" />}
                  label="Address"
                  value={formatAddress()}
                />
              </div>
              {profile.bio && (
                <div className="md:col-span-2">
                  <InfoRow
                    icon={<User className="w-4 h-4 text-yellow-400" />}
                    label="Bio"
                    value={profile.bio}
                  />
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information */}
              <div>
                <h3 className="text-white font-medium mb-3">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">
                      Contact Number *
                    </label>
                    <input
                      type="tel"
                      value={form.contactNumber}
                      onChange={(e) => setForm({ ...form, contactNumber: e.target.value })}
                      required
                      placeholder="e.g., +1 234 567 8900"
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-yellow-400"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">
                      Emergency Contact
                    </label>
                    <input
                      type="tel"
                      value={form.emergencyContact}
                      onChange={(e) => setForm({ ...form, emergencyContact: e.target.value })}
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
                </div>
              </div>

              {/* Address Information */}
              <div>
                <h3 className="text-white font-medium mb-3">Address Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-white/80 mb-2">
                      Street Address
                    </label>
                    <input
                      type="text"
                      value={form.address.street}
                      onChange={(e) => setForm({ 
                        ...form, 
                        address: { ...form.address, street: e.target.value }
                      })}
                      placeholder="Street address"
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-yellow-400"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">
                      City
                    </label>
                    <input
                      type="text"
                      value={form.address.city}
                      onChange={(e) => setForm({ 
                        ...form, 
                        address: { ...form.address, city: e.target.value }
                      })}
                      placeholder="City"
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-yellow-400"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">
                      State
                    </label>
                    <input
                      type="text"
                      value={form.address.state}
                      onChange={(e) => setForm({ 
                        ...form, 
                        address: { ...form.address, state: e.target.value }
                      })}
                      placeholder="State"
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-yellow-400"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">
                      ZIP Code
                    </label>
                    <input
                      type="text"
                      value={form.address.zipCode}
                      onChange={(e) => setForm({ 
                        ...form, 
                        address: { ...form.address, zipCode: e.target.value }
                      })}
                      placeholder="ZIP Code"
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-yellow-400"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">
                      Country
                    </label>
                    <input
                      type="text"
                      value={form.address.country}
                      onChange={(e) => setForm({ 
                        ...form, 
                        address: { ...form.address, country: e.target.value }
                      })}
                      placeholder="Country"
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-yellow-400"
                    />
                  </div>
                </div>
              </div>

              {/* Bio */}
              <div>
                <h3 className="text-white font-medium mb-3">Bio</h3>
                <textarea
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  rows={4}
                  placeholder="Tell us about yourself, your teaching experience, etc."
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-yellow-400"
                />
              </div>

              {/* Form Actions */}
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
    </div>
  );
}