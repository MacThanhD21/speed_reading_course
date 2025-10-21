import React from 'react';
import { useNavigate } from 'react-router-dom';
import GeminiTestComponent from './GeminiTestComponent';
import BackButton from './BackButton';

const GeminiTestPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <BackButton to="/smartread" text="Về trang chủ SmartRead" />
        <GeminiTestComponent />
      </div>
    </div>
  );
};

export default GeminiTestPage;
