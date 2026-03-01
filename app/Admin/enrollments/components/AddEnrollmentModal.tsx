"use client";

import React, { useState, useEffect } from "react";
import http from "@/services/http";
import toast from "react-hot-toast";
import { X, Search } from "lucide-react";

interface AddEnrollmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface Student {
  _id: string;
  userId: {
    firstName: string;
    lastName: string;
    email: string;
  };
  rollNumber: string;
  class: string;
  section: string;
}

interface Course {
  _id: string;
  name: string;
  code: string;
  credits: number;
  maxStudents: number;
  enrolledCount?: number;
}

export default function AddEnrollmentModal({ isOpen, onClose, onSuccess }: AddEnrollmentModalProps) {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"select" | "confirm">("select");
  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [studentSearch, setStudentSearch] = useState("");
  const [courseSearch, setCourseSearch] = useState("");
  const [studentLoading, setStudentLoading] = useState(false);
  const [courseLoading, setCourseLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchStudents();
      fetchCourses();
    } else {
      resetForm();
    }
  }, [isOpen]);

  const fetchStudents = async () => {
    try {
      setStudentLoading(true);
      const response = await http.get("/admin/students?status=active&limit=50");
      setStudents(response.data.data);
    } catch (error) {
      console.error("Error fetching students:", error);
    } finally {
      setStudentLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      setCourseLoading(true);
      const response = await http.get("/admin/courses?status=active&limit=50");
      setCourses(response.data.data);
    } catch (error) {
      console.error("Error fetching courses:", error);
    } finally {
      setCourseLoading(false);
    }
  };

  const resetForm = () => {
    setStep("select");
    setSelectedStudent(null);
    setSelectedCourse(null);
    setStudentSearch("");
    setCourseSearch("");
  };

  const filteredStudents = students.filter(
    (s) =>
      s.userId?.firstName.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.userId?.lastName.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.rollNumber?.toLowerCase().includes(studentSearch.toLowerCase())
  );

  const filteredCourses = courses.filter(
    (c) =>
      c.name.toLowerCase().includes(courseSearch.toLowerCase()) ||
      c.code.toLowerCase().includes(courseSearch.toLowerCase())
  );

  const handleEnroll = async () => {
    if (!selectedStudent || !selectedCourse) return;

    try {
      setLoading(true);
      await http.post("/admin/enrollments", {
        studentId: selectedStudent._id,
        courseId: selectedCourse._id,
        status: "enrolled",
      });
      toast.success("Student enrolled successfully");
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Error enrolling student:", error);
      toast.error(error.response?.data?.msg || "Failed to enroll student");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="relative w-full max-w-2xl bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-6 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/60 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-bold text-white mb-6">
          {step === "select" ? "New Enrollment" : "Confirm Enrollment"}
        </h2>

        {step === "select" ? (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Select Student *
              </label>
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <input
                  type="text"
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  placeholder="Search by name or roll number..."
                  className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-yellow-400"
                />
              </div>
              <div className="max-h-48 overflow-y-auto bg-white/5 rounded-lg border border-white/10">
                {studentLoading ? (
                  <div className="p-4 text-center text-white/60">Loading students...</div>
                ) : filteredStudents.length === 0 ? (
                  <div className="p-4 text-center text-white/60">No students found</div>
                ) : (
                  filteredStudents.map((student) => (
                    <button
                      key={student._id}
                      onClick={() => setSelectedStudent(student)}
                      className={`w-full p-3 text-left hover:bg-white/10 transition-colors ${
                        selectedStudent?._id === student._id ? "bg-white/20" : ""
                      }`}
                    >
                      <p className="text-white font-medium">
                        {student.userId?.firstName} {student.userId?.lastName}
                      </p>
                      <p className="text-white/60 text-sm">
                        {student.rollNumber} - {student.class} {student.section}
                      </p>
                    </button>
                  ))
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Select Course *
              </label>
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <input
                  type="text"
                  value={courseSearch}
                  onChange={(e) => setCourseSearch(e.target.value)}
                  placeholder="Search by course name or code..."
                  className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-yellow-400"
                />
              </div>
              <div className="max-h-48 overflow-y-auto bg-white/5 rounded-lg border border-white/10">
                {courseLoading ? (
                  <div className="p-4 text-center text-white/60">Loading courses...</div>
                ) : filteredCourses.length === 0 ? (
                  <div className="p-4 text-center text-white/60">No courses found</div>
                ) : (
                  filteredCourses.map((course) => (
                    <button
                      key={course._id}
                      onClick={() => setSelectedCourse(course)}
                      className={`w-full p-3 text-left hover:bg-white/10 transition-colors ${
                        selectedCourse?._id === course._id ? "bg-white/20" : ""
                      }`}
                    >
                      <p className="text-white font-medium">{course.name}</p>
                      <p className="text-white/60 text-sm">
                        {course.code} - {course.credits} credits
                      </p>
                    </button>
                  ))
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => setStep("confirm")}
                disabled={!selectedStudent || !selectedCourse}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-yellow-400 to-orange-400 text-white hover:from-yellow-500 hover:to-orange-500 transition-colors disabled:opacity-50"
              >
                Continue
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-white/5 rounded-lg p-4 border border-white/10">
              <h3 className="text-white font-semibold mb-3">Student Details</h3>
              <p className="text-white">
                {selectedStudent?.userId?.firstName} {selectedStudent?.userId?.lastName}
              </p>
              <p className="text-white/60 text-sm">
                {selectedStudent?.rollNumber} - {selectedStudent?.class} {selectedStudent?.section}
              </p>
              <p className="text-white/60 text-sm">{selectedStudent?.userId?.email}</p>
            </div>

            <div className="bg-white/5 rounded-lg p-4 border border-white/10">
              <h3 className="text-white font-semibold mb-3">Course Details</h3>
              <p className="text-white">{selectedCourse?.name}</p>
              <p className="text-white/60 text-sm">
                {selectedCourse?.code} - {selectedCourse?.credits} credits
              </p>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => setStep("select")}
                className="px-4 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleEnroll}
                disabled={loading}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-green-400 to-emerald-500 text-white hover:from-green-500 hover:to-emerald-600 transition-colors disabled:opacity-50"
              >
                {loading ? "Enrolling..." : "Confirm Enrollment"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}