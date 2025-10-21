import React from 'react';
import { motion } from 'framer-motion';
import { 
  FaCheck, 
  FaPause, 
  FaPlay, 
  FaPlus, 
  FaMinus, 
  FaArrowLeft, 
  FaFont, 
  FaPalette, 
  FaEye, 
  FaGraduationCap,
  FaRedo
} from 'react-icons/fa';

const ReadingHeader = ({
  // Reading state
  isReading,
  isPaused,
  smoothedWPM,
  elapsedTime,
  wordsRead,
  
  // Settings
  readingSettings,
  fontSizeOptions,
  fontFamilyOptions,
  themeOptions,
  
  // Actions
  onGoBack,
  onStartReading,
  onTogglePause,
  onFinishReading,
  onShowLearningPanel,
  onDecreaseFontSize,
  onIncreaseFontSize,
  onChangeFontFamily,
  onChangeTheme,
  onToggleReadingMode,
  resetReading,
  
  // Helper functions
  formatTime,
  getCurrentFontSizeIndex
}) => {
  return (
    <div className={`fixed top-0 left-0 right-0 backdrop-blur-md border-b z-50 shadow-sm transition-all duration-300 ${
      readingSettings.theme === 'dark' || readingSettings.theme === 'focus' || readingSettings.theme === 'focus'
        ? 'bg-gray-900/95 border-gray-700' 
        : 'bg-white/95 border-gray-200'
    }`}>
      <div className="w-full px-4 py-2">
        {/* Desktop Layout */}
        <div className="hidden sm:flex items-center justify-between">
          {/* Left Section - Navigation */}
          <div className="flex items-center space-x-3">
            <button
              onClick={onGoBack}
              className={`flex items-center px-4 py-2.5 rounded-xl transition-all duration-200 border ${
                readingSettings.theme === 'dark' || readingSettings.theme === 'focus'
                  ? 'text-gray-300 hover:text-gray-100 hover:bg-gray-800 border-gray-600 hover:border-gray-500'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50 border-gray-200 hover:border-gray-300'
              }`}
            >
              <FaArrowLeft className="mr-2" />
              Quay lại
            </button>
            
            <button
              onClick={onShowLearningPanel}
              className="flex items-center px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <FaGraduationCap className="mr-2" />
              Học tập
            </button>
            
            <button
              onClick={resetReading}
              className={`flex items-center px-4 py-2.5 rounded-xl transition-all duration-200 border ${
                readingSettings.theme === 'dark' || readingSettings.theme === 'focus'
                  ? 'text-gray-300 hover:text-gray-100 hover:bg-gray-800 border-gray-600 hover:border-gray-500'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50 border-gray-200 hover:border-gray-300'
              }`}
              title="Reset và bắt đầu đo lại"
            >
              <FaRedo className="mr-2" />
              Reset
            </button>
          </div>

          {/* Center Section - Reading Stats */}
          <div className="flex items-center space-x-6">
            {/* WPM Card */}
            <div className={`rounded-xl p-4 min-w-[100px] border transition-all duration-300 ${
              readingSettings.theme === 'dark' || readingSettings.theme === 'focus'
                ? 'bg-gradient-to-br from-blue-900/50 to-blue-800/50 border-blue-700'
                : 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200'
            }`}>
              <div className="text-center">
                <div className={`text-3xl font-bold mb-1 ${
                  readingSettings.theme === 'dark' || readingSettings.theme === 'focus' ? 'text-blue-300' : 'text-blue-700'
                }`}>
                  {isReading && !isNaN(smoothedWPM) ? smoothedWPM : 0}
                </div>
                <div className={`text-xs font-medium uppercase tracking-wide ${
                  readingSettings.theme === 'dark' || readingSettings.theme === 'focus' ? 'text-blue-400' : 'text-blue-600'
                }`}>WPM</div>
              </div>
            </div>

            {/* Time Card */}
            <div className={`rounded-xl p-4 min-w-[100px] border transition-all duration-300 ${
              readingSettings.theme === 'dark' || readingSettings.theme === 'focus'
                ? 'bg-gradient-to-br from-green-900/50 to-green-800/50 border-green-700'
                : 'bg-gradient-to-br from-green-50 to-green-100 border-green-200'
            }`}>
              <div className="text-center">
                <div className={`text-2xl font-bold mb-1 ${
                  readingSettings.theme === 'dark' || readingSettings.theme === 'focus' ? 'text-green-300' : 'text-green-700'
                }`}>
                  {formatTime(elapsedTime || 0)}
                </div>
                <div className={`text-xs font-medium uppercase tracking-wide ${
                  readingSettings.theme === 'dark' || readingSettings.theme === 'focus' ? 'text-green-400' : 'text-green-600'
                }`}>Thời gian</div>
              </div>
            </div>

            {/* Words Card */}
            <div className={`rounded-xl p-4 min-w-[100px] border transition-all duration-300 ${
              readingSettings.theme === 'dark' || readingSettings.theme === 'focus'
                ? 'bg-gradient-to-br from-purple-900/50 to-purple-800/50 border-purple-700'
                : 'bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200'
            }`}>
              <div className="text-center">
                <div className={`text-2xl font-bold mb-1 ${
                  readingSettings.theme === 'dark' || readingSettings.theme === 'focus' ? 'text-purple-300' : 'text-purple-700'
                }`}>
                  {wordsRead || 0}
                </div>
                <div className={`text-xs font-medium uppercase tracking-wide ${
                  readingSettings.theme === 'dark' || readingSettings.theme === 'focus' ? 'text-purple-400' : 'text-purple-600'
                }`}>Từ đã đọc</div>
              </div>
            </div>
          </div>

          {/* Right Section - Main Controls */}
          <div className="flex items-center space-x-3">
            {/* Control Buttons */}
            {!isReading ? (
              <button
                onClick={onStartReading}
                className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <FaPlay className="mr-2" />
                Bắt đầu đọc
              </button>
            ) : (
              <div className="flex space-x-3">
                <button
                  onClick={onTogglePause}
                  className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white px-5 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  {isPaused ? <FaPlay className="mr-2" /> : <FaPause className="mr-2" />}
                  {isPaused ? 'Tiếp tục' : 'Tạm dừng'}
                </button>
                <button
                  onClick={onFinishReading}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-5 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <FaCheck className="mr-2" />
                  Hoàn thành
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="sm:hidden">
          {/* Top Row - Navigation */}
          <div className="flex justify-between items-center mb-2 space-x-1">
            <button
              onClick={onGoBack}
              className="flex items-center px-2 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-xl transition-all duration-200 border border-gray-200 hover:border-gray-300 text-xs"
            >
              <FaArrowLeft className="mr-1" />
              Quay lại
            </button>
            
            <button
              onClick={resetReading}
              className="flex items-center px-2 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-xl transition-all duration-200 border border-gray-200 hover:border-gray-300 text-xs"
              title="Reset và bắt đầu đo lại"
            >
              <FaRedo className="mr-1" />
              Reset
            </button>
            
            <button
              onClick={onShowLearningPanel}
              className="flex items-center px-2 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl transition-all duration-200 shadow-md hover:shadow-lg text-xs"
            >
              <FaGraduationCap className="mr-1" />
              Học tập
            </button>
          </div>

          {/* Stats Row */}
          <div className="flex justify-between items-center mb-2 space-x-2">
            {/* WPM Card */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 flex-1 border border-blue-200">
              <div className="text-center">
                <div className="text-xl font-bold text-blue-700 mb-1">
                  {isReading && !isNaN(smoothedWPM) ? smoothedWPM : 0}
                </div>
                <div className="text-xs font-medium text-blue-600 uppercase tracking-wide">WPM</div>
              </div>
            </div>

            {/* Time Card */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 flex-1 border border-green-200">
              <div className="text-center">
                <div className="text-lg font-bold text-green-700 mb-1">
                  {formatTime(elapsedTime || 0)}
                </div>
                <div className="text-xs font-medium text-green-600 uppercase tracking-wide">Thời gian</div>
              </div>
            </div>

            {/* Words Card */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 flex-1 border border-purple-200">
              <div className="text-center">
                <div className="text-lg font-bold text-purple-700 mb-1">
                  {wordsRead || 0}
                </div>
                <div className="text-xs font-medium text-purple-600 uppercase tracking-wide">Từ đã đọc</div>
              </div>
            </div>
          </div>

          {/* Mobile Settings Row */}
          <div className="flex items-center justify-center space-x-2 mb-2">
            {/* Font Size Controls */}
            <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={onDecreaseFontSize}
                disabled={getCurrentFontSizeIndex() === 0}
                className="w-6 h-6 flex items-center justify-center rounded bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Giảm kích thước chữ"
              >
                <FaMinus className="text-xs text-gray-600" />
              </button>
              
              <div className="px-2 py-1 text-xs font-medium text-gray-700 min-w-[40px] text-center">
                {readingSettings.fontSize}px
              </div>
              
              <button
                onClick={onIncreaseFontSize}
                disabled={getCurrentFontSizeIndex() === fontSizeOptions.length - 1}
                className="w-6 h-6 flex items-center justify-center rounded bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Tăng kích thước chữ"
              >
                <FaPlus className="text-xs text-gray-600" />
              </button>
            </div>

            {/* Font Family */}
            <select
              value={readingSettings.fontFamily}
              onChange={(e) => onChangeFontFamily(e.target.value)}
              className="text-xs border border-gray-300 rounded px-2 py-1 bg-white"
              title="Font"
            >
              {fontFamilyOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            {/* Theme */}
            <select
              value={readingSettings.theme}
              onChange={(e) => onChangeTheme(e.target.value)}
              className="text-xs border border-gray-300 rounded px-2 py-1 bg-white"
              title="Theme"
            >
              {themeOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            {/* Reading Mode */}
            <button
              onClick={onToggleReadingMode}
              className={`w-8 h-6 flex items-center justify-center rounded transition-colors ${
                readingSettings.readingMode 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-600'
              }`}
              title="Chế độ đọc"
            >
              <FaEye className="text-xs" />
            </button>
          </div>

          {/* Control Buttons Row */}
          <div className="flex justify-center">
            {!isReading ? (
              <button
                onClick={onStartReading}
                className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center shadow-lg hover:shadow-xl"
              >
                <FaPlay className="mr-2" />
                Bắt đầu đọc
              </button>
            ) : (
              <div className="flex space-x-3">
                <button
                  onClick={onTogglePause}
                  className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white px-4 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center shadow-lg hover:shadow-xl"
                >
                  {isPaused ? <FaPlay className="mr-2" /> : <FaPause className="mr-2" />}
                  {isPaused ? 'Tiếp tục' : 'Tạm dừng'}
                </button>
                <button
                  onClick={onFinishReading}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center shadow-lg hover:shadow-xl"
                >
                  <FaCheck className="mr-2" />
                  Hoàn thành
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReadingHeader;
