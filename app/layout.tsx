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
  title: "MVEP - Marketplace",
  description:
    "Level up your shopping experience with our multi-vendor marketplace",
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
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased relative`}
      >
        <div className="fixed inset-0 pointer-events-none -z-10"></div>
        <div className="relative z-10">
          <AuthProvider>
              {children}
              <Toaster
                position="top-center"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: "#1a1f2e",
                    color: "#fff",
                    border: "1px solid #6366f1",
                    boxShadow: "0 0 20px rgba(99, 102, 241, 0.3)",
                  },
                  success: {
                    duration: 3000,
                    style: {
                      background: "#10B981",
                      border: "1px solid #34d399",
                    },
                  },
                  error: {
                    duration: 5000,
                    style: {
                      background: "#EF4444",
                      border: "1px solid #f87171",
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
