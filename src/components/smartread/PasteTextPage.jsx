import React from 'react';
import { useNavigate } from 'react-router-dom';
import PasteText from './PasteText';
import BackButton from './BackButton';

const PasteTextPage = () => {
  const navigate = useNavigate();

  const handleStartReading = (contentData) => {
    // Store content in sessionStorage for reading page
    sessionStorage.setItem('smartread-content', JSON.stringify(contentData));
    navigate('/smartread/reading');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <BackButton to="/smartread" text="Về trang chủ SmartRead" />
        <PasteText 
          onStartReading={handleStartReading}
        />
      </div>
    </div>
  );
};

export default PasteTextPage;
