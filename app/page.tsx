"use client";
import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";

type LoginForm = {
  email: string;
  password: string;
  role: "admin" | "teacher" | "student";
};

export default function LoginPage() {
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

  useEffect(() => {
    if (isAuthenticated() && user) {
      router.push(
        user.role === "admin"
          ? "/Admin/dashboard"
          : user.role === "teacher"
            ? "/Teacher/dashboard"
            : "/Student/dashboard",
      );
    }
  }, [isAuthenticated, user, router]);

  if (authLoading) {
    return (
      <section className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
        <div className="glass-card rounded-2xl w-full max-w-md p-6 md:p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-300">Checking authentication...</p>
        </div>
      </section>
    );
  }

  if (isAuthenticated() && user) {
    return (
      <section className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
        <div className="glass-card rounded-2xl w-full max-w-md p-6 md:p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-300">Redirecting...</p>
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

    try {
      await login(form.email, form.password, form.role);

      toast.success("Login successful! Welcome back");

      router.push(
        form.role === "admin"
          ? "/Admin/dashboard"
          : form.role === "teacher"
            ? "/teacher/dashboard"
            : "/student/dashboard",
      );
    } catch (err: any) {
      toast.error(err || "Failed to login! Try again.");
    }
  };

  return (
    <section className="min-h-screen flex items-center justify-center px-4 py-8 relative overflow-hidden">
      <div className="glass-card rounded-2xl w-full max-w-md p-4 sm:p-6 md:p-8 animate-fade-in">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold neon-text">
            Login to Education Management System
          </h1>
          <p className="text-gray-400 mt-2 text-sm sm:text-base">
            Welcome back
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
          <div>
            <label className="text-xs sm:text-sm text-gray-400">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              required
              value={form.email}
              onChange={handleChange}
              className="w-full mt-1 px-3 py-2 sm:px-4 sm:py-2 md:py-3 rounded-lg gaming-input text-sm sm:text-base"
              placeholder="email@example.com"
            />
          </div>

          <div>
            <label className="text-xs sm:text-sm text-gray-400">Password</label>
            <input
              type="password"
              name="password"
              required
              value={form.password}
              onChange={handleChange}
              className="w-full mt-1 px-3 py-2 sm:px-4 sm:py-2 md:py-3 rounded-lg gaming-input text-sm sm:text-base"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label className="text-xs sm:text-sm text-gray-400">
              Select Role Class
            </label>
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              className="w-full mt-1 px-3 py-2 sm:px-4 sm:py-2 md:py-3 rounded-lg gaming-input text-sm sm:text-base"
            >
              <option value="student">student</option>
              <option value="teacher">teacher</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loginLoading}
            className="w-full gaming-btn text-white py-2 sm:py-2 md:py-3 rounded-lg font-semibold disabled:opacity-50 transition-all text-sm sm:text-base"
          >
            {loginLoading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Logging in...
              </span>
            ) : (
              "Login"
            )}
          </button>
        </form>

        <p className="text-center text-sm text-gray-400 mt-6">
          New to the website?{" "}
          <span
            onClick={() => router.push("/Signup")}
            className="text-indigo-400 font-medium cursor-pointer hover:text-indigo-300 transition-colors"
          >
            Create Account
          </span>
        </p>
      </div>
    </section>
  );
}
