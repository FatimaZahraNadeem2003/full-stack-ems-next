"use client";

import React from 'react';

interface LoadingOverlayProps {
  loading: boolean;
  children: React.ReactNode;
  message?: string;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ 
  loading, 
  children, 
  message = 'Loading...' 
}) => {
  if (!loading) {
    return <>{children}</>;
  }

  return (
    <div className="relative">
      <div className="absolute inset-0 bg-white/5 backdrop-blur-sm rounded-lg z-10 flex items-center justify-center">
        <div className="text-center bg-white/10 px-6 py-4 rounded-xl backdrop-blur-md border border-white/20">
          <div className="relative">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-white/20 border-t-yellow-400 mx-auto mb-3"></div>
          </div>
          
          <p className="text-white text-sm font-medium">{message}</p>
        </div>
      </div>

      <div className="opacity-50 pointer-events-none select-none">
        {children}
      </div>
    </div>
  );
};

export default LoadingOverlay;