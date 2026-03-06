"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

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
  Lock,
  Eye,
  EyeOff,
  Key
} from "lucide-react";
import LoadingSpinner from "@/app/components/ui/LoadingSpinner";

interface StudentProfileData {
  data: {
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
      address?: string | {
        street?: string;
        city?: string;
        state?: string;
        zipCode?: string;
        country?: string;
      };
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
  };
}

export default function StudentProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<StudentProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [form, setForm] = useState({
    contactNumber: "",
    address: "",
    dateOfBirth: "",
    gender: "",
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await http.get("/student/profile");
      setProfile(response.data);
      
      if (response.data?.data?.profile) {
        const student = response.data.data.profile;
        
        let addressString = "";
        if (student.address) {
          if (typeof student.address === 'string') {
            addressString = student.address;
          } else if (typeof student.address === 'object') {
            const addr = student.address;
            const parts = [
              addr.street,
              addr.city,
              addr.state,
              addr.zipCode,
              addr.country
            ].filter(Boolean);
            addressString = parts.join(", ");
          }
        }
        
        setForm({
          contactNumber: student.contactNumber || "",
          address: addressString,
          dateOfBirth: student.dateOfBirth 
            ? new Date(student.dateOfBirth).toISOString().split("T")[0] 
            : "",
          gender: student.gender || "",
        });
      }
    } catch (error: any) {
      console.error("Error fetching profile:", error);
      if (error.code === 'ERR_NETWORK' || !error.response) {
        toast.error("Cannot connect to backend server. Please ensure it's running.");
      } else {
        toast.error(error.response?.data?.msg || "Failed to load profile");
      }
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
      await fetchProfile();
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast.error(error.response?.data?.msg || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      toast.error("Please fill in all password fields");
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error("New password must be at least 6 characters long");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    try {
      setSaving(true);
      await http.put("/student/change-password", {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      toast.success("Password changed successfully");
      setChangingPassword(false);
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error: any) {
      console.error("Error changing password:", error);
      toast.error(error.response?.data?.msg || "Failed to change password");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (profile?.data?.profile) {
      const student = profile.data.profile;
      
      let addressString = "";
      if (student.address) {
        if (typeof student.address === 'string') {
          addressString = student.address;
        } else if (typeof student.address === 'object') {
          const addr = student.address;
          const parts = [
            addr.street,
            addr.city,
            addr.state,
            addr.zipCode,
            addr.country
          ].filter(Boolean);
          addressString = parts.join(", ");
        }
      }
      
      setForm({
        contactNumber: student.contactNumber || "",
        address: addressString,
        dateOfBirth: student.dateOfBirth 
          ? new Date(student.dateOfBirth).toISOString().split("T")[0] 
          : "",
        gender: student.gender || "",
      });
    }
    setEditing(false);
  };

  const formatAddress = (address: any): string => {
    if (!address) return "Not provided";
    if (typeof address === 'string') return address;
    if (typeof address === 'object') {
      const parts = [
        address.street,
        address.city,
        address.state,
        address.zipCode,
        address.country
      ].filter(Boolean);
      return parts.length > 0 ? parts.join(", ") : "Not provided";
    }
    return "Not provided";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!profile?.data?.profile) {
    return (
      <div className="text-center py-8">
        <UserCircle className="w-16 h-16 text-white/40 mx-auto mb-4" />
        <p className="text-white/60">Unable to load profile. Please try again later.</p>
        <button
          onClick={fetchProfile}
          className="mt-4 px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-lg text-white hover:from-yellow-500 hover:to-orange-500 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  const student = profile.data.profile;
  const statistics = profile.data.statistics;

  const StatCard = ({ title, value, icon, color }: any) => (
    <div key={`stat-${title}`} className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-4">
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

  const InfoRow = ({ icon, label, value }: any) => {
    const displayValue = 
      value === null || value === undefined ? "Not provided" :
      typeof value === 'object' ? formatAddress(value) :
      String(value);
    
    return (
      <div className="flex items-start gap-3 p-3 bg-white/5 rounded-lg border border-white/10">
        <div className="p-2 bg-yellow-400/20 rounded-lg">
          {icon}
        </div>
        <div>
          <p className="text-white/60 text-xs">{label}</p>
          <p className="text-white font-medium break-words">{displayValue}</p>
        </div>
      </div>
    );
  };

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

      {statistics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            title="Total Courses"
            value={statistics.totalCourses}
            icon={<BookOpen className="w-4 h-4 text-white" />}
            color="from-blue-400 to-indigo-500"
          />
          <StatCard
            title="In Progress"
            value={statistics.inProgressCourses}
            icon={<GraduationCap className="w-4 h-4 text-white" />}
            color="from-yellow-400 to-orange-400"
          />
          <StatCard
            title="Completed"
            value={statistics.completedCourses}
            icon={<Users className="w-4 h-4 text-white" />}
            color="from-green-400 to-emerald-500"
          />
          <StatCard
            title="Avg Progress"
            value={`${statistics.averageProgress}%`}
            icon={<Hash className="w-4 h-4 text-white" />}
            color="from-purple-400 to-pink-500"
          />
        </div>
      )}

      <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 overflow-hidden">
        <div className="relative h-32 bg-gradient-to-r from-yellow-400 to-orange-400">
          <div className="absolute -bottom-12 left-6">
            <div className="w-24 h-24 rounded-full bg-gradient-to-r from-yellow-400 to-orange-400 border-4 border-white/20 flex items-center justify-center">
              <UserCircle className="w-16 h-16 text-white" />
            </div>
          </div>
          <div className="absolute top-4 right-4 flex gap-2">
            {!editing && !changingPassword && (
              <>
                <button
                  onClick={() => setChangingPassword(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600/20 backdrop-blur-sm rounded-lg text-white hover:bg-purple-600/30 transition-colors font-bold"
                >
                  <Key className="w-4 h-4" />
                  CHANGE PASSWORD
                </button>
                <button
                  onClick={() => setEditing(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg text-white hover:bg-white/30 transition-colors font-bold"
                >
                  <Edit2 className="w-4 h-4" />
                  EDIT PROFILE
                </button>
              </>
            )}
          </div>
        </div>

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

          {!editing && !changingPassword ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoRow
                icon={<Hash className="w-4 h-4 text-yellow-400" />}
                label="Roll Number"
                value={student.rollNumber}
              />
              <InfoRow
                icon={<BookOpen className="w-4 h-4 text-yellow-400" />}
                label="Class"
                value={`${student.class} ${student.section || ''}`}
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
          ) : editing ? (
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
          ) : (
            <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md mx-auto">
              <h3 className="text-xl font-bold text-white mb-4">Change Password</h3>
              
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Current Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    className="w-full pl-10 pr-10 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-yellow-400"
                    placeholder="Enter current password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                  >
                    {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    className="w-full pl-10 pr-10 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-yellow-400"
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-white/40 text-xs mt-1">Minimum 6 characters</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    className="w-full pl-10 pr-10 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-yellow-400"
                    placeholder="Confirm new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setChangingPassword(false);
                    setPasswordForm({
                      currentPassword: "",
                      newPassword: "",
                      confirmPassword: "",
                    });
                  }}
                  className="px-4 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-400 to-indigo-500 text-white hover:from-purple-500 hover:to-indigo-600 transition-colors disabled:opacity-50"
                >
                  <Key className="w-4 h-4" />
                  {saving ? "Changing..." : "Change Password"}
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