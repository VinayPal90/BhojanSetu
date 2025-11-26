// frontend/src/components/ProtectedRoute.jsx

import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';

// Component jo check karega ki user login hai ya nahi, aur uska role sahi hai ya nahi
const ProtectedRoute = ({ children, requiredRoles }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');

    if (token && user) {
      const userData = JSON.parse(user);
      setUserRole(userData.role);

      // Check karein ki user ka role requiredRoles mein hai ya nahi
      if (requiredRoles && !requiredRoles.includes(userData.role)) {
         // Agar role match nahi hota, to access deny karo
         alert(`Access Denied. You must be a ${requiredRoles.join(' or ')}.`);
         setIsAuthenticated(false);
      } else {
         setIsAuthenticated(true);
      }
    } else {
      setIsAuthenticated(false);
    }
    setLoading(false);
  }, [requiredRoles]);

  if (loading) {
    return <div className="text-center mt-20 text-lg">Loading access...</div>; 
  }

  // Agar authenticated nahi hai, to login page par bhej do
  if (!isAuthenticated) {
    alert("Please login to access the dashboard.");
    return <Navigate to="/login" replace />;
  }
  
  // Agar authenticated aur authorized hai, to children (Dashboard) dikhao
  return children;
};

export default ProtectedRoute;