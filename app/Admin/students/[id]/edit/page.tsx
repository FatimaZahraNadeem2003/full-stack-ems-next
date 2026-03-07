"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import http from "@/services/http";
import toast from "react-hot-toast";
import { ArrowLeft, Save, Eye, EyeOff, Key } from "lucide-react";
import LoadingSpinner from "@/app/components/ui/LoadingSpinner";

interface StudentData {
  _id: string;
  userId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  class: string;
  section: string;
  rollNumber: string;
  contactNumber?: string;
  parentName?: string;
  parentContact?: string;
  dateOfBirth?: string;
  gender?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  status: string;
}

const EditStudentPage = () => {
  const router = useRouter();
  const params = useParams();
  const studentId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [changePassword, setChangePassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    newPassword: "",
    class: "",
    section: "",
    rollNumber: "",
    contactNumber: "",
    parentName: "",
    parentContact: "",
    dateOfBirth: "",
    gender: "",
    address: {
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: "",
    },
    status: "active",
  });

  useEffect(() => {
    if (studentId) {
      fetchStudentDetails();
    } else {
      setError("Student ID is missing");
      setLoading(false);
    }
  }, [studentId]);

  const fetchStudentDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log("Fetching student with ID:", studentId);
      const response = await http.get(`/admin/students/${studentId}`);
      console.log("Student details response:", response.data);
      
      const studentData = response.data.data || response.data;
      
      if (!studentData || !studentData._id) {
        throw new Error("Invalid student data received");
      }
      
      setForm({
        firstName: studentData.userId?.firstName || studentData.firstName || "",
        lastName: studentData.userId?.lastName || studentData.lastName || "",
        email: studentData.userId?.email || studentData.email || "",
        newPassword: "",
        class: studentData.class || "",
        section: studentData.section || "",
        rollNumber: studentData.rollNumber || "",
        contactNumber: studentData.contactNumber || "",
        parentName: studentData.parentName || "",
        parentContact: studentData.parentContact || "",
        dateOfBirth: studentData.dateOfBirth 
          ? new Date(studentData.dateOfBirth).toISOString().split("T")[0] 
          : "",
        gender: studentData.gender || "",
        address: {
          street: studentData.address?.street || "",
          city: studentData.address?.city || "",
          state: studentData.address?.state || "",
          zipCode: studentData.address?.zipCode || "",
          country: studentData.address?.country || "",
        },
        status: studentData.status || "active",
      });
      
    } catch (error: any) {
      console.error("Error fetching student:", error);
      const errorMessage = error.response?.data?.msg || error.message || "Failed to load student details";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name.startsWith("address.")) {
      const addressField = name.split(".")[1];
      setForm({
        ...form,
        address: {
          ...form.address,
          [addressField]: value
        }
      });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.firstName || !form.lastName || !form.email || !form.class) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    if (changePassword && form.newPassword && form.newPassword.length < 6) {
      toast.error("New password must be at least 6 characters long");
      return;
    }

    try {
      setSaving(true);
      
      const updateData: any = {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        class: form.class,
        section: form.section,
        rollNumber: form.rollNumber,
        contactNumber: form.contactNumber,
        parentName: form.parentName,
        parentContact: form.parentContact,
        dateOfBirth: form.dateOfBirth,
        gender: form.gender,
        address: form.address,
        status: form.status,
      };

      if (changePassword && form.newPassword) {
        updateData.password = form.newPassword;
      }

      console.log("Updating student with data:", updateData);
      await http.put(`/admin/students/${studentId}`, updateData);
      
      toast.success("Student updated successfully");
      router.push(`/Admin/students/${studentId}`);
      
    } catch (error: any) {
      console.error("Error updating student:", error);
      toast.error(error.response?.data?.msg || "Failed to update student");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Error Loading Student</h2>
          <p className="text-white/60 mb-6">{error}</p>
          <button
            onClick={() => router.push("/Admin/students")}
            className="px-6 py-2 bg-gradient-to-r from-yellow-400 to-orange-400 text-white rounded-lg font-bold hover:from-yellow-500 hover:to-orange-500 transition-colors"
          >
            Back to Students
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 bg-white/10 rounded-lg text-white hover:bg-white/20 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold text-white">Edit Student</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-purple-600/20 backdrop-blur-xl rounded-xl border border-purple-500/30 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <Key className="w-5 h-5 text-yellow-400" />
                Password Settings
              </h2>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={changePassword}
                  onChange={(e) => setChangePassword(e.target.checked)}
                  className="w-4 h-4 bg-white/10 border border-white/20 rounded"
                />
                <span className="text-white/90 font-medium">Change Password</span>
              </label>
            </div>

            {changePassword && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/90 mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      name="newPassword"
                      value={form.newPassword}
                      onChange={handleChange}
                      minLength={6}
                      placeholder="Enter new password"
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white/95 placeholder-white/50 focus:outline-none focus:border-yellow-400 font-medium pr-10"
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
              </div>
            )}
          </div>

          <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Personal Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">
                  First Name *
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={form.firstName}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white/95 placeholder-white/50 focus:outline-none focus:border-yellow-400 font-medium"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">
                  Last Name *
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={form.lastName}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white/95 placeholder-white/50 focus:outline-none focus:border-yellow-400 font-medium"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white/95 placeholder-white/50 focus:outline-none focus:border-yellow-400 font-medium"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">
                  Roll Number
                </label>
                <input
                  type="text"
                  name="rollNumber"
                  value={form.rollNumber}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white/95 placeholder-white/50 focus:outline-none focus:border-yellow-400 font-medium"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">
                  Date of Birth
                </label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={form.dateOfBirth}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white/95 focus:outline-none focus:border-yellow-400 font-medium"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">
                  Gender
                </label>
                <select
                  name="gender"
                  value={form.gender}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white/95 focus:outline-none focus:border-yellow-400 font-medium"
                >
                  <option value="" className="bg-gray-800 text-white">Select Gender</option>
                  <option value="male" className="bg-gray-800 text-white">Male</option>
                  <option value="female" className="bg-gray-800 text-white">Female</option>
                  <option value="other" className="bg-gray-800 text-white">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">
                  Contact Number
                </label>
                <input
                  type="tel"
                  name="contactNumber"
                  value={form.contactNumber}
                  onChange={handleChange}
                  placeholder="e.g., +1 234 567 8900"
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white/95 placeholder-white/50 focus:outline-none focus:border-yellow-400 font-medium"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">
                  Status
                </label>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white/95 focus:outline-none focus:border-yellow-400 font-medium"
                >
                  <option value="active" className="bg-gray-800 text-white">Active</option>
                  <option value="inactive" className="bg-gray-800 text-white">Inactive</option>
                  <option value="graduated" className="bg-gray-800 text-white">Graduated</option>
                  <option value="suspended" className="bg-gray-800 text-white">Suspended</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Academic Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">
                  Class *
                </label>
                <input
                  type="text"
                  name="class"
                  value={form.class}
                  onChange={handleChange}
                  required
                  placeholder="e.g., 10th Grade"
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white/95 placeholder-white/50 focus:outline-none focus:border-yellow-400 font-medium"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">
                  Section
                </label>
                <input
                  type="text"
                  name="section"
                  value={form.section}
                  onChange={handleChange}
                  placeholder="e.g., A"
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white/95 placeholder-white/50 focus:outline-none focus:border-yellow-400 font-medium"
                />
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Parent Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">
                  Parent Name
                </label>
                <input
                  type="text"
                  name="parentName"
                  value={form.parentName}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white/95 placeholder-white/50 focus:outline-none focus:border-yellow-400 font-medium"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">
                  Parent Contact
                </label>
                <input
                  type="tel"
                  name="parentContact"
                  value={form.parentContact}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white/95 placeholder-white/50 focus:outline-none focus:border-yellow-400 font-medium"
                />
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Address Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-white/90 mb-2">
                  Street Address
                </label>
                <input
                  type="text"
                  name="address.street"
                  value={form.address.street}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white/95 placeholder-white/50 focus:outline-none focus:border-yellow-400 font-medium"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">
                  City
                </label>
                <input
                  type="text"
                  name="address.city"
                  value={form.address.city}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white/95 placeholder-white/50 focus:outline-none focus:border-yellow-400 font-medium"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">
                  State
                </label>
                <input
                  type="text"
                  name="address.state"
                  value={form.address.state}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white/95 placeholder-white/50 focus:outline-none focus:border-yellow-400 font-medium"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">
                  ZIP Code
                </label>
                <input
                  name="address.zipCode"
                  value={form.address.zipCode}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white/95 placeholder-white/50 focus:outline-none focus:border-yellow-400 font-medium"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">
                  Country
                </label>
                <input
                  type="text"
                  name="address.country"
                  value={form.address.country}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white/95 placeholder-white/50 focus:outline-none focus:border-yellow-400 font-medium"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-green-400 to-emerald-500 text-white hover:from-green-500 hover:to-emerald-600 transition-colors disabled:opacity-50 font-bold"
            >
              <Save className="w-4 h-4" />
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditStudentPage;