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