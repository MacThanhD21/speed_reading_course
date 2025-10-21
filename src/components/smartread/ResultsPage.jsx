import React from 'react';
import { useNavigate } from 'react-router-dom';
import Results from './Results';
import BackButton from './BackButton';

const ResultsPage = () => {
  const navigate = useNavigate();
  
  // Get all data from sessionStorage
  const readingData = JSON.parse(sessionStorage.getItem('smartread-reading-data') || 'null');
  const quizData = JSON.parse(sessionStorage.getItem('smartread-quiz-data') || 'null');

  console.log('ResultsPage - readingData:', readingData);
  console.log('ResultsPage - quizData:', quizData);

  const handleRestart = () => {
    // Clear all sessionStorage data
    sessionStorage.removeItem('smartread-content');
    sessionStorage.removeItem('smartread-reading-data');
    sessionStorage.removeItem('smartread-quiz-data');
    navigate('/smartread/paste-text');
  };

  const handleGoHome = () => {
    // Clear all sessionStorage data
    sessionStorage.removeItem('smartread-content');
    sessionStorage.removeItem('smartread-reading-data');
    sessionStorage.removeItem('smartread-quiz-data');
    navigate('/smartread');
  };

  if (!readingData || !quizData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Không tìm thấy kết quả
          </h2>
          <p className="text-gray-600 mb-6">
            Vui lòng quay lại và hoàn thành các bước trước đó.
          </p>
          <BackButton to="/smartread" text="Về trang chủ SmartRead" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <BackButton to="/smartread/quiz" text="Quay lại quiz" />
        <Results 
          readingData={readingData}
          quizData={quizData}
          onRestart={handleRestart}
          onGoHome={handleGoHome}
        />
      </div>
    </div>
  );
};

export default ResultsPage;
