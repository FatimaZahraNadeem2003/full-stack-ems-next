"use client";

import React, { useState, useEffect } from "react";
import http from "@/services/http";
import toast from "react-hot-toast";
import { User, Mail, Phone, Calendar, MapPin, Save } from "lucide-react";

export default function StudentProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
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
      const response = await http.get("/student/profile");
      setProfile(response.data.data);
      setForm({
        contactNumber: response.data.data.profile.contactNumber || "",
        address: response.data.data.profile.address || "",
        dateOfBirth: response.data.data.profile.dateOfBirth?.split("T")[0] || "",
        gender: response.data.data.profile.gender || "",
      });
    } catch (error) {
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await http.put("/student/profile", form);
      toast.success("Profile updated successfully");
      setEditing(false);
      fetchProfile();
    } catch (error) {
      toast.error("Failed to update profile");
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">My Profile</h1>

      <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-6">
        {!editing ? (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-gradient-to-r from-yellow-400 to-orange-400 flex items-center justify-center">
                <User className="w-10 h-10 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">
                  {profile.profile.firstName} {profile.profile.lastName}
                </h2>
                <p className="text-white/60">{profile.profile.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <div>
                <p className="text-white/60 text-sm">Roll Number</p>
                <p className="text-white">{profile.profile.rollNumber}</p>
              </div>
              <div>
                <p className="text-white/60 text-sm">Class</p>
                <p className="text-white">{profile.profile.class} {profile.profile.section}</p>
              </div>
              <div>
                <p className="text-white/60 text-sm">Contact</p>
                <p className="text-white">{profile.profile.contactNumber || "Not provided"}</p>
              </div>
              <div>
                <p className="text-white/60 text-sm">Date of Birth</p>
                <p className="text-white">
                  {profile.profile.dateOfBirth 
                    ? new Date(profile.profile.dateOfBirth).toLocaleDateString() 
                    : "Not provided"}
                </p>
              </div>
              <div>
                <p className="text-white/60 text-sm">Gender</p>
                <p className="text-white capitalize">{profile.profile.gender || "Not provided"}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-white/60 text-sm">Address</p>
                <p className="text-white">{profile.profile.address || "Not provided"}</p>
              </div>
            </div>

            <button
              onClick={() => setEditing(true)}
              className="mt-4 px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-lg text-white"
            >
              Edit Profile
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-white/80 mb-1">Contact Number</label>
                <input
                  type="text"
                  value={form.contactNumber}
                  onChange={(e) => setForm({ ...form, contactNumber: e.target.value })}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-white/80 mb-1">Date of Birth</label>
                <input
                  type="date"
                  value={form.dateOfBirth}
                  onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-white/80 mb-1">Gender</label>
                <select
                  value={form.gender}
                  onChange={(e) => setForm({ ...form, gender: e.target.value })}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                >
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm text-white/80 mb-1">Address</label>
                <textarea
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="flex items-center gap-2 px-4 py-2 bg-green-500 rounded-lg text-white"
              >
                <Save className="w-4 h-4" /> Save
              </button>
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="px-4 py-2 bg-white/10 rounded-lg text-white"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}