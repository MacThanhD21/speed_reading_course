import React from 'react';
import { useNavigate } from 'react-router-dom';
import AITestComponent from './AITestComponent';
import BackButton from './BackButton';

const AITestPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <BackButton to="/smartread" text="Về trang chủ SmartRead" />
        <AITestComponent />
      </div>
    </div>
  );
};

export default AITestPage;
