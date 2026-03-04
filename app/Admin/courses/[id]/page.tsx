"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import http from "@/services/http";
import toast from "react-hot-toast";
import { 
  ArrowLeft, 
  Edit, 
  BookOpen, 
  Users, 
  Calendar, 
  Clock, 
  Award, 
  User, 
  Mail, 
  GraduationCap,
  FileText,
  Trash2
} from "lucide-react";
import LoadingSpinner from "@/app/components/ui/LoadingSpinner";
import ConfirmModal from "@/app/components/ui/ConfirmModal";

interface CourseDetail {
  _id: string;
  name: string;
  code: string;
  description: string;
  credits: number;
  duration: string;
  department: string;
  level: string;
  syllabus?: string;
  prerequisites?: string[];
  maxStudents: number;
  status: string;
  enrolledCount: number;
  teacherId?: {
    _id: string;
    userId: {
      firstName: string;
      lastName: string;
      email: string;
    };
    specialization: string;
    qualification: string;
  };
  enrolledStudents?: Array<{
    _id: string;
    studentId: {
      _id: string;
      userId: {
        firstName: string;
        lastName: string;
        email: string;
      };
      rollNumber: string;
      class: string;
      section: string;
    };
    enrollmentDate: string;
    status: string;
    progress: number;
  }>;
  createdAt: string;
  updatedAt: string;
}

const CourseDetailPage = () => {
  const router = useRouter();
  const params = useParams();
  const courseId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: "" });
  const [showAllStudents, setShowAllStudents] = useState(false);

  useEffect(() => {
    if (courseId) {
      fetchCourseDetails();
    }
  }, [courseId]);

  const fetchCourseDetails = async () => {
    try {
      setLoading(true);
      const response = await http.get(`/admin/courses/${courseId}`);
      console.log("Course details:", response.data);
      
      const courseData = response.data.data || response.data;
      setCourse(courseData);
      
    } catch (error: any) {
      console.error("Error fetching course:", error);
      toast.error(error.response?.data?.msg || "Failed to load course details");
      router.push("/Admin/courses");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await http.delete(`/admin/courses/${courseId}`);
      toast.success("Course deleted successfully");
      router.push("/Admin/courses");
    } catch (error: any) {
      console.error("Error deleting course:", error);
      toast.error(error.response?.data?.msg || "Failed to delete course");
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      active: "bg-green-600 text-white/80",
      inactive: "bg-yellow-600 text-white/80",
      upcoming: "bg-blue-600 text-white/80",
      completed: "bg-gray-500/20 text-white/80",
    };
    return colors[status as keyof typeof colors] || "bg-gray-500/20 text-white/80";
  };

  const getLevelBadge = (level: string) => {
    const colors = {
      beginner: "bg-green-600 text-white/80",
      intermediate: "bg-yellow-600 text-white/80",
      advanced: "bg-red-600 text-white/80",
    };
    return colors[level as keyof typeof colors] || "bg-gray-500/20 text-white/80";
  };

  const InfoRow = ({ icon, label, value }: any) => (
    <div className="flex items-start gap-3 p-3 bg-white/5 rounded-lg border border-white/10">
      <div className="p-2 bg-yellow-400/20 rounded-lg">{icon}</div>
      <div>
        <p className="text-white/60 text-xs">{label}</p>
        <p className="text-white font-medium break-words">{value || "Not provided"}</p>
      </div>
    </div>
  );

  const StatCard = ({ title, value, icon, color }: any) => (
    <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-4">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg bg-gradient-to-r ${color}`}>{icon}</div>
        <div>
          <p className="text-white/60 text-xs">{title}</p>
          <p className="text-white font-bold text-lg">{value}</p>
        </div>
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

  if (!course) {
    return (
      <div className="text-center py-8">
        <p className="text-white">Course not found</p>
        <button
          onClick={() => router.push("/Admin/courses")}
          className="mt-4 px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-lg text-white"
        >
          Back to Courses
        </button>
      </div>
    );
  }

  const displayStudents = showAllStudents 
    ? course.enrolledStudents || [] 
    : (course.enrolledStudents || []).slice(0, 5);

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
          <div>
            <h1 className="text-2xl font-bold text-white">{course.name}</h1>
            <p className="text-white/60">{course.code}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => router.push(`/Admin/courses/${courseId}/edit`)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-lg text-white hover:from-yellow-500 hover:to-orange-500 transition-colors"
          >
            <Edit className="w-4 h-4" />
            Edit Course
          </button>
          <button
            onClick={() => setDeleteModal({ isOpen: true, id: courseId })}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white/80 rounded-lg hover:bg-red-500/30 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
      </div>

      <div className="flex gap-2">
        <span className={`px-3 py-1 rounded-full text-sm ${getStatusBadge(course.status)}`}>
          {course.status}
        </span>
        <span className={`px-3 py-1 rounded-full text-sm ${getLevelBadge(course.level)}`}>
          {course.level}
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Enrolled Students"
          value={course.enrolledCount || 0}
          icon={<Users className="w-4 h-4 text-white" />}
          color="from-blue-400 to-indigo-500"
        />
        <StatCard
          title="Credits"
          value={course.credits}
          icon={<Award className="w-4 h-4 text-white" />}
          color="from-green-400 to-emerald-500"
        />
        <StatCard
          title="Duration"
          value={course.duration}
          icon={<Clock className="w-4 h-4 text-white" />}
          color="from-purple-400 to-pink-500"
        />
        <StatCard
          title="Max Students"
          value={course.maxStudents}
          icon={<Users className="w-4 h-4 text-white" />}
          color="from-orange-400 to-red-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-yellow-400" /> Course Description
            </h2>
            <p className="text-white/80 leading-relaxed">{course.description}</p>
          </div>

          {course.syllabus && (
            <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-6">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-yellow-400" /> Syllabus
              </h2>
              <p className="text-white/80 whitespace-pre-line">{course.syllabus}</p>
            </div>
          )}

          {course.prerequisites && course.prerequisites.length > 0 && (
            <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-6">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-yellow-400" /> Prerequisites
              </h2>
              <div className="flex flex-wrap gap-2">
                {course.prerequisites.map((prereq, index) => (
                  <span key={index} className="px-3 py-1 bg-white/10 rounded-full text-white text-sm">
                    {prereq}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          {course.teacherId ? (
            <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-6">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-yellow-400" /> Instructor
              </h2>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-yellow-400 to-orange-400 flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-medium">
                      {course.teacherId.userId?.firstName} {course.teacherId.userId?.lastName}
                    </p>
                    <p className="text-white/60 text-sm">{course.teacherId.specialization}</p>
                  </div>
                </div>
                <InfoRow
                  icon={<Mail className="w-4 h-4" />}
                  label="Email"
                  value={course.teacherId.userId?.email}
                />
                <InfoRow
                  icon={<Award className="w-4 h-4" />}
                  label="Qualification"
                  value={course.teacherId.qualification}
                />
              </div>
            </div>
          ) : (
            <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-6 text-center">
              <User className="w-12 h-12 text-white/40 mx-auto mb-3" />
              <p className="text-white/60">No teacher assigned</p>
              <button
                onClick={() => router.push(`/Admin/courses/${courseId}/edit`)}
                className="mt-3 px-4 py-2 bg-yellow-400/20 text-yellow-400 rounded-lg text-sm hover:bg-yellow-400/30"
              >
                Assign Teacher
              </button>
            </div>
          )}

          <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Course Details</h2>
            <div className="space-y-3">
              <InfoRow icon={<BookOpen className="w-4 h-4" />} label="Department" value={course.department} />
              <InfoRow icon={<Calendar className="w-4 h-4" />} label="Duration" value={course.duration} />
              <InfoRow icon={<Award className="w-4 h-4" />} label="Credits" value={course.credits} />
              <InfoRow icon={<Users className="w-4 h-4" />} label="Max Students" value={course.maxStudents} />
              <InfoRow icon={<Clock className="w-4 h-4" />} label="Created" value={new Date(course.createdAt).toLocaleDateString()} />
              <InfoRow icon={<Clock className="w-4 h-4" />} label="Last Updated" value={new Date(course.updatedAt).toLocaleDateString()} />
            </div>
          </div>
        </div>
      </div>

      {course.enrolledStudents && course.enrolledStudents.length > 0 && (
        <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-yellow-400" /> Enrolled Students ({course.enrolledStudents.length})
            </h2>
            <button
              onClick={() => router.push(`/Admin/courses/${courseId}/students`)}
              className="text-yellow-400 hover:text-yellow-300 text-sm flex items-center gap-1"
            >
              View All <ArrowLeft className="w-4 h-4 rotate-180" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="px-4 py-2 text-left text-white/80">Student</th>
                  <th className="px-4 py-2 text-left text-white/80">Roll No</th>
                  <th className="px-4 py-2 text-left text-white/80">Class</th>
                  <th className="px-4 py-2 text-left text-white/80">Section</th>
                  <th className="px-4 py-2 text-left text-white/80">Status</th>
                  <th className="px-4 py-2 text-left text-white/80">Progress</th>
                </tr>
              </thead>
              <tbody>
                {displayStudents.map((enrollment) => (
                  <tr key={enrollment._id} className="border-b border-white/10 hover:bg-white/5 cursor-pointer"
                      onClick={() => router.push(`/Admin/students/${enrollment.studentId._id}`)}>
                    <td className="px-4 py-3 text-white">
                      {enrollment.studentId.userId?.firstName} {enrollment.studentId.userId?.lastName}
                    </td>
                    <td className="px-4 py-3 text-white">{enrollment.studentId.rollNumber}</td>
                    <td className="px-4 py-3 text-white">{enrollment.studentId.class}</td>
                    <td className="px-4 py-3 text-white">{enrollment.studentId.section}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        enrollment.status === 'enrolled' 
                          ? 'bg-green-600 text-white/80'
                          : enrollment.status === 'completed'
                          ? 'bg-blue-600 text-white/80'
                          : 'bg-yellow-600 text-white/80'
                      }`}>
                        {enrollment.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-yellow-400 to-orange-400" 
                               style={{ width: `${enrollment.progress || 0}%` }} />
                        </div>
                        <span className="text-white/60 text-xs">{enrollment.progress || 0}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {!showAllStudents && course.enrolledStudents.length > 5 && (
            <button
              onClick={() => setShowAllStudents(true)}
              className="mt-4 w-full py-2 text-yellow-400 hover:text-yellow-300 text-sm"
            >
              Show All {course.enrolledStudents.length} Students
            </button>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={() => router.push(`/Admin/courses/${courseId}/students`)}
          className="p-4 bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 hover:border-white/40 transition-all duration-300 text-left"
        >
          <Users className="w-6 h-6 text-yellow-400 mb-2" />
          <h3 className="text-white font-medium">Manage Students</h3>
          <p className="text-white/60 text-sm">Add or remove students from this course</p>
        </button>

        <button
          onClick={() => router.push(`/Admin/schedules?courseId=${courseId}`)}
          className="p-4 bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 hover:border-white/40 transition-all duration-300 text-left"
        >
          <Calendar className="w-6 h-6 text-yellow-400 mb-2" />
          <h3 className="text-white font-medium">View Schedule</h3>
          <p className="text-white/60 text-sm">Check class schedule for this course</p>
        </button>

        <button
          onClick={() => router.push(`/Admin/enrollments?courseId=${courseId}`)}
          className="p-4 bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 hover:border-white/40 transition-all duration-300 text-left"
        >
          <BookOpen className="w-6 h-6 text-yellow-400 mb-2" />
          <h3 className="text-white font-medium">View Enrollments</h3>
          <p className="text-white/60 text-sm">See all enrollment records</p>
        </button>
      </div>

      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, id: "" })}
        onConfirm={handleDelete}
        title="Delete Course"
        message="Are you sure you want to delete this course? This action cannot be undone and will remove all associated enrollments."
      />
    </div>
  );
};

export default CourseDetailPage;