"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";
import { Eye, EyeOff, Mail, User, Lock, GraduationCap, UserCircle } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const { register, user, loading, isAuthenticated } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    role: "student",
  });

  const particles = useMemo(() => {
    return [...Array(40)].map((_, i) => ({
      id: i,
      width: Math.random() * 6 + 2,
      height: Math.random() * 6 + 2,
      left: Math.random() * 100,
      top: Math.random() * 100,
      delay: Math.random() * 10,
      duration: Math.random() * 10 + 10,
    }));
  }, []);

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

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    try {
      await register(
        form.firstName,
        form.lastName,
        form.email,
        form.password,
        form.role,
      );

      toast.success("Account created successfully!", {
        icon: "🎉",
        style: {
          borderRadius: "10px",
          background: "#fff",
          color: "#333",
        },
      });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create account!";
      toast.error(errorMessage, {
        icon: "❌",
        style: {
          borderRadius: "10px",
          background: "#fff",
          color: "#333",
        },
      });
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-400 via-blue-400 to-indigo-500 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-64 h-64 bg-yellow-300/40 rounded-full filter blur-3xl animate-float-slow"></div>
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-pink-300/40 rounded-full filter blur-3xl animate-float-slower"></div>
        <div className="absolute top-40 right-40 w-48 h-48 bg-purple-300/40 rounded-full filter blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-40 left-20 w-56 h-56 bg-orange-300/40 rounded-full filter blur-3xl animate-float"></div>
        
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMCAwaDYwdjYwSDB6IiBmaWxsPSJub25lIiBzdHJva2U9InJnYmEoMjU1LDI1NSwyNTUsMC4yKSIgc3Ryb2tlLXdpZHRoPSIwLjUiLz48L3N2Zz4=')] opacity-30"></div>
        
        {/* Animated particles - Using stable values from useMemo */}
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute rounded-full bg-white/40 animate-particle"
            style={{
              width: `${particle.width}px`,
              height: `${particle.height}px`,
              left: `${particle.left}%`,
              top: `${particle.top}%`,
              animationDelay: `${particle.delay}s`,
              animationDuration: `${particle.duration}s`,
            }}
          />
        ))}
      </div>

      {/* Main card */}
      <div className="relative w-full max-w-md perspective">
        {/* Decorative rings */}
        <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-400 rounded-2xl blur-xl opacity-60 animate-pulse-slow"></div>
        <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-400 rounded-2xl opacity-70 animate-gradient"></div>
        
        <div className="relative bg-white/30 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-white/50 hover:border-white/70 transition-all duration-500">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-block animate-bounce-slow">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-yellow-400 to-orange-400 p-[2px] animate-spin-slow">
                <div className="w-full h-full rounded-full bg-white/90 flex items-center justify-center">
                  <GraduationCap className="w-8 h-8 text-orange-500" />
                </div>
              </div>
            </div>
            <h1 className="text-3xl font-bold mb-2">
              <span className="bg-gradient-to-r from-yellow-600 via-orange-600 to-pink-600 bg-clip-text text-transparent animate-gradient-x">
                Create Account
              </span>
            </h1>
            <p className="text-white/80">Join our learning community</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name fields */}
            <div className="grid grid-cols-2 gap-4">
              <div className="animate-slide-in" style={{ animationDelay: "0.1s" }}>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  First Name
                </label>
                <div className="relative group">
                  <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/60 group-focus-within:text-yellow-600 transition-colors" />
                  <input
                    type="text"
                    name="firstName"
                    value={form.firstName}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-3 bg-white/20 border border-white/30 rounded-lg text-gray-800 placeholder-white/50 focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/50 transition-all duration-300 hover:bg-white/30"
                    placeholder="John"
                  />
                </div>
              </div>

              <div className="animate-slide-in" style={{ animationDelay: "0.2s" }}>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Last Name
                </label>
                <div className="relative group">
                  <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/60 group-focus-within:text-yellow-600 transition-colors" />
                  <input
                    type="text"
                    name="lastName"
                    value={form.lastName}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-3 bg-white/20 border border-white/30 rounded-lg text-gray-800 placeholder-white/50 focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/50 transition-all duration-300 hover:bg-white/30"
                    placeholder="Doe"
                  />
                </div>
              </div>
            </div>

            {/* Email field */}
            <div className="animate-slide-in" style={{ animationDelay: "0.3s" }}>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Email Address
              </label>
              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/60 group-focus-within:text-yellow-600 transition-colors" />
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-white/20 border border-white/30 rounded-lg text-gray-800 placeholder-white/50 focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/50 transition-all duration-300 hover:bg-white/30"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            {/* Password field */}
            <div className="animate-slide-in" style={{ animationDelay: "0.4s" }}>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Password
              </label>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/60 group-focus-within:text-yellow-600 transition-colors" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                  className="w-full pl-10 pr-12 py-3 bg-white/20 border border-white/30 rounded-lg text-gray-800 placeholder-white/50 focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/50 transition-all duration-300 hover:bg-white/30"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-yellow-600 transition"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <p className="mt-1 text-xs text-white/60">Minimum 6 characters</p>
            </div>

            {/* Role selection */}
            <div className="animate-slide-in" style={{ animationDelay: "0.5s" }}>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Select Your Role
              </label>
              <div className="relative group">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/60 group-focus-within:text-yellow-600 transition-colors z-10" />
                <select
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-white/20 border border-white/30 rounded-lg text-gray-800 appearance-none cursor-pointer focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/50 transition-all duration-300 hover:bg-white/30"
                >
                  <option value="student" className="bg-white text-gray-800">🎓 Student</option>
                  <option value="teacher" className="bg-white text-gray-800">👨‍🏫 Teacher</option>
                  <option value="admin" className="bg-white text-gray-800">⚙️ Admin</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg className="w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Role description */}
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 border border-white/30 animate-fade-in-up" style={{ animationDelay: "0.6s" }}>
              <p className="text-sm text-gray-800">
                {form.role === "student" && "🎓 Access courses, track progress, and learn at your own pace"}
                {form.role === "teacher" && "👨‍🏫 Create courses, manage students, and share your knowledge"}
                {form.role === "admin" && "⚙️ Full platform access, user management, and system settings"}
              </p>
            </div>

            {/* Submit button */}
            <div className="animate-slide-in" style={{ animationDelay: "0.7s" }}>
              <button
                type="submit"
                disabled={loading}
                className="relative w-full group overflow-hidden rounded-lg p-[2px] focus:outline-none focus:ring-2 focus:ring-yellow-400/50"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-400 animate-gradient-x"></div>
                <div className="relative px-6 py-3 bg-white rounded-lg group-hover:bg-opacity-90 transition-all duration-300">
                  {loading ? (
                    <span className="flex items-center justify-center text-gray-800">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-orange-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating account...
                    </span>
                  ) : (
                    <span className="text-gray-800 font-semibold group-hover:tracking-wider transition-all duration-300">
                      Create Account
                    </span>
                  )}
                </div>
              </button>
            </div>
          </form>

          {/* Footer */}
          <p className="text-center text-sm text-white/80 mt-6 animate-fade-in-up" style={{ animationDelay: "0.8s" }}>
            Already have an account?{" "}
            <button
              onClick={() => router.push("/")}
              className="relative inline-block text-yellow-600 font-medium group"
            >
              <span className="relative z-10 group-hover:text-orange-600 transition-colors duration-300">
                Sign in
              </span>
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-yellow-400 to-orange-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
            </button>
          </p>
        </div>
      </div>

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
        
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
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
        
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
        
        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
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
        
        .perspective {
          perspective: 1000px;
        }
      `}</style>
    </div>
  );
}