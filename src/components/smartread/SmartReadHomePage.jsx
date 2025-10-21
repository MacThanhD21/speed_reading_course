import React from 'react';
import { useNavigate } from 'react-router-dom';
import SimpleSmartReadHome from './SimpleSmartReadHome';
import BackButton from './BackButton';

const SmartReadHomePage = () => {
  const navigate = useNavigate();

  const handleNavigate = (screen) => {
    navigate(`/smartread/${screen}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <BackButton to="/" text="Về trang chủ" />
        <SimpleSmartReadHome onNavigate={handleNavigate} />
      </div>
    </div>
  );
};

export default SmartReadHomePage;
