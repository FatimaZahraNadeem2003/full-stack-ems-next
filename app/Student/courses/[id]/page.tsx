"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import http from "@/services/http";
import toast from "react-hot-toast";
import { 
  ArrowLeft, 
  BookOpen, 
  Calendar, 
  Clock, 
  Award, 
  User, 
  Mail, 
  GraduationCap,
  FileText,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import LoadingSpinner from "@/app/components/ui/LoadingSpinner";

interface CourseDetail {
  _id: string;
  name: string;
  code: string;
  description: string;
  credits: number;
  department: string;
  level: string;
  syllabus?: string;
  duration: string;
  maxStudents: number;
  status: string;
  teacher: {
    name: string;
    email: string;
    qualification: string;
    specialization: string;
  } | null;
  enrollment: {
    status: string;
    progress: number;
    enrolledDate: string;
  };
  academics: {
    grades: Array<{
      _id: string;
      assessmentType: string;
      assessmentName: string;
      maxMarks: number;
      obtainedMarks: number;
      percentage: number;
      grade: string;
      remarks?: string;
      submittedAt: string;
    }>;
    statistics: {
      totalAssessments: number;
      overallPercentage: string;
      averageGrade: string;
    };
  };
  schedule: Array<{
    _id: string;
    dayOfWeek: string;
    startTime: string;
    endTime: string;
    room: string;
    building?: string;
  }>;
}

const StudentCourseDetailPage = () => {
  const router = useRouter();
  const params = useParams();
  const courseId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [showFullSyllabus, setShowFullSyllabus] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    overview: true,
    syllabus: false,
    schedule: false,
    grades: true
  });

  useEffect(() => {
    if (courseId) {
      fetchCourseDetails();
    }
  }, [courseId]);

  const fetchCourseDetails = async () => {
    try {
      setLoading(true);
      const response = await http.get(`/student/courses/${courseId}`);
      console.log("Course details response:", response.data);
      
      const courseData = response.data.data || response.data;
      console.log("Course data:", courseData);
      
      setCourse(courseData);
    } catch (error: any) {
      console.error("Error fetching course:", error);
      toast.error(error.response?.data?.msg || "Failed to load course details");
      router.push("/Student/courses");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    if (!status) return "bg-gray-600 text-white";
    
    const colors: Record<string, string> = {
      enrolled: "bg-green-600 text-white",
      completed: "bg-blue-600 text-white",
      dropped: "bg-red-600 text-white",
      pending: "bg-yellow-600 text-white",
    };
    return colors[status] || "bg-gray-600 text-white";
  };

  const getLevelBadge = (level: string) => {
    if (!level) return "bg-gray-600 text-white";
    
    const colors: Record<string, string> = {
      beginner: "bg-green-600 text-white",
      intermediate: "bg-yellow-600 text-white",
      advanced: "bg-red-600 text-white",
    };
    return colors[level] || "bg-gray-600 text-white";
  };

  const getGradeColor = (grade: string) => {
    if (!grade) return "text-white";
    
    if (grade.startsWith('A')) return "text-green-400";
    if (grade.startsWith('B')) return "text-blue-400";
    if (grade.startsWith('C')) return "text-yellow-400";
    if (grade.startsWith('D')) return "text-orange-400";
    if (grade === 'F') return "text-red-400";
    return "text-white";
  };

  const dayNames: Record<string, string> = {
    monday: "Monday",
    tuesday: "Tuesday",
    wednesday: "Wednesday",
    thursday: "Thursday",
    friday: "Friday",
    saturday: "Saturday",
    sunday: "Sunday",
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const calculateRealProgress = () => {
    if (!course?.academics?.grades || course.academics.grades.length === 0) {
      return 0;
    }
    
    const totalPercentage = course.academics.grades.reduce((sum, grade) => {
      return sum + (grade.percentage || 0);
    }, 0);
    
    return Math.round(totalPercentage / course.academics.grades.length);
  };

  const StatCard = ({ title, value, icon, color }: any) => (
    <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-4">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg bg-gradient-to-r ${color}`}>
          {icon}
        </div>
        <div>
          <p className="text-white/80 text-xs font-medium">{title}</p>
          <p className="text-white font-bold text-lg">{value}</p>
        </div>
      </div>
    </div>
  );

  const InfoRow = ({ icon, label, value }: any) => (
    <div className="flex items-start gap-3 p-3 bg-white/5 rounded-lg border border-white/10">
      <div className="p-2 bg-yellow-400/20 rounded-lg">
        {icon}
      </div>
      <div>
        <p className="text-white/80 text-xs font-medium">{label}</p>
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

  if (!course) {
    return (
      <div className="text-center py-8">
        <BookOpen className="w-16 h-16 text-white/40 mx-auto mb-4" />
        <p className="text-white font-bold text-xl mb-2">Course not found</p>
        <p className="text-white/80 mb-6">The course {`you're looking for doesn't exist or you don't have access.`}</p>
        <button
          onClick={() => router.push("/Student/courses")}
          className="px-6 py-2 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-lg text-white font-bold hover:from-yellow-500 hover:to-orange-500 transition-colors"
        >
          Back to My Courses
        </button>
      </div>
    );
  }

  const realProgress = calculateRealProgress();

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
            <p className="text-white/80 font-medium">{course.code}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <span className={`px-3 py-1 rounded-full text-sm font-bold ${getStatusBadge(course.enrollment?.status)}`}>
            {(course.enrollment?.status || 'unknown').toUpperCase()}
          </span>
          <span className={`px-3 py-1 rounded-full text-sm font-bold ${getLevelBadge(course.level)}`}>
            {course.level ? course.level.toUpperCase() : 'BEGINNER'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="Credits"
          value={course.credits}
          icon={<Award className="w-4 h-4 text-white" />}
          color="from-blue-400 to-indigo-500"
        />
        <StatCard
          title="Progress"
          value={`${realProgress}%`}
          icon={<GraduationCap className="w-4 h-4 text-white" />}
          color="from-green-400 to-emerald-500"
        />
        <StatCard
          title="Assessments"
          value={course.academics?.grades?.length || 0}
          icon={<FileText className="w-4 h-4 text-white" />}
          color="from-purple-400 to-pink-500"
        />
        <StatCard
          title="Average"
          value={course.academics?.statistics?.overallPercentage ? `${course.academics.statistics.overallPercentage}%` : '0%'}
          icon={<Award className="w-4 h-4 text-white" />}
          color="from-orange-400 to-red-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 overflow-hidden">
            <button
              onClick={() => toggleSection('overview')}
              className="w-full p-4 flex items-center justify-between bg-white/5 hover:bg-white/10 transition-colors"
            >
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-yellow-400" />
                COURSE OVERVIEW
              </h2>
              {expandedSections.overview ? (
                <ChevronUp className="w-5 h-5 text-white/80" />
              ) : (
                <ChevronDown className="w-5 h-5 text-white/80" />
              )}
            </button>
            
            {expandedSections.overview && (
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InfoRow
                    icon={<BookOpen className="w-4 h-4 text-yellow-400" />}
                    label="Department"
                    value={course.department}
                  />
                  <InfoRow
                    icon={<Clock className="w-4 h-4 text-yellow-400" />}
                    label="Duration"
                    value={course.duration}
                  />
                  <InfoRow
                    icon={<Award className="w-4 h-4 text-yellow-400" />}
                    label="Credits"
                    value={course.credits}
                  />
                  <InfoRow
                    icon={<Calendar className="w-4 h-4 text-yellow-400" />}
                    label="Enrolled On"
                    value={course.enrollment?.enrolledDate ? new Date(course.enrollment.enrolledDate).toLocaleDateString() : 'N/A'}
                  />
                </div>
                
                <div className="mt-4">
                  <h3 className="text-white font-bold mb-2">Description</h3>
                  <p className="text-white/90 leading-relaxed">{course.description || 'No description available'}</p>
                </div>
              </div>
            )}
          </div>

          {course.syllabus && (
            <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 overflow-hidden">
              <button
                onClick={() => toggleSection('syllabus')}
                className="w-full p-4 flex items-center justify-between bg-white/5 hover:bg-white/10 transition-colors"
              >
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-yellow-400" />
                  SYLLABUS
                </h2>
                {expandedSections.syllabus ? (
                  <ChevronUp className="w-5 h-5 text-white/80" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-white/80" />
                )}
              </button>
              
              {expandedSections.syllabus && (
                <div className="p-6">
                  <p className={`text-white/90 leading-relaxed ${!showFullSyllabus ? 'line-clamp-3' : ''}`}>
                    {course.syllabus}
                  </p>
                  {course.syllabus.length > 200 && (
                    <button
                      onClick={() => setShowFullSyllabus(!showFullSyllabus)}
                      className="mt-3 text-yellow-400 hover:text-yellow-300 font-bold text-sm"
                    >
                      {showFullSyllabus ? 'Show Less' : 'Read More'}
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {course.schedule && course.schedule.length > 0 && (
            <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 overflow-hidden">
              <button
                onClick={() => toggleSection('schedule')}
                className="w-full p-4 flex items-center justify-between bg-white/5 hover:bg-white/10 transition-colors"
              >
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-yellow-400" />
                  CLASS SCHEDULE
                </h2>
                {expandedSections.schedule ? (
                  <ChevronUp className="w-5 h-5 text-white/80" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-white/80" />
                )}
              </button>
              
              {expandedSections.schedule && (
                <div className="p-6">
                  <div className="space-y-3">
                    {course.schedule.map((cls) => (
                      <div
                        key={cls._id}
                        className="flex flex-col md:flex-row md:items-center md:justify-between p-3 bg-white/5 rounded-lg border border-white/10"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-white font-bold capitalize">{dayNames[cls.dayOfWeek] || cls.dayOfWeek}</span>
                            <span className="text-white/80 text-sm">{cls.startTime} - {cls.endTime}</span>
                          </div>
                          <p className="text-white/80 text-sm">
                            Room: {cls.room} {cls.building && `- ${cls.building}`}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="space-y-6">
          {course.teacher ? (
            <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-6">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-yellow-400" />
                INSTRUCTOR
              </h2>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-yellow-400 to-orange-400 flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-bold">{course.teacher.name || 'N/A'}</p>
                    <p className="text-white/80 text-sm">{course.teacher.specialization || ''}</p>
                  </div>
                </div>
                
                <InfoRow
                  icon={<Mail className="w-4 h-4 text-yellow-400" />}
                  label="Email"
                  value={course.teacher.email}
                />
                <InfoRow
                  icon={<Award className="w-4 h-4 text-yellow-400" />}
                  label="Qualification"
                  value={course.teacher.qualification}
                />
              </div>
            </div>
          ) : (
            <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-6 text-center">
              <User className="w-12 h-12 text-white/40 mx-auto mb-3" />
              <p className="text-white/80 font-medium">No instructor assigned</p>
            </div>
          )}

          {course.academics?.grades && course.academics.grades.length > 0 && (
            <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 overflow-hidden">
              <button
                onClick={() => toggleSection('grades')}
                className="w-full p-4 flex items-center justify-between bg-white/5 hover:bg-white/10 transition-colors"
              >
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Award className="w-5 h-5 text-yellow-400" />
                  GRADES ({course.academics.grades.length})
                </h2>
                {expandedSections.grades ? (
                  <ChevronUp className="w-5 h-5 text-white/80" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-white/80" />
                )}
              </button>
              
              {expandedSections.grades && (
                <div className="p-4 max-h-96 overflow-y-auto">
                  <div className="space-y-3">
                    {course.academics.grades.map((grade) => (
                      <div
                        key={grade._id}
                        className="p-3 bg-white/5 rounded-lg border border-white/10"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-white font-bold text-sm">{grade.assessmentName}</p>
                          <span className={`text-sm font-bold ${getGradeColor(grade.grade)}`}>
                            {grade.grade}
                          </span>
                        </div>
                        <p className="text-white/80 text-xs mb-1 capitalize">{grade.assessmentType}</p>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-white/80">
                            Marks: {grade.obtainedMarks}/{grade.maxMarks}
                          </span>
                          <span className="text-white font-bold">{grade.percentage}%</span>
                        </div>
                        {grade.remarks && (
                          <p className="text-white/60 text-xs mt-1 italic">{`"{grade.remarks}"`}</p>
                        )}
                        <p className="text-white/40 text-xs mt-1">
                          {new Date(grade.submittedAt).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {(!course.academics?.grades || course.academics.grades.length === 0) && (
            <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-6 text-center">
              <Award className="w-12 h-12 text-white/40 mx-auto mb-3" />
              <p className="text-white/80 font-medium">No grades available yet</p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-white font-bold">COURSE PROGRESS</h3>
          <span className="text-white font-bold">{realProgress}%</span>
        </div>
        <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full transition-all duration-300"
            style={{ width: `${realProgress}%` }}
          />
        </div>
        {course.academics?.grades && course.academics.grades.length > 0 && (
          <p className="text-white/60 text-xs mt-2">
            Based on {course.academics.grades.length} assessment(s)
          </p>
        )}
      </div>
    </div>
  );
};

export default StudentCourseDetailPage;