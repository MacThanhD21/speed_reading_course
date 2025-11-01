import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { NotificationProvider } from './context/NotificationContext'
import Header from './components/Header'
import Hero from './components/Hero'
import PainPoints from './components/PainPoints'
import Solution from './components/Solution'
import Timeline from './components/Timeline'
import Outcomes from './components/Outcomes'
import Pricing from './components/Pricing'
import Testimonials from './components/Testimonials'
import FAQ from './components/FAQ'
import CTA from './components/CTA'
import Footer from './components/Footer'
import SmartReadRouter from './components/smartread/SmartReadRouter'
import Login from './components/auth/Login'
import Register from './components/auth/Register'
import Profile from './components/auth/Profile'
import AdminLogin from './components/admin/AdminLogin'
import AdminLayout from './components/admin/AdminLayout'
import AdminDashboard from './components/admin/AdminDashboard'
import AdminUsers from './components/admin/AdminUsers'
import AdminContacts from './components/admin/AdminContacts'
import AdminSmartRead from './components/admin/AdminSmartRead'
import AdminApiKeys from './components/admin/AdminApiKeys'

// Protected Route component for admin
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  
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
  
  if (!isAuthenticated() || !isAdmin()) {
    return <Navigate to="/admin/login" replace />;
  }
  
  return children;
};

// Protected Route for authenticated users
const AuthProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

function HomePage() {
  return (
    <div className="App">
      <Header />
      <main>
        <Hero />
        <PainPoints />
        <Solution />
        <Timeline />
        <Outcomes />
        <Pricing />
        <Testimonials />
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </div>
  )
}

function App() {
  return (
    <NotificationProvider>
      <AuthProvider>
        <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/smartread/*" element={<SmartReadRouter />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={
            <AuthProtectedRoute>
              <Profile />
            </AuthProtectedRoute>
          } />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="contacts" element={<AdminContacts />} />
          <Route path="smartread" element={<AdminSmartRead />} />
          <Route path="api-keys" element={<AdminApiKeys />} />
          </Route>
        </Routes>
      </Router>
      </AuthProvider>
    </NotificationProvider>
  )
}

export default App
