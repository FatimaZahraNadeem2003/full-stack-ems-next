export type UserRole = "admin" | "teacher" | "student";

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserRegistration {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface AuthResponse {
  user: User;
  token: string;
}
