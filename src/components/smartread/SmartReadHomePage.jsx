import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import SimpleSmartReadHome from './SimpleSmartReadHome';

const SmartReadHomePage = () => {
  const navigate = useNavigate();

  const handleNavigate = (screen) => {
    navigate(`/smartread/${screen}`);
  };

  return (
    <div className="min-h-screen">
      {/* Subtle back button */}
      <div className="container mx-auto px-4 pt-6">
        <Link 
          to="/"
          className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium mb-4"
        >
          <FaArrowLeft className="mr-2" />
          Về trang chủ
        </Link>
      </div>
      <SimpleSmartReadHome onNavigate={handleNavigate} />
    </div>
  );
};

export default SmartReadHomePage;
