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
      <section className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900">
        {/* Animated background particles */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-white/10 animate-float"
              style={{
                width: `${Math.random() * 300 + 50}px`,
                height: `${Math.random() * 300 + 50}px`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${Math.random() * 10 + 10}s`,
              }}
            />
          ))}
        </div>
        
        <div className="relative z-10 glass-card rounded-2xl w-full max-w-md p-6 md:p-8 text-center backdrop-blur-xl bg-white/5 border border-white/10 shadow-2xl animate-pulse-slow">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 blur-xl animate-pulse"></div>
            <div className="relative animate-spin rounded-full h-16 w-16 border-4 border-t-indigo-500 border-r-purple-500 border-b-pink-500 border-l-transparent mx-auto"></div>
          </div>
          <p className="mt-6 text-gray-300 font-medium animate-pulse">Initializing secure connection...</p>
          <div className="mt-4 flex justify-center gap-2">
            <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: "0s" }}></div>
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
            <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
          </div>
        </div>
      </section>
    );
  }

  if (isAuthenticated() && user) {
    return (
      <section className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900">
        {/* Animated background */}
        <div className="absolute inset-0">
          <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>
        
        <div className="relative z-10 glass-card rounded-2xl w-full max-w-md p-6 md:p-8 text-center backdrop-blur-xl bg-white/5 border border-white/10 shadow-2xl">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 blur-xl animate-pulse"></div>
            <div className="relative animate-spin rounded-full h-16 w-16 border-4 border-t-indigo-500 border-r-purple-500 border-b-pink-500 border-l-transparent mx-auto"></div>
          </div>
          <p className="mt-6 text-gray-300 font-medium">Redirecting to dashboard</p>
          <div className="mt-6 h-2 w-full bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full animate-progress"></div>
          </div>
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

      toast.success("Login successful! Welcome back", {
        icon: "🎉",
        style: {
          borderRadius: "10px",
          background: "#333",
          color: "#fff",
        },
      });

      router.push(
        form.role === "admin"
          ? "/Admin/dashboard"
          : form.role === "teacher"
            ? "/teacher/dashboard"
            : "/student/dashboard",
      );
    } catch (err: any) {
      toast.error(err || "Failed to login! Try again.", {
        icon: "❌",
        style: {
          borderRadius: "10px",
          background: "#333",
          color: "#fff",
        },
      });
    }
  };

  return (
    <section className="min-h-screen flex items-center justify-center px-4 py-8 relative overflow-hidden bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        {/* Floating orbs */}
        <div className="absolute top-20 left-10 w-64 h-64 bg-purple-500/30 rounded-full filter blur-3xl animate-float-slow"></div>
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-indigo-500/30 rounded-full filter blur-3xl animate-float-slower"></div>
        <div className="absolute top-40 right-40 w-48 h-48 bg-pink-500/30 rounded-full filter blur-3xl animate-pulse-slow"></div>
        
        {/* Grid overlay - FIXED SVG SYNTAX */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMCAwaDYwdjYwSDB6IiBmaWxsPSJub25lIiBzdHJva2U9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiIHN0cm9rZS13aWR0aD0iMC41Ii8+PC9zdmc+')] opacity-20"></div>
        
        {/* Animated particles */}
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white/10 animate-particle"
            style={{
              width: `${Math.random() * 4 + 1}px`,
              height: `${Math.random() * 4 + 1}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 10}s`,
              animationDuration: `${Math.random() * 10 + 10}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 w-full max-w-md perspective">
        <div className="relative animate-float-in">
          {/* Decorative rings */}
          <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl blur-xl opacity-75 animate-pulse-slow"></div>
          <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl opacity-75 animate-gradient"></div>
          
          <div className="relative glass-card rounded-2xl w-full p-4 sm:p-6 md:p-8 backdrop-blur-xl bg-white/5 border border-white/10 shadow-2xl hover:border-white/20 transition-all duration-500">
            {/* Header section with animation */}
            <div className="text-center mb-6 sm:mb-8">
              <div className="inline-block animate-bounce-slow">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 p-[2px] animate-spin-slow">
                  <div className="w-full h-full rounded-full bg-gray-900 flex items-center justify-center">
                    <svg className="w-8 h-8 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                </div>
              </div>
              
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">
                <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-gradient-x">
                  Login to Education System
                </span>
              </h1>
              <p className="text-gray-400 mt-2 text-sm sm:text-base animate-fade-in-up">
                Welcome back! Ready to continue your journey?
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
              {/* Email field with animation */}
              <div className="group animate-slide-in" style={{ animationDelay: "0.1s" }}>
                <label className="text-xs sm:text-sm text-gray-400 group-focus-within:text-indigo-400 transition-colors duration-300">
                  Email Address
                </label>
                <div className="relative mt-1">
                  <input
                    type="email"
                    name="email"
                    required
                    value={form.email}
                    onChange={handleChange}
                    className="w-full px-3 py-2 sm:px-4 sm:py-2 md:py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 transition-all duration-300 hover:border-white/20 text-sm sm:text-base"
                    placeholder="email@example.com"
                  />
                  <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 opacity-0 group-focus-within:opacity-10 transition-opacity duration-300 pointer-events-none"></div>
                </div>
              </div>

              {/* Password field with animation */}
              <div className="group animate-slide-in" style={{ animationDelay: "0.2s" }}>
                <label className="text-xs sm:text-sm text-gray-400 group-focus-within:text-indigo-400 transition-colors duration-300">
                  Password
                </label>
                <div className="relative mt-1">
                  <input
                    type="password"
                    name="password"
                    required
                    value={form.password}
                    onChange={handleChange}
                    className="w-full px-3 py-2 sm:px-4 sm:py-2 md:py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 transition-all duration-300 hover:border-white/20 text-sm sm:text-base"
                    placeholder="••••••••"
                  />
                  <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 opacity-0 group-focus-within:opacity-10 transition-opacity duration-300 pointer-events-none"></div>
                </div>
              </div>

              {/* Role select with animation */}
              <div className="group animate-slide-in" style={{ animationDelay: "0.3s" }}>
                <label className="text-xs sm:text-sm text-gray-400 group-focus-within:text-indigo-400 transition-colors duration-300">
                  Select Role Class
                </label>
                <div className="relative mt-1">
                  <select
                    name="role"
                    value={form.role}
                    onChange={handleChange}
                    className="w-full px-3 py-2 sm:px-4 sm:py-2 md:py-3 rounded-lg bg-white/5 border border-white/10 text-white appearance-none cursor-pointer focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 transition-all duration-300 hover:border-white/20 text-sm sm:text-base"
                  >
                    <option value="student" className="bg-gray-900">Student</option>
                    <option value="teacher" className="bg-gray-900">Teacher</option>
                    <option value="admin" className="bg-gray-900">Admin</option>
                  </select>
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Submit button with animation */}
              <div className="animate-slide-in" style={{ animationDelay: "0.4s" }}>
                <button
                  type="submit"
                  disabled={loginLoading}
                  className="relative w-full group overflow-hidden rounded-lg p-[2px] focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 animate-gradient-x"></div>
                  <div className="relative px-6 py-2 sm:py-2 md:py-3 bg-gray-900 rounded-lg group-hover:bg-opacity-90 transition-all duration-300">
                    {loginLoading ? (
                      <span className="flex items-center justify-center gap-2 text-white text-sm sm:text-base">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        Logging in...
                      </span>
                    ) : (
                      <span className="text-white text-sm sm:text-base font-semibold group-hover:tracking-wider transition-all duration-300">
                        Login
                      </span>
                    )}
                  </div>
                </button>
              </div>
            </form>

            {/* Signup link with animation */}
            <p className="text-center text-sm text-gray-400 mt-6 animate-fade-in-up" style={{ animationDelay: "0.5s" }}>
              New to the website?{" "}
              <span
                onClick={() => router.push("/Signup")}
                className="relative inline-block text-indigo-400 font-medium cursor-pointer group"
              >
                <span className="relative z-10 group-hover:text-indigo-300 transition-colors duration-300">
                  Create Account
                </span>
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-indigo-400 to-purple-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
              </span>
            </p>

            {/* Decorative elements */}
            <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full blur-xl opacity-30 animate-pulse-slow"></div>
            <div className="absolute -top-4 -left-4 w-20 h-20 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full blur-xl opacity-30 animate-pulse-slow animation-delay-2000"></div>
          </div>
        </div>
      </div>

      {/* FIXED: Added closing section tag and moved styles inside section */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-30px) scale(1.1); }
        }
        
        @keyframes float-slower {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(30px) scale(0.9); }
        }
        
        @keyframes blob {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        @keyframes progress {
          0% { width: 0%; }
          50% { width: 70%; }
          100% { width: 100%; }
        }
        
        @keyframes particle {
          0% { transform: translateY(0px) translateX(0px); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(-100vh) translateX(100px); opacity: 0; }
        }
        
        @keyframes float-in {
          0% { opacity: 0; transform: translateY(50px) scale(0.9); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        
        @keyframes slide-in {
          0% { opacity: 0; transform: translateX(-30px); }
          100% { opacity: 1; transform: translateX(0); }
        }
        
        @keyframes fade-in-up {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        
        .animate-float {
          animation: float 8s ease-in-out infinite;
        }
        
        .animate-float-slow {
          animation: float-slow 12s ease-in-out infinite;
        }
        
        .animate-float-slower {
          animation: float-slower 15s ease-in-out infinite;
        }
        
        .animate-blob {
          animation: blob 7s infinite;
        }
        
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
        
        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
        
        .animate-progress {
          animation: progress 2s ease-in-out infinite;
        }
        
        .animate-particle {
          animation: particle 15s linear infinite;
        }
        
        .animate-float-in {
          animation: float-in 0.8s ease-out forwards;
        }
        
        .animate-slide-in {
          opacity: 0;
          animation: slide-in 0.5s ease-out forwards;
        }
        
        .animate-fade-in-up {
          opacity: 0;
          animation: fade-in-up 0.5s ease-out forwards;
        }
        
        .animate-pulse-slow {
          animation: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        
        .animate-bounce-slow {
          animation: bounce 3s infinite;
        }
        
        .animate-spin-slow {
          animation: spin 8s linear infinite;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        
        .perspective {
          perspective: 1000px;
        }
      `}</style>
    </section>
  );
}