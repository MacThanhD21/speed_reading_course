import React from 'react';
import { useNavigate } from 'react-router-dom';
import Quiz from './Quiz';
import BackButton from './BackButton';

const QuizPage = () => {
  const navigate = useNavigate();
  
  // Get content and reading data from sessionStorage
  const contentData = JSON.parse(sessionStorage.getItem('smartread-content') || 'null');
  const readingData = JSON.parse(sessionStorage.getItem('smartread-reading-data') || 'null');

  const handleFinishQuiz = (data) => {
    // Store quiz data in sessionStorage for results page
    sessionStorage.setItem('smartread-quiz-data', JSON.stringify(data));
    // Quay lại trang Results như ban đầu
    navigate('/smartread/results');
  };

  if (!contentData || !readingData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Không tìm thấy dữ liệu
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
        <BackButton to="/smartread/reading" text="Quay lại đọc bài" />
        <Quiz 
          content={contentData}
          readingData={readingData}
          onFinishQuiz={handleFinishQuiz}
        />
      </div>
    </div>
  );
};

export default QuizPage;
