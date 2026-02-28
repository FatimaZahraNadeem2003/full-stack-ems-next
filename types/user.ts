export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'admin' | 'teacher' | 'student';
  profile?: any;
}

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