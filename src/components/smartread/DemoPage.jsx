import React from 'react';
import { useNavigate } from 'react-router-dom';
import SmartReadDemo from './SmartReadDemo';
import BackButton from './BackButton';

const DemoPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <BackButton to="/smartread" text="Về trang chủ SmartRead" />
        <SmartReadDemo />
      </div>
    </div>
  );
};

export default DemoPage;
