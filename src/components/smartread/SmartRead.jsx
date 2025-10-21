import React, { useState } from 'react';
import SimpleSmartReadHome from './SimpleSmartReadHome';
import PasteText from './PasteText';
import ReadingMode from './ReadingMode';
import Quiz from './Quiz';
import Results from './Results';
import SmartReadDemo from './SmartReadDemo';
import AITestComponent from './AITestComponent';
import GeminiTestComponent from './GeminiTestComponent';
import EnvDebugComponent from './EnvDebugComponent';

const SmartRead = () => {
  const [currentScreen, setCurrentScreen] = useState('home');
  const [content, setContent] = useState(null);
  const [readingData, setReadingData] = useState(null);
  const [quizData, setQuizData] = useState(null);

  const navigateTo = (screen) => {
    setCurrentScreen(screen);
  };

  const handleStartReading = (contentData) => {
    setContent(contentData);
    setCurrentScreen('reading');
  };

  const handleFinishReading = (data) => {
    setReadingData(data);
    setCurrentScreen('quiz');
  };

  const handleFinishQuiz = (data) => {
    setQuizData(data);
    setCurrentScreen('results');
  };

  const handleRestart = () => {
    setContent(null);
    setReadingData(null);
    setQuizData(null);
    setCurrentScreen('paste-text');
  };

  const handleGoHome = () => {
    setContent(null);
    setReadingData(null);
    setQuizData(null);
    setCurrentScreen('home');
  };

  const renderCurrentScreen = () => {
    switch (currentScreen) {
      case 'home':
        return <SimpleSmartReadHome onNavigate={navigateTo} />;
              case 'demo':
                return <SmartReadDemo />;
              case 'ai-test':
                return <AITestComponent />;
              case 'gemini-test':
                return <GeminiTestComponent />;
              case 'env-debug':
                return <EnvDebugComponent />;
      case 'paste-text':
      case 'paste-url':
      case 'upload-file':
        return (
          <PasteText 
            onNavigate={navigateTo} 
            onStartReading={handleStartReading}
          />
        );
      case 'reading':
        return (
          <ReadingMode 
            content={content} 
            onFinishReading={handleFinishReading}
          />
        );
      case 'quiz':
        return (
          <Quiz 
            content={content}
            readingData={readingData}
            onFinishQuiz={handleFinishQuiz}
          />
        );
      case 'results':
        return (
          <Results 
            readingData={readingData}
            quizData={quizData}
            onRestart={handleRestart}
            onGoHome={handleGoHome}
          />
        );
      case 'history':
        return (
          <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Lịch sử đọc
              </h2>
              <p className="text-gray-600 mb-6">
                Tính năng này sẽ được phát triển trong phiên bản tiếp theo.
              </p>
              <button
                onClick={() => navigateTo('home')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                Về trang chủ
              </button>
            </div>
          </div>
        );
      case 'settings':
        return (
          <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Cài đặt
              </h2>
              <p className="text-gray-600 mb-6">
                Tính năng này sẽ được phát triển trong phiên bản tiếp theo.
              </p>
              <button
                onClick={() => navigateTo('home')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                Về trang chủ
              </button>
            </div>
          </div>
        );
      default:
        return <SimpleSmartReadHome onNavigate={navigateTo} />;
    }
  };

  return (
    <div className="SmartRead">
      {renderCurrentScreen()}
    </div>
  );
};

export default SmartRead;
