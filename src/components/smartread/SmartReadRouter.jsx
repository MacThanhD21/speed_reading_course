import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import SmartReadHomePage from './SmartReadHomePage';
import PasteTextPage from './PasteTextPage';
import ReadingPage from './ReadingPage';

// Protected Route for SmartRead
const SmartReadProtected = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  // Wait for auth to load before checking
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }
  
  if (!isAuthenticated()) {
    return <Navigate to="/login?redirect=/smartread" replace />;
  }
  
  return children;
};

const SmartReadRouter = () => {
  return (
    <Routes>
      <Route path="/" element={
        <SmartReadProtected>
          <SmartReadHomePage />
        </SmartReadProtected>
      } />
      <Route path="/paste-text" element={
        <SmartReadProtected>
          <PasteTextPage />
        </SmartReadProtected>
      } />
      <Route path="/reading" element={
        <SmartReadProtected>
          <ReadingPage />
        </SmartReadProtected>
      } />
      <Route path="*" element={<Navigate to="/smartread" replace />} />
    </Routes>
  );
};

export default SmartReadRouter;
