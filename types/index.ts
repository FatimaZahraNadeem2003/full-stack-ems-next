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

export interface Student {
  _id: string;
  userId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  dateOfBirth?: string;
  gender?: string;
  contactNumber?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  parentName?: string;
  parentContact?: string;
  class: string;
  section?: string;
  rollNumber?: string;
  admissionDate: string;
  status: 'active' | 'inactive' | 'graduated' | 'suspended';
  createdAt: string;
  updatedAt: string;
}

export interface Teacher {
  _id: string;
  userId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  employeeId: string;
  qualification: string;
  specialization: string;
  experience?: number;
  dateOfBirth?: string;
  gender?: string;
  contactNumber: string;
  emergencyContact?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  joiningDate: string;
  status: 'active' | 'inactive' | 'on-leave' | 'resigned';
  bio?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Course {
  _id: string;
  name: string;
  code: string;
  description: string;
  teacherId?: string | Teacher;
  credits: number;
  duration: string;
  department: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  syllabus?: string;
  prerequisites?: string[];
  maxStudents: number;
  status: 'active' | 'inactive' | 'upcoming' | 'completed';
  enrolledCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Schedule {
  _id: string;
  courseId: Course | string;
  teacherId: Teacher | string;
  dayOfWeek: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  startTime: string;
  endTime: string;
  room: string;
  building?: string;
  duration?: number;
  semester: string;
  academicYear: string;
  isRecurring: boolean;
  status: 'scheduled' | 'cancelled' | 'completed';
  createdAt: string;
  updatedAt: string;
}

export interface Enrollment {
  _id: string;
  studentId: Student | string;
  courseId: Course | string;
  enrollmentDate: string;
  status: 'enrolled' | 'dropped' | 'completed' | 'pending';
  progress?: number;
  completionDate?: string;
  grade?: string;
  marksObtained?: number;
  remarks?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Grade {
  _id: string;
  studentId: Student | string;
  courseId: Course | string;
  teacherId: Teacher | string;
  assessmentType: 'quiz' | 'assignment' | 'midterm' | 'final' | 'project' | 'participation' | 'other';
  assessmentName: string;
  maxMarks: number;
  obtainedMarks: number;
  percentage?: number;
  grade?: string;
  remarks?: string;
  submittedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface Remark {
  _id: string;
  studentId: Student | string;
  teacherId: Teacher | string;
  courseId?: Course | string;
  remark: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  count?: number;
  total?: number;
  page?: number;
  pages?: number;
}

export interface PaginatedResponse<T> {
  success: boolean;
  count: number;
  total: number;
  page: number;
  pages: number;
  data: T[];
}

export interface DashboardStats {
  overview: {
    totalStudents: number;
    totalTeachers: number;
    totalCourses: number;
    totalEnrollments: number;
    activeCourses: number;
    activeEnrollments: number;
    completionRate: number;
    avgStudentsPerCourse: number;
  };
  todayClasses: {
    count: number;
    classes: Schedule[];
  };
  popularCourses: Array<{
    _id: string;
    course: {
      name: string;
      code: string;
      department: string;
    };
    count: number;
  }>;
  recentActivity: {
    enrollments: Enrollment[];
  };
}