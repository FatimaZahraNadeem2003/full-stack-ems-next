/* eslint-disable @typescript-eslint/no-explicit-any */

import http from "@/services/http";
import { ApiResponse, PaginatedResponse } from "@/types";
import toast from "react-hot-toast";


export interface LoginCredentials {
  email: string;
  password: string;
  role?: string;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: string;
  class?: string;
  contactNumber?: string;
  parentName?: string;
  parentContact?: string;
  employeeId?: string;
  qualification?: string;
  specialization?: string;
}

export const authApi = {
  login: async (credentials: LoginCredentials) => {
    const response = await http.post("/auth/login", credentials);
    return response.data;
  },

  register: async (data: RegisterData) => {
    const response = await http.post("/auth/register", data);
    return response.data;
  },

  getProfile: async () => {
    const response = await http.get("/auth/me");
    return response.data;
  },
};


export interface StudentData {
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  class: string;
  section?: string;
  rollNumber?: string;
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
  status?: string;
}

export interface TeacherData {
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  employeeId: string;
  qualification: string;
  specialization: string;
  experience?: number;
  contactNumber: string;
  emergencyContact?: string;
  dateOfBirth?: string;
  gender?: string;
  address?: any;
  bio?: string;
  status?: string;
}

export interface CourseData {
  name: string;
  code: string;
  description: string;
  teacherId?: string;
  credits: number;
  duration: string;
  department: string;
  level?: string;
  syllabus?: string;
  prerequisites?: string[];
  maxStudents?: number;
  status?: string;
}

export interface ScheduleData {
  courseId: string;
  teacherId: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  room: string;
  building?: string;
  semester: string;
  academicYear: string;
  isRecurring?: boolean;
  status?: string;
}

export interface EnrollmentData {
  studentId: string;
  courseId: string;
  status?: string;
  progress?: number;
}

export const adminApi = {
  students: {
    getAll: async (params?: any) => {
      const response = await http.get("/admin/students", { params });
      return response.data;
    },
    getById: async (id: string) => {
      const response = await http.get(`/admin/students/${id}`);
      return response.data;
    },
    create: async (data: StudentData) => {
      const response = await http.post("/admin/students", data);
      return response.data;
    },
    update: async (id: string, data: Partial<StudentData>) => {
      const response = await http.put(`/admin/students/${id}`, data);
      return response.data;
    },
    delete: async (id: string) => {
      const response = await http.delete(`/admin/students/${id}`);
      return response.data;
    },
  },

  teachers: {
    getAll: async (params?: any) => {
      const response = await http.get("/admin/teachers", { params });
      return response.data;
    },
    getById: async (id: string) => {
      const response = await http.get(`/admin/teachers/${id}`);
      return response.data;
    },
    create: async (data: TeacherData) => {
      const response = await http.post("/admin/teachers", data);
      return response.data;
    },
    update: async (id: string, data: Partial<TeacherData>) => {
      const response = await http.put(`/admin/teachers/${id}`, data);
      return response.data;
    },
    delete: async (id: string) => {
      const response = await http.delete(`/admin/teachers/${id}`);
      return response.data;
    },
    getStats: async () => {
      const response = await http.get("/admin/teachers/stats");
      return response.data;
    },
  },

  courses: {
    getAll: async (params?: any) => {
      const response = await http.get("/admin/courses", { params });
      return response.data;
    },
    getById: async (id: string) => {
      const response = await http.get(`/admin/courses/${id}`);
      return response.data;
    },
    create: async (data: CourseData) => {
      const response = await http.post("/admin/courses", data);
      return response.data;
    },
    update: async (id: string, data: Partial<CourseData>) => {
      const response = await http.put(`/admin/courses/${id}`, data);
      return response.data;
    },
    delete: async (id: string) => {
      const response = await http.delete(`/admin/courses/${id}`);
      return response.data;
    },
    assignTeacher: async (courseId: string, teacherId: string) => {
      const response = await http.post(`/admin/courses/${courseId}/assign-teacher`, { teacherId });
      return response.data;
    },
    getStats: async () => {
      const response = await http.get("/admin/courses/stats");
      return response.data;
    },
  },

  schedules: {
    getAll: async (params?: any) => {
      const response = await http.get("/admin/schedules", { params });
      return response.data;
    },
    getById: async (id: string) => {
      const response = await http.get(`/admin/schedules/${id}`);
      return response.data;
    },
    create: async (data: ScheduleData) => {
      const response = await http.post("/admin/schedules", data);
      return response.data;
    },
    update: async (id: string, data: Partial<ScheduleData>) => {
      const response = await http.put(`/admin/schedules/${id}`, data);
      return response.data;
    },
    delete: async (id: string) => {
      const response = await http.delete(`/admin/schedules/${id}`);
      return response.data;
    },
    getWeekly: async (params?: any) => {
      const response = await http.get("/admin/schedules/weekly", { params });
      return response.data;
    },
  },

  enrollments: {
    getAll: async (params?: any) => {
      const response = await http.get("/admin/enrollments", { params });
      return response.data;
    },
    getById: async (id: string) => {
      const response = await http.get(`/admin/enrollments/${id}`);
      return response.data;
    },
    create: async (data: EnrollmentData) => {
      const response = await http.post("/admin/enrollments", data);
      return response.data;
    },
    update: async (id: string, data: Partial<EnrollmentData>) => {
      const response = await http.put(`/admin/enrollments/${id}`, data);
      return response.data;
    },
    delete: async (id: string) => {
      const response = await http.delete(`/admin/enrollments/${id}`);
      return response.data;
    },
    getStudentCourses: async (studentId: string, params?: any) => {
      const response = await http.get(`/admin/enrollments/student/${studentId}`, { params });
      return response.data;
    },
    bulkEnroll: async (courseId: string, studentIds: string[]) => {
      const response = await http.post("/admin/enrollments/bulk", { courseId, studentIds });
      return response.data;
    },
  },

  reports: {
    getDashboard: async () => {
      const response = await http.get("/admin/reports/dashboard");
      return response.data;
    },
    getStudentsCount: async (params?: any) => {
      const response = await http.get("/admin/reports/students-count", { params });
      return response.data;
    },
    getCoursesCount: async (params?: any) => {
      const response = await http.get("/admin/reports/courses-count", { params });
      return response.data;
    },
    getTodayClasses: async () => {
      const response = await http.get("/admin/reports/today-classes");
      return response.data;
    },
    getTeacherWorkload: async () => {
      const response = await http.get("/admin/reports/teacher-workload");
      return response.data;
    },
  },
};


