"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import http from "@/services/http";
import toast from "react-hot-toast";
import { ArrowLeft, Edit, User, BookOpen, Calendar, Clock, Award } from "lucide-react";
import LoadingSpinner from "@/app/components/ui/LoadingSpinner";

interface EnrollmentDetail {
  _id: string;
  studentId: {
    _id: string;
    userId: { firstName: string; lastName: string; email: string };
    rollNumber: string;
    class: string;
    section: string;
  };
  courseId: {
    _id: string;
    name: string;
    code: string;
    credits: number;
    department: string;
    teacherId?: {
      userId: { firstName: string; lastName: string };
    };
  };
  enrollmentDate: string;
  status: string;
  progress: number;
  grade: string;
  marksObtained?: number;
  remarks?: string;
  createdAt: string;
  updatedAt: string;
}

const EnrollmentDetailPage = () => {
  const router = useRouter();
  const params = useParams();
  const enrollmentId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [enrollment, setEnrollment] = useState<EnrollmentDetail | null>(null);

  useEffect(() => {
    if (enrollmentId) {
      fetchEnrollmentDetails();
    }
  }, [enrollmentId]);

  const fetchEnrollmentDetails = async () => {
    try {
      setLoading(true);
      const response = await http.get(`/admin/enrollments/${enrollmentId}`);
      console.log("Enrollment details:", response.data);
      
      const enrollmentData = response.data.data || response.data;
      setEnrollment(enrollmentData);
      
    } catch (error: any) {
      console.error("Error fetching enrollment:", error);
      toast.error(error.response?.data?.msg || "Failed to load enrollment details");
      router.push("/Admin/enrollments");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      enrolled: "bg-green-600 text-white/80",
      completed: "bg-blue-600 text-white/80",
      dropped: "bg-red-600 text-white/80",
      pending: "bg-yellow-600 text-white/80",
    };
    return colors[status as keyof typeof colors] || "bg-gray-500/20 text-gray-400";
  };

  const InfoRow = ({ icon, label, value }: any) => (
    <div className="flex items-start gap-3 p-3 bg-white/5 rounded-lg border border-white/10">
      <div className="p-2 bg-yellow-400/20 rounded-lg">{icon}</div>
      <div>
        <p className="text-white/60 text-xs">{label}</p>
        <p className="text-white font-medium">{value || "Not provided"}</p>
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

  if (!enrollment) {
    return (
      <div className="text-center py-8">
        <p className="text-white">Enrollment not found</p>
        <button onClick={() => router.push("/Admin/enrollments")} className="mt-4 px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-lg text-white">
          Back to Enrollments
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 bg-white/10 rounded-lg text-white hover:bg-white/20">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold text-white">Enrollment Details</h1>
        </div>
        <button
          onClick={() => router.push(`/Admin/enrollments/${enrollmentId}/edit`)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-lg text-white"
        >
          <Edit className="w-4 h-4" /> Edit Enrollment
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-yellow-400" /> Student Information
          </h2>
          <div className="space-y-3">
            <InfoRow icon={<User className="w-4 h-4" />} label="Name" value={`${enrollment.studentId?.userId?.firstName} ${enrollment.studentId?.userId?.lastName}`} />
            <InfoRow icon={<Calendar className="w-4 h-4" />} label="Roll Number" value={enrollment.studentId?.rollNumber} />
            <InfoRow icon={<BookOpen className="w-4 h-4" />} label="Class" value={`${enrollment.studentId?.class} ${enrollment.studentId?.section}`} />
            <InfoRow icon={<Award className="w-4 h-4" />} label="Email" value={enrollment.studentId?.userId?.email} />
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-yellow-400" /> Course Information
          </h2>
          <div className="space-y-3">
            <InfoRow icon={<BookOpen className="w-4 h-4" />} label="Course Name" value={enrollment.courseId?.name} />
            <InfoRow icon={<Calendar className="w-4 h-4" />} label="Course Code" value={enrollment.courseId?.code} />
            <InfoRow icon={<Award className="w-4 h-4" />} label="Credits" value={enrollment.courseId?.credits} />
            <InfoRow icon={<User className="w-4 h-4" />} label="Department" value={enrollment.courseId?.department} />
            {enrollment.courseId?.teacherId && (
              <InfoRow icon={<User className="w-4 h-4" />} label="Teacher" value={`${enrollment.courseId.teacherId.userId?.firstName} ${enrollment.courseId.teacherId.userId?.lastName}`} />
            )}
          </div>
        </div>

        <div className="md:col-span-2 bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-yellow-400" /> Enrollment Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-white/5 rounded-lg">
              <p className="text-white/60 text-sm">Status</p>
              <span className={`mt-1 inline-block px-3 py-1 rounded-full text-sm ${getStatusBadge(enrollment.status)}`}>
                {enrollment.status}
              </span>
            </div>
            <div className="p-4 bg-white/5 rounded-lg">
              <p className="text-white/60 text-sm">Progress</p>
              <p className="text-white text-xl font-bold">{enrollment.progress || 0}%</p>
            </div>
            <div className="p-4 bg-white/5 rounded-lg">
              <p className="text-white/60 text-sm">Grade</p>
              <p className="text-white text-xl font-bold">{enrollment.grade}</p>
            </div>
            <div className="p-4 bg-white/5 rounded-lg">
              <p className="text-white/60 text-sm">Enrollment Date</p>
              <p className="text-white">{new Date(enrollment.enrollmentDate).toLocaleDateString()}</p>
            </div>
            <div className="p-4 bg-white/5 rounded-lg">
              <p className="text-white/60 text-sm">Marks Obtained</p>
              <p className="text-white">{enrollment.marksObtained || 'N/A'}</p>
            </div>
            <div className="p-4 bg-white/5 rounded-lg">
              <p className="text-white/60 text-sm">Last Updated</p>
              <p className="text-white">{new Date(enrollment.updatedAt).toLocaleDateString()}</p>
            </div>
          </div>
          {enrollment.remarks && (
            <div className="mt-4 p-4 bg-white/5 rounded-lg">
              <p className="text-white/60 text-sm mb-1">Remarks</p>
              <p className="text-white">{enrollment.remarks}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnrollmentDetailPage;