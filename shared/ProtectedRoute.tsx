'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  redirectPath?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  allowedRoles = ['admin', 'teacher', 'student'],
  redirectPath = '/' 
}) => {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated()) {
        router.push(redirectPath);
        return;
      }

      if (allowedRoles && user && !allowedRoles.includes(user.role)) {
        router.push(redirectPath);
        return;
      }
    }
  }, [loading, isAuthenticated, user, allowedRoles, redirectPath, router]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!isAuthenticated() || (user && allowedRoles && !allowedRoles.includes(user.role))) {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;