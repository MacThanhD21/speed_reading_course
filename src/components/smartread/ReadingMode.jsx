import React, { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LearningPanel from './LearningPanel';
import ReadingHeader from './ReadingHeader';
import ReadingSettingsPanel from './ReadingSettingsPanel';
import ReadingContent from './ReadingContent';
import { useReadingState, useReadingSettings } from '../../hooks/useReadingMode';
import { readingTipsService } from '../../services/readingTipsService';

const ReadingMode = React.memo(({ content, onFinishReading, onQuizCompleted }) => {
  const navigate = useNavigate();
  const contentRef = useRef(null);
  
  // Custom hooks
  const readingState = useReadingState(content);
  const readingSettings = useReadingSettings();
  
  // Local state
  const [showLearningPanel, setShowLearningPanel] = useState(false);
  const [showSettingsPanel, setShowSettingsPanel] = useState(false);
  const [fiveWOneHQuestions, setFiveWOneHQuestions] = useState([]);
  const [isLoading5W1H, setIsLoading5W1H] = useState(false);

  // Load 5W1H questions when entering reading page
  useEffect(() => {
    if (content) {
      load5W1HQuestions();
    }
  }, [content]);

  // Load 5W1H questions for learning panel
  const load5W1HQuestions = useCallback(async () => {
    if (!content) return;
    
    setIsLoading5W1H(true);
    try {
      console.log('Loading 5W1H questions for learning...');
      const questions = await readingTipsService.generate5W1HQuestions(content);
      setFiveWOneHQuestions(questions);
      console.log('5W1H questions loaded:', questions.length);
    } catch (error) {
      console.error('Error loading 5W1H questions:', error);
    } finally {
      setIsLoading5W1H(false);
    }
  }, [content]);

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

  // Memoized finish reading handler
  const handleFinishReading = useCallback(() => {
    // Prepare reading data for storage
    const readingData = {
      finalWPM: readingState.smoothedWPM,
      averageWPM: readingState.smoothedWPM,
      wpm: readingState.smoothedWPM,
      time: readingState.elapsedTime,
      elapsedTime: readingState.elapsedTime,
      wordsRead: readingState.wordsRead,
      content: content?.content || content,
      title: content?.title || 'Bài viết'
    };
    
    console.log('Reading data to be saved:', readingData);
    onFinishReading(readingData);
  }, [onFinishReading, readingState.smoothedWPM, readingState.elapsedTime, readingState.wordsRead, content]);

  // Memoized quiz completed handler
  const handleQuizCompleted = useCallback(() => {
      onQuizCompleted();
  }, [onQuizCompleted]);

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
                readingData={{
                  isReading: readingState.isReading,
                  currentWPM: readingState.smoothedWPM,
                  wordsRead: readingState.wordsRead,
                  elapsedTime: readingState.elapsedTime
                }}
                fiveWOneHQuestions={fiveWOneHQuestions}
                isLoading5W1H={isLoading5W1H}
              />
    </div>
  );
});

export default ReadingMode;
