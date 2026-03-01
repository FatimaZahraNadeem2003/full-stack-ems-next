"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import http from "@/services/http";
import toast from "react-hot-toast";
import { X } from "lucide-react";

interface AddStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddStudentModal({ isOpen, onClose, onSuccess }: AddStudentModalProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "student123",
    class: "",
    section: "",
    rollNumber: "",
    contactNumber: "",
    parentName: "",
    parentContact: "",
    dateOfBirth: "",
    gender: "",
  });

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      await http.post("/admin/students", form);
      toast.success("Student added successfully");
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Error adding student:", error);
      toast.error(error.response?.data?.msg || "Failed to add student");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="relative w-full max-w-2xl bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-6 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/60 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-bold text-white mb-6">Add New Student</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                First Name *
              </label>
              <input
                type="text"
                name="firstName"
                value={form.firstName}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-yellow-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Last Name *
              </label>
              <input
                type="text"
                name="lastName"
                value={form.lastName}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-yellow-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Email *
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-yellow-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Class *
              </label>
              <input
                type="text"
                name="class"
                value={form.class}
                onChange={handleChange}
                required
                placeholder="e.g., 10th Grade"
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-yellow-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Section
              </label>
              <input
                type="text"
                name="section"
                value={form.section}
                onChange={handleChange}
                placeholder="e.g., A"
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-yellow-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Roll Number
              </label>
              <input
                type="text"
                name="rollNumber"
                value={form.rollNumber}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-yellow-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Contact Number
              </label>
              <input
                type="text"
                name="contactNumber"
                value={form.contactNumber}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-yellow-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Parent Name
              </label>
              <input
                type="text"
                name="parentName"
                value={form.parentName}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-yellow-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Parent Contact
              </label>
              <input
                type="text"
                name="parentContact"
                value={form.parentContact}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-yellow-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Date of Birth
              </label>
              <input
                type="date"
                name="dateOfBirth"
                value={form.dateOfBirth}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-yellow-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Gender
              </label>
              <select
                name="gender"
                value={form.gender}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-yellow-400"
              >
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-yellow-400 to-orange-400 text-white hover:from-yellow-500 hover:to-orange-500 transition-colors disabled:opacity-50"
            >
              {loading ? "Adding..." : "Add Student"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}