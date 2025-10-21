import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import LearningPanel from './LearningPanel';
import ReadingHeader from './ReadingHeader';
import ReadingSettingsPanel from './ReadingSettingsPanel';
import ReadingContent from './ReadingContent';
import { useReadingState, useReadingSettings } from '../../hooks/useReadingMode';

const ReadingMode = ({ content, onFinishReading, onQuizCompleted }) => {
  const navigate = useNavigate();
  const contentRef = useRef(null);
  
  // Custom hooks
  const readingState = useReadingState(content);
  const readingSettings = useReadingSettings();
  
  // Local state
  const [showLearningPanel, setShowLearningPanel] = useState(false);
  const [showSettingsPanel, setShowSettingsPanel] = useState(false);

  // Navigation
  const goBack = () => {
    navigate('/smartread/paste-text');
  };

  // Settings panel toggle
  const toggleSettingsPanel = () => {
    setShowSettingsPanel(prev => !prev);
  };

  // Reset settings handler
  const handleResetSettings = () => {
    readingSettings.resetSettings();
  };

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
              : '#ffffff'
      }}
    >
      {/* Global CSS for settings panel positioning */}
      <style jsx>{`
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
        onFinishReading={() => readingState.finishReading(onFinishReading)}
        onShowLearningPanel={() => setShowLearningPanel(true)}
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
        onShowLearningPanel={() => setShowLearningPanel(true)}
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
        onClose={() => setShowLearningPanel(false)}
        readingProgress={readingState.getReadingProgress()}
        readingData={{
          isReading: readingState.isReading,
          currentWPM: readingState.smoothedWPM,
          wordsRead: readingState.wordsRead,
          elapsedTime: readingState.elapsedTime
        }}
      />
    </div>
  );
};

export default ReadingMode;
