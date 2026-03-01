"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Calendar,
  FileText,
  LogOut,
  Menu,
  X,
  GraduationCap,
  BarChart3,
  ChevronDown,
  UserCircle,
  Settings,
} from "lucide-react";

interface NavItem {
  name: string;
  href: string;
  icon: React.ReactNode;
}

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const navigation: NavItem[] = [
    { name: "Dashboard", href: "/Admin/dashboard", icon: <LayoutDashboard className="w-5 h-5" /> },
    { name: "Students", href: "/Admin/students", icon: <Users className="w-5 h-5" /> },
    { name: "Teachers", href: "/Admin/teachers", icon: <GraduationCap className="w-5 h-5" /> },
    { name: "Courses", href: "/Admin/courses", icon: <BookOpen className="w-5 h-5" /> },
    { name: "Schedules", href: "/Admin/schedules", icon: <Calendar className="w-5 h-5" /> },
    { name: "Enrollments", href: "/Admin/enrollments", icon: <FileText className="w-5 h-5" /> },
    { name: "Reports", href: "/Admin/reports", icon: <BarChart3 className="w-5 h-5" /> },
  ];

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <div className="min-h-screen bg-gradient-to-br from-sky-400 via-blue-400 to-indigo-500">
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <aside
          className={`fixed top-0 left-0 z-50 h-full w-64 bg-white/10 backdrop-blur-xl border-r border-white/20 transform transition-transform duration-300 lg:translate-x-0 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between p-4 border-b border-white/20">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-yellow-400 to-orange-400 flex items-center justify-center">
                  <GraduationCap className="w-4 h-4 text-white" />
                </div>
                <span className="text-white font-semibold">EMS Admin</span>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden text-white hover:text-yellow-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto p-4">
              <ul className="space-y-2">
                {navigation.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-300 ${
                          isActive
                            ? "bg-gradient-to-r from-yellow-400 to-orange-400 text-white shadow-lg"
                            : "text-white/80 hover:bg-white/20 hover:text-white"
                        }`}
                        onClick={() => setSidebarOpen(false)}
                      >
                        {item.icon}
                        <span className="text-sm font-medium">{item.name}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            <div className="border-t border-white/20 p-4">
              <div className="relative">
                <button
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  className="flex items-center space-x-3 w-full p-2 rounded-lg hover:bg-white/20 transition-all duration-300"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-yellow-400 to-orange-400 flex items-center justify-center">
                    <UserCircle className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium text-white">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-xs text-white/60">{user?.email}</p>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-white transition-transform duration-300 ${profileMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {profileMenuOpen && (
                  <div className="absolute bottom-full left-0 w-full mb-2 bg-white/10 backdrop-blur-xl rounded-lg border border-white/20 shadow-xl">
                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-2 w-full px-4 py-3 text-left text-white hover:bg-white/20 rounded-lg transition-all duration-300"
                    >
                      <LogOut className="w-4 h-4" />
                      <span className="text-sm">Logout</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </aside>

        <div className="lg:pl-64">
          <header className="lg:hidden bg-white/10 backdrop-blur-xl border-b border-white/20 p-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-white hover:text-yellow-300"
            >
              <Menu className="w-6 h-6" />
            </button>
          </header>

          <main className="p-4 md:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default AdminLayout;