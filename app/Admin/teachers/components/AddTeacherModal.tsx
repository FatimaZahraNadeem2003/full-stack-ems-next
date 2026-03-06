"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import http from "@/services/http";
import toast from "react-hot-toast";
import { X, Eye, EyeOff } from "lucide-react";

interface AddTeacherModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddTeacherModal({ isOpen, onClose, onSuccess }: AddTeacherModalProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    employeeId: "",
    qualification: "",
    specialization: "",
    experience: "",
    contactNumber: "",
    emergencyContact: "",
    dateOfBirth: "",
    gender: "",
    bio: "",
  });

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.firstName || !form.lastName || !form.email || !form.password || !form.employeeId) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (form.password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    if (form.contactNumber && !/^[0-9+\-\s]+$/.test(form.contactNumber)) {
      toast.error("Please enter a valid contact number");
      return;
    }

    try {
      setLoading(true);
      await http.post("/admin/teachers", {
        ...form,
        experience: form.experience ? parseInt(form.experience) : 0,
      });
      toast.success("Teacher added successfully");
      onSuccess();
      onClose();
      resetForm();
    } catch (error: any) {
      console.error("Error adding teacher:", error);
      toast.error(error.response?.data?.msg || "Failed to add teacher");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      employeeId: "",
      qualification: "",
      specialization: "",
      experience: "",
      contactNumber: "",
      emergencyContact: "",
      dateOfBirth: "",
      gender: "",
      bio: "",
    });
    setShowPassword(false);
  };

  const handleCancel = () => {
    resetForm();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="relative w-full max-w-2xl bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-6 max-h-[90vh] overflow-y-auto">
        <button
          onClick={handleCancel}
          className="absolute top-4 right-4 text-white/60 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-bold text-white mb-6">Add New Teacher</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
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
                placeholder="teacher@example.com"
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white/95 placeholder-white/50 focus:outline-none focus:border-yellow-400 font-medium"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/90 mb-2">
                Password *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                  placeholder="Minimum 6 characters"
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white/95 placeholder-white/50 focus:outline-none focus:border-yellow-400 font-medium pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-white/40 text-xs mt-1">Minimum 6 characters</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/90 mb-2">
                Employee ID *
              </label>
              <input
                type="text"
                name="employeeId"
                value={form.employeeId}
                onChange={handleChange}
                required
                placeholder="TCH001"
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white/95 placeholder-white/50 focus:outline-none focus:border-yellow-400 font-medium"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/90 mb-2">
                Qualification *
              </label>
              <input
                type="text"
                name="qualification"
                value={form.qualification}
                onChange={handleChange}
                required
                placeholder="M.Sc, B.Ed, etc."
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white/95 placeholder-white/50 focus:outline-none focus:border-yellow-400 font-medium"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/90 mb-2">
                Specialization *
              </label>
              <input
                type="text"
                name="specialization"
                value={form.specialization}
                onChange={handleChange}
                required
                placeholder="Mathematics, Physics, etc."
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white/95 placeholder-white/50 focus:outline-none focus:border-yellow-400 font-medium"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/90 mb-2">
                Experience (Years)
              </label>
              <input
                type="number"
                name="experience"
                value={form.experience}
                onChange={handleChange}
                min="0"
                placeholder="5"
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white/95 placeholder-white/50 focus:outline-none focus:border-yellow-400 font-medium"
              />
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
                placeholder="+1 234 567 8900"
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white/95 placeholder-white/50 focus:outline-none focus:border-yellow-400 font-medium"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/90 mb-2">
                Emergency Contact
              </label>
              <input
                type="tel"
                name="emergencyContact"
                value={form.emergencyContact}
                onChange={handleChange}
                placeholder="+1 234 567 8900"
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
          </div>

          <div>
            <label className="block text-sm font-medium text-white/90 mb-2">
              Bio/Description
            </label>
            <textarea
              name="bio"
              value={form.bio}
              onChange={handleChange}
              rows={3}
              placeholder="Brief description about the teacher's experience and teaching philosophy..."
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white/95 placeholder-white/50 focus:outline-none focus:border-yellow-400 font-medium"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-green-400 to-emerald-500 text-white hover:from-green-500 hover:to-emerald-600 transition-colors disabled:opacity-50 font-bold"
            >
              {loading ? "Adding..." : "Add Teacher"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}