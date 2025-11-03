import React, { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LearningPanel from './LearningPanel';
import ReadingHeader from './ReadingHeader';
import ReadingSettingsPanel from './ReadingSettingsPanel';
import ReadingContent from './ReadingContent';
import ReadingCompletionPopup from './ReadingCompletionPopup';
import QuizPanel from './QuizPanel';
import { useReadingState, useReadingSettings } from '../../hooks/useReadingMode';
import readingTipsService from '../../services/readingTipsService';
import apiService from '../../services/apiService';

const ReadingMode = React.memo(({ content, onFinishReading }) => {
  const navigate = useNavigate();
  const contentRef = useRef(null);
  
  // Custom hooks
  const readingState = useReadingState(content);
  const readingSettings = useReadingSettings();
  
  // Local state
  const [showLearningPanel, setShowLearningPanel] = useState(false);
  const [showSettingsPanel, setShowSettingsPanel] = useState(false);
  const [showCompletionPopup, setShowCompletionPopup] = useState(false);
  const [showQuizPanel, setShowQuizPanel] = useState(false);
  const [completionData, setCompletionData] = useState(null);
  const [fiveWOneHQuestions, setFiveWOneHQuestions] = useState([]);
  const [isLoading5W1H, setIsLoading5W1H] = useState(false);
  const [readingSessionId, setReadingSessionId] = useState(null);
  // Track start time when reading starts
  const readingStartTimeRef = useRef(null);

  // Load 5W1H questions for learning panel
  const load5W1HQuestions = useCallback(async () => {
    if (!content) return;
    
    setIsLoading5W1H(true);
    try {
      const questions = await readingTipsService.generate5W1HQuestions(content);
      setFiveWOneHQuestions(questions);
      
    } catch (error) {
      console.error('Error loading 5W1H questions:', error);
      
      // Show user-friendly message for different error types
      if (error.message && error.message.includes('429')) {
        console.warn('Gemini API quota exceeded. Using fallback questions.');
      } else if (error.message && error.message.includes('503')) {
        console.warn('Gemini API server overloaded. Using fallback questions.');
      } else if (error.message && error.message.includes('All API keys failed')) {
        console.warn('All API keys exhausted. Using fallback questions.');
      }
    } finally {
      setIsLoading5W1H(false);
    }
  }, [content]);


  // Load 5W1H questions when content is available
  useEffect(() => {
    if (content && fiveWOneHQuestions.length === 0) {
      load5W1HQuestions();
    }
  }, [content, fiveWOneHQuestions.length]);

  // Memoized navigation function
  const goBack = useCallback(() => {
    navigate('/smartread/paste-text');
  }, [navigate]);

  // Memoized settings panel toggle
  const toggleSettingsPanel = useCallback(() => {
    setShowSettingsPanel(prev => !prev);
  }, []);

  // Memoized learning panel handlers
  const handleShowLearningPanel = useCallback(() => {
    setShowLearningPanel(true);
  }, []);

  const handleCloseLearningPanel = useCallback(() => {
    setShowLearningPanel(false);
  }, []);

  // Track when reading starts
  useEffect(() => {
    if (readingState.isReading && !readingStartTimeRef.current) {
      readingStartTimeRef.current = new Date();
      
    } else if (!readingState.isReading) {
      // Reset when reading stops
      if (readingState.elapsedTime === 0) {
        readingStartTimeRef.current = null;
      }
    }
  }, [readingState.isReading, readingState.elapsedTime]);

  // Save reading session to backend
  const saveReadingSession = useCallback(async (readingData, contentData) => {
    try {
      const sessionStartTime = readingStartTimeRef.current || new Date();
      const sessionEndTime = new Date();
      
      // Calculate duration if we have actual start time
      let duration = readingData.elapsedTime * 1000; // Convert to milliseconds
      if (readingStartTimeRef.current) {
        duration = sessionEndTime.getTime() - sessionStartTime.getTime();
      }

      const sessionData = {
        content: {
          title: contentData?.title || 'Văn bản đã dán',
          text: contentData?.content || contentData?.text || '',
          wordCount: contentData?.wordCount || readingData.wordCount || 0,
          source: contentData?.source || 'pasted',
        },
        readingStats: {
          wpm: readingData.averageWPM || readingData.finalWPM || 0,
          duration: duration,
          startTime: sessionStartTime.toISOString(),
          endTime: sessionEndTime.toISOString(),
        },
      };

      
      
      const response = await apiService.createReadingSession(sessionData);
      if (response.success && response.data) {
        setReadingSessionId(response.data._id);
        
      } else {
        console.error('❌ Failed to save reading session:', response);
      }
    } catch (error) {
      console.error('❌ Error saving reading session:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
      });
      // Don't block user flow if save fails
    }
  }, []);

  // Memoized finish reading handler
  const handleFinishReading = useCallback(() => {
    // Call the readingState.finishReading to properly stop timers
    readingState.finishReading(async (readingData) => {
      
      
      // Enhance completion data with additional fields
      const enhancedData = {
        ...readingData,
        wpm: readingData.averageWPM || readingData.finalWPM || 0,
        finalWPM: readingData.finalWPM || 0,
        averageWPM: readingData.averageWPM || 0
      };
      
      // Save reading session to backend
      await saveReadingSession(enhancedData, content);
      
      // Set completion data and show popup
      setCompletionData(enhancedData);
      setShowCompletionPopup(true);
      
      // Also call the original onFinishReading for backward compatibility
      onFinishReading(enhancedData);
    });
  }, [readingState, onFinishReading, content, saveReadingSession]);

  // Handle popup actions
  const handlePopupClose = useCallback(() => {
    setShowCompletionPopup(false);
    setCompletionData(null);
  }, []);

  const handleRetry = useCallback(() => {
    setShowCompletionPopup(false);
    setCompletionData(null);
    // Reset reading state
    readingState.resetReading();
  }, [readingState]);

  const handleGoToLearningPanel = useCallback(() => {
    setShowCompletionPopup(false);
    setCompletionData(null);
    setShowLearningPanel(true);
  }, []);

  const handleTakeQuiz = useCallback(() => {
    setShowCompletionPopup(false);
    setShowQuizPanel(true);
  }, []);

  const handleQuizClose = useCallback(() => {
    setShowQuizPanel(false);
  }, []);

  const handleQuizComplete = useCallback(async (quizResult) => {
    
    
    // Save quiz result to backend
    if (readingSessionId && quizResult) {
      try {
        const quizData = {
          readingSessionId: readingSessionId,
          quizType: quizResult.quizType || 'mixed',
          results: {
            correctCount: quizResult.correctCount || 0,
            totalQuestions: quizResult.totalQuestions || 0,
            comprehensionPercent: quizResult.comprehensionPercent || 0,
          },
          metrics: {
            wpm: completionData?.averageWPM || completionData?.finalWPM || 0,
            rei: quizResult.rei || 0,
          },
          answers: (quizResult.perQuestion || []).map((item) => ({
            questionId: item.qid || '',
            questionType: 'mcq',
            userAnswer: item.userAnswer || '',
            correctAnswer: item.correct || '',
            isCorrect: item.isCorrect || false,
            explanation: item.explanation || '',
          })),
          feedback: quizResult.feedback || '',
        };

        const response = await apiService.saveQuizResult(quizData);
        if (response.success) {
          
        }
      } catch (error) {
        console.error('Error saving quiz result:', error);
      }
    }
  }, [readingSessionId, completionData]);


  // Memoized reset settings handler
  const handleResetSettings = useCallback(() => {
    readingSettings.resetSettings();
  }, [readingSettings]);

  return (
    <div 
      className={`min-h-screen transition-colors duration-300 ${
        readingSettings.readingSettings.readingMode 
        ? 'bg-gray-100' 
          : readingSettings.currentTheme.bg
      } ${readingSettings.currentTheme.text}`}
      style={{
        backgroundColor: readingSettings.readingSettings.readingMode 
          ? '#f3f4f6' 
          : readingSettings.readingSettings.theme === 'dark' 
            ? '#111827' 
            : readingSettings.readingSettings.theme === 'sepia'
              ? '#fef3c7'
              : readingSettings.readingSettings.theme === 'focus'
                ? '#0f172a' // Deep slate-900
                : '#ffffff'
      }}
    >
      {/* Global CSS for settings panel positioning */}
      <style>{`
        .settings-panel {
          position: fixed !important;
          top: 50% !important;
          right: 5rem !important;
          transform: translateY(-50%) !important;
          z-index: 60 !important;
        }
        
        .settings-toggle {
          position: fixed !important;
          top: 50% !important;
          right: 1rem !important;
          transform: translateY(-50%) !important;
          z-index: 60 !important;
        }
      `}</style>

      {/* Reading Header */}
      <ReadingHeader
        // Reading state
        isReading={readingState.isReading}
        isPaused={readingState.isPaused}
        smoothedWPM={readingState.smoothedWPM}
        elapsedTime={readingState.elapsedTime}
        wordsRead={readingState.wordsRead}
        finalWPM={completionData?.averageWPM || 0}
        
        // Settings
        readingSettings={readingSettings.readingSettings}
        fontSizeOptions={readingSettings.fontSizeOptions}
        fontFamilyOptions={readingSettings.fontFamilyOptions}
        themeOptions={readingSettings.themeOptions}
        
        // Actions
        onGoBack={goBack}
        onStartReading={readingState.startReading}
        onTogglePause={readingState.togglePause}
        onFinishReading={handleFinishReading}
        onShowLearningPanel={handleShowLearningPanel}
        onDecreaseFontSize={readingSettings.decreaseFontSize}
        onIncreaseFontSize={readingSettings.increaseFontSize}
        onChangeFontFamily={readingSettings.changeFontFamily}
        onChangeTheme={readingSettings.changeTheme}
        onToggleReadingMode={readingSettings.toggleReadingMode}
        resetReading={readingState.resetReading}
        
        // Helper functions
        formatTime={readingState.formatTime}
        getCurrentFontSizeIndex={readingSettings.getCurrentFontSizeIndex}
      />

      {/* Reading Settings Panel */}
      <ReadingSettingsPanel
        // State
        showSettingsPanel={showSettingsPanel}
        
        // Settings
        readingSettings={readingSettings.readingSettings}
        fontSizeOptions={readingSettings.fontSizeOptions}
        fontFamilyOptions={readingSettings.fontFamilyOptions}
        themeOptions={readingSettings.themeOptions}
        
        // Actions
        onToggleSettingsPanel={toggleSettingsPanel}
        onDecreaseFontSize={readingSettings.decreaseFontSize}
        onIncreaseFontSize={readingSettings.increaseFontSize}
        onChangeFontFamily={readingSettings.changeFontFamily}
        onToggleBold={readingSettings.toggleBold}
        onToggleItalic={readingSettings.toggleItalic}
        onToggleUnderline={readingSettings.toggleUnderline}
        onToggleHighlight={readingSettings.toggleHighlight}
        onChangeTheme={readingSettings.changeTheme}
        onToggleReadingMode={readingSettings.toggleReadingMode}
        onShowLearningPanel={handleShowLearningPanel}
        onResetSettings={handleResetSettings}
        
        // Helper functions
        getCurrentFontSizeIndex={readingSettings.getCurrentFontSizeIndex}
      />

      {/* Reading Content */}
      <ReadingContent
        // Content
        content={content}
        contentRef={contentRef}
        
        // Settings
        readingSettings={readingSettings.readingSettings}
        currentTheme={readingSettings.currentTheme}
        currentFontFamily={readingSettings.currentFontFamily}
        
        // Helper functions
        getTextFormattingClasses={readingSettings.getTextFormattingClasses}
        getHighlightStyle={readingSettings.getHighlightStyle}
      />

              {/* Learning Panel */}
              <LearningPanel
                title={content?.title || 'Bài viết'}
                content={content?.content || content}
                isVisible={showLearningPanel}
                onClose={handleCloseLearningPanel}
                readingProgress={readingState.getReadingProgress()}
                readingData={completionData || {
                  isReading: readingState.isReading,
                  currentWPM: readingState.smoothedWPM,
                  finalWPM: readingState.smoothedWPM,
                  wpm: readingState.smoothedWPM,
                  wordsRead: readingState.wordsRead,
                  elapsedTime: readingState.elapsedTime
                }}
                fiveWOneHQuestions={fiveWOneHQuestions}
                isLoading5W1H={isLoading5W1H}
              />

              {/* Reading Completion Popup */}
              <ReadingCompletionPopup
                isVisible={showCompletionPopup}
                onClose={handlePopupClose}
                readingData={completionData}
                onRetry={handleRetry}
                onGoToLearningPanel={handleGoToLearningPanel}
                onTakeQuiz={handleTakeQuiz}
              />

              {/* Quiz Panel */}
              <QuizPanel
                isVisible={showQuizPanel}
                onClose={handleQuizClose}
                textId={content?.id || content?.title || `text_${Date.now()}`}
                textContent={content?.content || content || ''}
                wpm={completionData?.averageWPM || completionData?.finalWPM || 0}
                onComplete={handleQuizComplete}
                readingSessionId={readingSessionId}
              />
    </div>
  );
});

export default ReadingMode;
