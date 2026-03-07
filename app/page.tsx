"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import dynamic from 'next/dynamic';
import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";

type LoginForm = {
  email: string;
  password: string;
  role: "admin" | "teacher" | "student";
};

function LoginPage() {
  const router = useRouter();
  const {
    login,
    loading: loginLoading,
    isAuthenticated,
    user,
    loading: authLoading,
  } = useAuth();

  const [form, setForm] = useState<LoginForm>({
    email: "",
    password: "",
    role: "student",
  });
  
  const [mounted, setMounted] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isAuthenticated() && user) {
      const dashboardPath = 
        user.role === "admin" ? "/Admin/dashboard" :
        user.role === "teacher" ? "/Teacher/dashboard" :
        "/Student/dashboard";
      router.push(dashboardPath);
    }
  }, [isAuthenticated, user, router]);

  if (!mounted) {
    return (
      <section className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden bg-gradient-to-br from-sky-400 via-blue-400 to-indigo-500">
        <div className="relative z-10 glass-card rounded-2xl w-full max-w-md p-6 md:p-8 text-center backdrop-blur-xl bg-white/30 border border-white/40 shadow-2xl">
          <div className="relative animate-spin rounded-full h-16 w-16 border-4 border-t-yellow-400 border-r-orange-400 border-b-pink-400 border-l-transparent mx-auto"></div>
          <p className="mt-6 text-white font-medium">Loading...</p>
        </div>
      </section>
    );
  }

  if (authLoading) {
    return (
      <section className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden bg-gradient-to-br from-sky-400 via-blue-400 to-indigo-500">
        <div className="relative z-10 glass-card rounded-2xl w-full max-w-md p-6 md:p-8 text-center backdrop-blur-xl bg-white/30 border border-white/40 shadow-2xl">
          <div className="relative animate-spin rounded-full h-16 w-16 border-4 border-t-yellow-400 border-r-orange-400 border-b-pink-400 border-l-transparent mx-auto"></div>
          <p className="mt-6 text-white font-medium">Initializing...</p>
        </div>
      </section>
    );
  }

  if (isAuthenticated() && user) {
    return (
      <section className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden bg-gradient-to-br from-sky-400 via-blue-400 to-indigo-500">
        <div className="relative z-10 glass-card rounded-2xl w-full max-w-md p-6 md:p-8 text-center backdrop-blur-xl bg-white/30 border border-white/40 shadow-2xl">
          <div className="relative animate-spin rounded-full h-16 w-16 border-4 border-t-yellow-400 border-r-orange-400 border-b-pink-400 border-l-transparent mx-auto"></div>
          <p className="mt-6 text-white font-medium">Redirecting to dashboard...</p>
        </div>
      </section>
    );
  }

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!form.email || !form.password) {
      toast.error("Please provide email and password");
      return;
    }

    try {
      await login(form.email, form.password, form.role);
    } catch (err: any) {
      console.error("Login error:", err);
    }
  };

  return (
    <section className="min-h-screen flex items-center justify-center px-4 py-8 relative overflow-hidden bg-gradient-to-br from-sky-400 via-blue-400 to-indigo-500">
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-64 h-64 bg-yellow-300/40 rounded-full filter blur-3xl animate-float-slow"></div>
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-pink-300/40 rounded-full filter blur-3xl animate-float-slower"></div>
        <div className="absolute top-40 right-40 w-48 h-48 bg-purple-300/40 rounded-full filter blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-40 left-20 w-56 h-56 bg-orange-300/40 rounded-full filter blur-3xl animate-float"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-400 rounded-2xl blur-xl opacity-60 animate-pulse-slow"></div>
          <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-400 rounded-2xl opacity-70 animate-gradient"></div>
          
          <div className="relative bg-white/30 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-white/50">
            <div className="text-center mb-8">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-r from-yellow-400 to-orange-400 p-[2px]">
                <div className="w-full h-full rounded-full bg-white/90 flex items-center justify-center">
                  <svg className="w-10 h-10 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
              </div>
              
              <h1 className="text-3xl font-bold">
                <span className="bg-gradient-to-r from-yellow-600 via-orange-600 to-pink-600 bg-clip-text text-transparent">
                  Welcome Back
                </span>
              </h1>
              <p className="text-white/80 mt-2">Login to continue your journey</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  value={form.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/50 focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/50 transition-all duration-300"
                  placeholder="email@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  required
                  value={form.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/50 focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/50 transition-all duration-300"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">
                  Select Your Role
                </label>
                <div className="relative">
                  <select
                    name="role"
                    value={form.role}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white appearance-none cursor-pointer focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/50 transition-all duration-300"
                  >
                    <option value="student" className="bg-gray-800 text-white">🎓 Student</option>
                    <option value="teacher" className="bg-gray-800 text-white">👨‍🏫 Teacher</option>
                    <option value="admin" className="bg-gray-800 text-white">⚙️ Admin</option>
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg className="w-5 h-5 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 bg-white/20 border border-white/30 rounded focus:ring-yellow-400"
                  />
                  <span className="ml-2 text-sm text-white/80">Remember me</span>
                </label>
                <button type="button" className="text-sm text-yellow-400 hover:text-yellow-300">
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                disabled={loginLoading}
                className="w-full py-3 px-4 bg-gradient-to-r from-yellow-400 to-orange-400 text-white rounded-lg font-bold hover:from-yellow-500 hover:to-orange-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loginLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    Logging in...
                  </span>
                ) : (
                  "Login"
                )}
              </button>
            </form>

            <p className="text-center text-sm text-white/80 mt-6">
             {` Don't`} have an account?{" "}
              <button
                onClick={() => router.push("/Signup")}
                className="text-yellow-400 font-bold hover:text-yellow-300 transition-colors"
              >
                Sign up
              </button>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default dynamic(() => Promise.resolve(LoginPage), { ssr: false });