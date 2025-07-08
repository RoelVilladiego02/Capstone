import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const PrivateRoute = ({ children, roles = [] }) => {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  // Support multi-role users
  const userRoles = Array.isArray(currentUser.roles) ? currentUser.roles : [currentUser.role];

  if (roles.length && !userRoles.some(role => roles.includes(role))) {
    return <Navigate to="/" />;
  }

  return children;
};

export default PrivateRoute;
