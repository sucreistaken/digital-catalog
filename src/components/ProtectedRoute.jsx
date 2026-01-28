import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, requiredRole = null }) => {
    const { isAuthenticated, loading, user } = useAuth();
    const location = useLocation();

    // DEVELOPMENT MODE: Auth bypass enabled
    // TODO: Remove this bypass before production
    const AUTH_BYPASS = true;

    if (AUTH_BYPASS) {
        return children;
    }

    // Show loading while checking auth
    if (loading) {
        return (
            <div className="auth-loading">
                <div className="loading-spinner"></div>
                <p>Yükleniyor...</p>
            </div>
        );
    }

    // Not authenticated, redirect to login
    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Check role if required
    if (requiredRole && user?.role !== requiredRole) {
        // User doesn't have required role
        return <Navigate to="/admin/dashboard" replace />;
    }

    return children;
};

export default ProtectedRoute;
