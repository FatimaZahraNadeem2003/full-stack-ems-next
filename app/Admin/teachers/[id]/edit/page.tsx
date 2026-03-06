"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import http from "@/services/http";
import toast from "react-hot-toast";
import { ArrowLeft, Save, Eye, EyeOff, Key } from "lucide-react";
import LoadingSpinner from "@/app/components/ui/LoadingSpinner";

interface TeacherData {
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
  contactNumber: string;
  emergencyContact?: string;
  dateOfBirth?: string;
  gender?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  bio?: string;
  status: string;
}

const EditTeacherPage = () => {
  const router = useRouter();
  const params = useParams();
  const teacherId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [changePassword, setChangePassword] = useState(false);
  
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    newPassword: "",
    employeeId: "",
    qualification: "",
    specialization: "",
    experience: "",
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
    status: "active",
  });

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
      
      setForm({
        firstName: teacherData.userId?.firstName || "",
        lastName: teacherData.userId?.lastName || "",
        email: teacherData.userId?.email || "",
        password: "",
        newPassword: "",
        employeeId: teacherData.employeeId || "",
        qualification: teacherData.qualification || "",
        specialization: teacherData.specialization || "",
        experience: teacherData.experience?.toString() || "",
        contactNumber: teacherData.contactNumber || "",
        emergencyContact: teacherData.emergencyContact || "",
        dateOfBirth: teacherData.dateOfBirth 
          ? new Date(teacherData.dateOfBirth).toISOString().split("T")[0] 
          : "",
        gender: teacherData.gender || "",
        address: {
          street: teacherData.address?.street || "",
          city: teacherData.address?.city || "",
          state: teacherData.address?.state || "",
          zipCode: teacherData.address?.zipCode || "",
          country: teacherData.address?.country || "",
        },
        bio: teacherData.bio || "",
        status: teacherData.status || "active",
      });
      
    } catch (error: any) {
      console.error("Error fetching teacher:", error);
      toast.error(error.response?.data?.msg || "Failed to load teacher details");
      router.push("/Admin/teachers");
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
    
    if (!form.firstName || !form.lastName || !form.email || !form.employeeId) {
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
        employeeId: form.employeeId,
        qualification: form.qualification,
        specialization: form.specialization,
        experience: form.experience ? parseInt(form.experience) : 0,
        contactNumber: form.contactNumber,
        emergencyContact: form.emergencyContact,
        dateOfBirth: form.dateOfBirth,
        gender: form.gender,
        address: form.address,
        bio: form.bio,
        status: form.status,
      };

      if (changePassword && form.newPassword) {
        updateData.password = form.newPassword;
      }

      await http.put(`/admin/teachers/${teacherId}`, updateData);
      
      toast.success("Teacher updated successfully");
      router.push(`/Admin/teachers/${teacherId}`);
      
    } catch (error: any) {
      console.error("Error updating teacher:", error);
      toast.error(error.response?.data?.msg || "Failed to update teacher");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 bg-white/10 rounded-lg text-white hover:bg-white/20 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold text-white">Edit Teacher</h1>
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
              <label className="block text-sm font-medium text-white/90 mb-2">First Name *</label>
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
              <label className="block text-sm font-medium text-white/90 mb-2">Last Name *</label>
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
              <label className="block text-sm font-medium text-white/90 mb-2">Email *</label>
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
              <label className="block text-sm font-medium text-white/90 mb-2">Employee ID *</label>
              <input 
                type="text" 
                name="employeeId" 
                value={form.employeeId} 
                onChange={handleChange} 
                required 
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white/95 placeholder-white/50 focus:outline-none focus:border-yellow-400 font-medium" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/90 mb-2">Date of Birth</label>
              <input 
                type="date" 
                name="dateOfBirth" 
                value={form.dateOfBirth} 
                onChange={handleChange} 
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white/95 focus:outline-none focus:border-yellow-400 font-medium" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/90 mb-2">Gender</label>
              <select 
                name="gender" 
                value={form.gender} 
                onChange={handleChange} 
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white/95 focus:outline-none focus:border-yellow-400 font-medium"
              >
                <option value="" className="bg-gray-800 text-white">Select</option>
                <option value="male" className="bg-gray-800 text-white">Male</option>
                <option value="female" className="bg-gray-800 text-white">Female</option>
                <option value="other" className="bg-gray-800 text-white">Other</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Professional Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white/90 mb-2">Qualification *</label>
              <input 
                type="text" 
                name="qualification" 
                value={form.qualification} 
                onChange={handleChange} 
                required 
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white/95 placeholder-white/50 focus:outline-none focus:border-yellow-400 font-medium" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/90 mb-2">Specialization *</label>
              <input 
                type="text" 
                name="specialization" 
                value={form.specialization} 
                onChange={handleChange} 
                required 
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white/95 placeholder-white/50 focus:outline-none focus:border-yellow-400 font-medium" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/90 mb-2">Experience (Years)</label>
              <input 
                type="number" 
                name="experience" 
                value={form.experience} 
                onChange={handleChange} 
                min="0" 
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white/95 placeholder-white/50 focus:outline-none focus:border-yellow-400 font-medium" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/90 mb-2">Status</label>
              <select 
                name="status" 
                value={form.status} 
                onChange={handleChange} 
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white/95 focus:outline-none focus:border-yellow-400 font-medium"
              >
                <option value="active" className="bg-gray-800 text-white">Active</option>
                <option value="inactive" className="bg-gray-800 text-white">Inactive</option>
                <option value="on-leave" className="bg-gray-800 text-white">On Leave</option>
                <option value="resigned" className="bg-gray-800 text-white">Resigned</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Contact Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white/90 mb-2">Contact Number *</label>
              <input 
                type="tel" 
                name="contactNumber" 
                value={form.contactNumber} 
                onChange={handleChange} 
                required 
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white/95 placeholder-white/50 focus:outline-none focus:border-yellow-400 font-medium" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/90 mb-2">Emergency Contact</label>
              <input 
                type="tel" 
                name="emergencyContact" 
                value={form.emergencyContact} 
                onChange={handleChange} 
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white/95 placeholder-white/50 focus:outline-none focus:border-yellow-400 font-medium" 
              />
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Address</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-white/90 mb-2">Street</label>
              <input 
                type="text" 
                name="address.street" 
                value={form.address.street} 
                onChange={handleChange} 
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white/95 placeholder-white/50 focus:outline-none focus:border-yellow-400 font-medium" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/90 mb-2">City</label>
              <input 
                type="text" 
                name="address.city" 
                value={form.address.city} 
                onChange={handleChange} 
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white/95 placeholder-white/50 focus:outline-none focus:border-yellow-400 font-medium" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/90 mb-2">State</label>
              <input 
                type="text" 
                name="address.state" 
                value={form.address.state} 
                onChange={handleChange} 
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white/95 placeholder-white/50 focus:outline-none focus:border-yellow-400 font-medium" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/90 mb-2">ZIP Code</label>
              <input 
                type="text" 
                name="address.zipCode" 
                value={form.address.zipCode} 
                onChange={handleChange} 
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white/95 placeholder-white/50 focus:outline-none focus:border-yellow-400 font-medium" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/90 mb-2">Country</label>
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

        <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Bio</h2>
          <textarea 
            name="bio" 
            value={form.bio} 
            onChange={handleChange} 
            rows={4} 
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white/95 placeholder-white/50 focus:outline-none focus:border-yellow-400 font-medium" 
          />
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
  );
};

export default EditTeacherPage;