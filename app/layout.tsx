import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "../context/AuthContext";
import { Toaster } from "react-hot-toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Education Management System",
  description: "A comprehensive platform for managing students, teachers, and courses",
};

export const viewport = {
  width: 'device-width',
  initialScale: 1.0,
  maximumScale: 5.0,
  userScalable: true,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased relative min-h-screen`}
      >
        <div className="fixed inset-0 bg-gradient-to-br from-sky-400 via-blue-400 to-indigo-500 -z-20"></div>
        
        <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
          <div className="absolute top-20 left-10 w-64 h-64 bg-yellow-300/20 rounded-full filter blur-3xl animate-float-slow"></div>
          <div className="absolute bottom-20 right-10 w-80 h-80 bg-pink-300/20 rounded-full filter blur-3xl animate-float-slower"></div>
          <div className="absolute top-40 right-40 w-48 h-48 bg-purple-300/20 rounded-full filter blur-3xl animate-pulse-slow"></div>
          <div className="absolute bottom-40 left-20 w-56 h-56 bg-orange-300/20 rounded-full filter blur-3xl animate-float"></div>
        </div>

        <div className="relative z-10">
          <AuthProvider>
            {children}
            <Toaster
              position="top-center"
              toastOptions={{
                duration: 4000,
                style: {
                  background: "rgba(255, 255, 255, 0.95)",
                  color: "#1f2937",
                  border: "1px solid rgba(255, 255, 255, 0.5)",
                  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
                  backdropFilter: "blur(8px)",
                  borderRadius: "12px",
                  fontWeight: "500",
                },
                success: {
                  duration: 3000,
                  style: {
                    background: "rgba(34, 197, 94, 0.95)",
                    color: "#ffffff",
                    border: "1px solid rgba(255, 255, 255, 0.3)",
                  },
                  iconTheme: {
                    primary: '#ffffff',
                    secondary: '#22c55e',
                  },
                },
                error: {
                  duration: 5000,
                  style: {
                    background: "rgba(239, 68, 68, 0.95)",
                    color: "#ffffff",
                    border: "1px solid rgba(255, 255, 255, 0.3)",
                  },
                  iconTheme: {
                    primary: '#ffffff',
                    secondary: '#ef4444',
                  },
                },
              }}
            />
          </AuthProvider>
        </div>
      </body>
    </html>
  );
}