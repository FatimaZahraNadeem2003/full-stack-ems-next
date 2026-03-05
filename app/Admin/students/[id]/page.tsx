"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import http from "@/services/http";
import toast from "react-hot-toast";
import { ArrowLeft, Edit, Mail, Phone, Calendar, MapPin, BookOpen, Hash, Users, Home, UserCircle, VenusAndMars } from "lucide-react";
import LoadingSpinner from "@/app/components/ui/LoadingSpinner";

interface StudentDetail {
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
  admissionDate: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

const StudentDetailPage = () => {
  const router = useRouter();
  const params = useParams();
  const studentId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState<StudentDetail | null>(null);

  useEffect(() => {
    if (studentId) {
      fetchStudentDetails();
    }
  }, [studentId]);

  const fetchStudentDetails = async () => {
    try {
      setLoading(true);
      const response = await http.get(`/admin/students/${studentId}`);
      console.log("Student details:", response.data);
      
      const studentData = response.data.data || response.data;
      setStudent(studentData);
      
    } catch (error: any) {
      console.error("Error fetching student:", error);
      toast.error(error.response?.data?.msg || "Failed to load student details");
      router.push("/Admin/students");
    } finally {
      setLoading(false);
    }
  };

  const formatAddress = () => {
    if (!student?.address) return "Not provided";
    
    const addr = student.address;
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
      inactive: "bg-yellow-600 text-white",
      graduated: "bg-blue-600 text-white",
      suspended: "bg-red-600 text-white",
    };
    return colors[status as keyof typeof colors] || "bg-gray-600 text-white";
  };

  const InfoRow = ({ icon, label, value }: any) => (
    <div className="flex items-start gap-3 p-3 bg-white/5 rounded-lg border border-white/10">
      <div className="p-2 bg-yellow-400/20 rounded-lg">
        {icon}
      </div>
      <div>
        <p className="text-white/60 text-xs font-medium">{label}</p>
        <p className="text-white font-bold break-words">{value || "Not provided"}</p>
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

  if (!student) {
    return (
      <div className="text-center py-8">
        <UserCircle className="w-16 h-16 text-white/40 mx-auto mb-4" />
        <p className="text-white font-bold">Student not found</p>
        <button
          onClick={() => router.push("/Admin/students")}
          className="mt-4 px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-lg text-white font-bold hover:from-yellow-500 hover:to-orange-500 transition-colors"
        >
          Back to Students
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
          <h1 className="text-2xl font-bold text-white">Student Details</h1>
        </div>
        <button
          onClick={() => router.push(`/Admin/students/${studentId}/edit`)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-lg text-white hover:from-yellow-500 hover:to-orange-500 transition-colors font-bold"
        >
          <Edit className="w-4 h-4" />
          Edit Student
        </button>
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
                  {student.userId?.firstName} {student.userId?.lastName}
                </h2>
                <p className="text-white/80 flex items-center gap-1 mt-1 font-medium">
                  <Mail className="w-4 h-4" />
                  {student.userId?.email}
                </p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-bold ${getStatusBadge(student.status)}`}>
                {student.status.toUpperCase()}
              </span>
            </div>
          </div>

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
                value={formatAddress()}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDetailPage;