import React from 'react';
import { useNavigate } from 'react-router-dom';
import ReadingMode from './ReadingMode';
import BackButton from './BackButton';

const ReadingPage = () => {
  const navigate = useNavigate();
  
  // Get content from sessionStorage
  const contentData = JSON.parse(sessionStorage.getItem('smartread-content') || 'null');

  const handleFinishReading = (data) => {
    // Store reading data in sessionStorage
    sessionStorage.setItem('smartread-reading-data', JSON.stringify(data));
    // Popup is now handled by ReadingCompletionPopup component
    console.log('Reading completed:', data);
  };

  if (!contentData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Không tìm thấy nội dung
          </h2>
          <p className="text-gray-600 mb-6">
            Vui lòng quay lại và nhập nội dung trước khi đọc.
          </p>
          <BackButton to="/smartread/paste-text" text="Quay lại nhập nội dung" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto py-8">
        <BackButton to="/smartread/paste-text" text="Quay lại nhập nội dung" />
        <ReadingMode 
          content={contentData} 
          onFinishReading={handleFinishReading}
        />
      </div>
    </div>
  );
};

export default ReadingPage;