export interface GradeData {
  studentId: string;
  courseId: string;
  assessmentType: string;
  assessmentName: string;
  maxMarks: number;
  obtainedMarks: number;
  remarks?: string;
}

export interface RemarkData {
  studentId: string;
  courseId?: string;
  remark: string;
}

export const teacherApi = {
  getDashboardStats: async () => {
    const response = await http.get("/teacher/dashboard/stats");
    return response.data;
  },

  courses: {
    getAll: async () => {
      const response = await http.get("/teacher/courses");
      return response.data;
    },
    getById: async (courseId: string) => {
      const response = await http.get(`/teacher/courses/${courseId}`);
      return response.data;
    },
    getStudents: async (courseId: string) => {
      const response = await http.get(`/teacher/courses/${courseId}/students`);
      return response.data;
    },
  },

  grades: {
    getAll: async (courseId: string) => {
      const response = await http.get(`/teacher/grades/course/${courseId}`);
      return response.data;
    },
    getStudentGrades: async (studentId: string) => {
      const response = await http.get(`/teacher/grades/student/${studentId}`);
      return response.data;
    },
    create: async (data: GradeData) => {
      const response = await http.post("/teacher/grades", data);
      return response.data;
    },
    update: async (id: string, data: Partial<GradeData>) => {
      const response = await http.put(`/teacher/grades/${id}`, data);
      return response.data;
    },
  },

  schedule: {
    get: async () => {
      const response = await http.get("/teacher/schedules");
      return response.data;
    },
    update: async (id: string, data: any) => {
      const response = await http.put(`/teacher/schedules/${id}`, data);
      return response.data;
    },
  },

  remarks: {
    create: async (data: RemarkData) => {
      const response = await http.post("/teacher/remarks", data);
      return response.data;
    },
    getStudentRemarks: async (studentId: string) => {
      const response = await http.get(`/teacher/remarks/student/${studentId}`);
      return response.data;
    },
  },
};


export const studentApi = {
  profile: {
    get: async () => {
      const response = await http.get("/student/profile");
      return response.data;
    },
    update: async (data: any) => {
      const response = await http.put("/student/profile", data);
      return response.data;
    },
  },

  courses: {
    getAll: async () => {
      const response = await http.get("/student/courses");
      return response.data;
    },
    
    getAvailable: async () => {
      const response = await http.get("/student/courses/available");
      return response.data;
    },
    
    getById: async (courseId: string) => {
      const response = await http.get(`/student/courses/${courseId}`);
      return response.data;
    },
    
    enroll: async (courseId: string) => {
      const response = await http.post("/student/enroll", { courseId });
      return response.data;
    },
  },

  schedule: {
    get: async () => {
      const response = await http.get("/student/schedule");
      return response.data;
    },
  },

  grades: {
    getAll: async () => {
      const response = await http.get("/student/grades");
      return response.data;
    },
    getByCourse: async (courseId: string) => {
      const response = await http.get(`/student/grades/course/${courseId}`);
      return response.data;
    },
  },

  progress: {
    get: async () => {
      const response = await http.get("/student/progress");
      return response.data;
    },
  },
};