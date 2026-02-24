import React from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    // Redirect to auth page
    window.location.href = '/auth';
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
