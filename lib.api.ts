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
  // Student APIs
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