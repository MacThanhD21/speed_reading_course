import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  FaFont, 
  FaMinus, 
  FaPlus, 
  FaPalette, 
  FaEye, 
  FaHighlighter, 
  FaTimes, 
  FaGraduationCap 
} from 'react-icons/fa';

const ReadingSettingsPanel = ({
  // State
  showSettingsPanel,
  
  // Settings
  readingSettings,
  fontSizeOptions,
  fontFamilyOptions,
  themeOptions,
  
  // Actions
  onToggleSettingsPanel,
  onDecreaseFontSize,
  onIncreaseFontSize,
  onChangeFontFamily,
  onToggleBold,
  onToggleItalic,
  onToggleUnderline,
  onToggleHighlight,
  onChangeTheme,
  onToggleReadingMode,
  onShowLearningPanel,
  onResetSettings,
  
  // Helper functions
  getCurrentFontSizeIndex
}) => {
  const panelRef = useRef(null);

  // Handle click outside to close panel
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        if (showSettingsPanel) {
          onToggleSettingsPanel();
        }
      }
    };

    if (showSettingsPanel) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSettingsPanel, onToggleSettingsPanel]);
  return (
    <>
      {/* Settings Toggle Button - Bottom Right */}
      <div className="fixed bottom-6 right-6 z-[60] hidden sm:block">
        <button
          onClick={onToggleSettingsPanel}
          className={`w-16 h-16 flex items-center justify-center rounded-xl shadow-xl transition-all duration-300 transform hover:scale-110 ${
            showSettingsPanel 
              ? 'bg-blue-600 text-white shadow-blue-600/50' 
              : 'bg-white/95 backdrop-blur-sm border border-gray-200 text-gray-600 hover:bg-gray-50 hover:shadow-lg'
          }`}
          title={showSettingsPanel ? 'Đóng công cụ' : 'Mở công cụ'}
        >
          <FaFont className="text-xl" />
        </button>
      </div>

      {/* Settings Panel - Bottom Right */}
      <motion.div 
        ref={panelRef}
        initial={false}
        animate={{ 
          opacity: showSettingsPanel ? 1 : 0,
          y: showSettingsPanel ? 0 : 20,
          scale: showSettingsPanel ? 1 : 0.95
        }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className={`fixed bottom-24 right-6 z-[60] hidden sm:block ${
          showSettingsPanel ? 'pointer-events-auto' : 'pointer-events-none'
        }`}
      >
        <div className={`backdrop-blur-sm border rounded-2xl shadow-2xl p-6 w-[520px] max-w-[95vw] transition-all duration-300 ${
          readingSettings.theme === 'dark' 
            ? 'bg-gray-800/95 border-gray-700' 
            : 'bg-white/95 border-gray-200'
        }`}>
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                <FaFont className="text-white text-lg" />
              </div>
              <div>
                <h3 className={`font-bold text-lg ${
                  readingSettings.theme === 'dark' ? 'text-gray-100' : 'text-gray-800'
                }`}>Công cụ đọc</h3>
                <p className={`text-xs ${
                  readingSettings.theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`}>Tùy chỉnh trải nghiệm đọc</p>
              </div>
            </div>
            <button
              onClick={onToggleSettingsPanel}
              className={`w-8 h-8 flex items-center justify-center rounded-full transition-all duration-200 hover:scale-110 ${
                readingSettings.theme === 'dark' 
                  ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
              }`}
              title="Đóng"
            >
              <FaTimes className="text-sm" />
            </button>
          </div>
          
          {/* Main Content */}
          <div className="space-y-6">
            {/* Typography Section */}
            <div className={`rounded-xl p-4 transition-all duration-300 ${
              readingSettings.theme === 'dark' 
                ? 'bg-gradient-to-r from-gray-700 to-gray-600' 
                : 'bg-gradient-to-r from-blue-50 to-purple-50'
            }`}>
              <h4 className={`font-semibold mb-4 flex items-center ${
                readingSettings.theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
              }`}>
                <FaFont className={`mr-2 ${
                  readingSettings.theme === 'dark' ? 'text-blue-400' : 'text-blue-500'
                }`} />
                Typography
              </h4>
              
              <div className="grid grid-cols-2 gap-4">
                {/* Font Size */}
                <div className="space-y-2">
                  <label className={`text-sm font-medium ${
                    readingSettings.theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}>Font Size</label>
                  <div className={`flex items-center space-x-2 rounded-lg p-2 shadow-sm ${
                    readingSettings.theme === 'dark' ? 'bg-gray-600' : 'bg-white'
                  }`}>
                    <button
                      onClick={onDecreaseFontSize}
                      disabled={getCurrentFontSizeIndex() === 0}
                      className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all duration-200 ${
                        readingSettings.theme === 'dark' 
                          ? 'bg-gray-500 hover:bg-gray-400 text-gray-200' 
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                      title="Giảm kích thước chữ"
                    >
                      <FaMinus className="text-sm" />
                    </button>
                    
                    <div className={`flex-1 px-3 py-2 text-center font-bold rounded-lg border ${
                      readingSettings.theme === 'dark' 
                        ? 'bg-gray-700 text-gray-100 border-gray-600' 
                        : 'bg-white text-gray-800 border-gray-300'
                    }`}>
                      {readingSettings.fontSize}px
                    </div>
                    
                    <button
                      onClick={onIncreaseFontSize}
                      disabled={getCurrentFontSizeIndex() === fontSizeOptions.length - 1}
                      className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all duration-200 ${
                        readingSettings.theme === 'dark' 
                          ? 'bg-gray-500 hover:bg-gray-400 text-gray-200' 
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                      title="Tăng kích thước chữ"
                    >
                      <FaPlus className="text-sm" />
                    </button>
                  </div>
                </div>

                {/* Font Family */}
                <div className="space-y-2">
                  <label className={`text-sm font-medium ${
                    readingSettings.theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}>Font Family</label>
                  <select
                    value={readingSettings.fontFamily}
                    onChange={(e) => onChangeFontFamily(e.target.value)}
                    className={`w-full text-sm border rounded-lg px-3 py-2 transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      readingSettings.theme === 'dark' 
                        ? 'bg-gray-600 border-gray-500 text-gray-100 hover:bg-gray-500' 
                        : 'bg-white border-gray-300 text-gray-800 hover:bg-gray-50'
                    }`}
                  >
                    {fontFamilyOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Text Formatting Section */}
            <div className={`rounded-xl p-4 transition-all duration-300 ${
              readingSettings.theme === 'dark' 
                ? 'bg-gradient-to-r from-gray-700 to-gray-600' 
                : 'bg-gradient-to-r from-green-50 to-teal-50'
            }`}>
              <h4 className={`font-semibold mb-4 flex items-center ${
                readingSettings.theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
              }`}>
                <FaHighlighter className={`mr-2 ${
                  readingSettings.theme === 'dark' ? 'text-green-400' : 'text-green-500'
                }`} />
                Text Formatting
              </h4>
              
              <div className="flex items-center space-x-3">
                {/* Bold */}
                <button
                  onClick={onToggleBold}
                  className={`w-12 h-12 flex items-center justify-center rounded-xl transition-all duration-200 transform hover:scale-105 ${
                    readingSettings.textFormatting.bold 
                      ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30' 
                      : readingSettings.theme === 'dark'
                        ? 'bg-gray-600 text-gray-300 hover:bg-gray-500 border border-gray-500 shadow-sm'
                        : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200 shadow-sm'
                  }`}
                  title="Bold"
                >
                  <span className="font-bold text-lg">B</span>
                </button>
                
                {/* Italic */}
                <button
                  onClick={onToggleItalic}
                  className={`w-12 h-12 flex items-center justify-center rounded-xl transition-all duration-200 transform hover:scale-105 ${
                    readingSettings.textFormatting.italic 
                      ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30' 
                      : readingSettings.theme === 'dark'
                        ? 'bg-gray-600 text-gray-300 hover:bg-gray-500 border border-gray-500 shadow-sm'
                        : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200 shadow-sm'
                  }`}
                  title="Italic"
                >
                  <span className="italic text-lg">I</span>
                </button>
                
                {/* Underline */}
                <button
                  onClick={onToggleUnderline}
                  className={`w-12 h-12 flex items-center justify-center rounded-xl transition-all duration-200 transform hover:scale-105 ${
                    readingSettings.textFormatting.underline 
                      ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30' 
                      : readingSettings.theme === 'dark'
                        ? 'bg-gray-600 text-gray-300 hover:bg-gray-500 border border-gray-500 shadow-sm'
                        : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200 shadow-sm'
                  }`}
                  title="Underline"
                >
                  <span className="underline text-lg">U</span>
                </button>
                
                {/* Highlight */}
                <button
                  onClick={onToggleHighlight}
                  className={`w-12 h-12 flex items-center justify-center rounded-xl transition-all duration-200 transform hover:scale-105 ${
                    readingSettings.textFormatting.highlight 
                      ? 'bg-yellow-500 text-white shadow-lg shadow-yellow-500/30' 
                      : readingSettings.theme === 'dark'
                        ? 'bg-gray-600 text-gray-300 hover:bg-gray-500 border border-gray-500 shadow-sm'
                        : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200 shadow-sm'
                  }`}
                  title="Highlight"
                >
                  <FaHighlighter className="text-lg" />
                </button>
              </div>
            </div>

            {/* Theme Section */}
            <div className={`rounded-xl p-4 transition-all duration-300 ${
              readingSettings.theme === 'dark' 
                ? 'bg-gradient-to-r from-gray-700 to-gray-600' 
                : 'bg-gradient-to-r from-purple-50 to-pink-50'
            }`}>
              <h4 className={`font-semibold mb-4 flex items-center ${
                readingSettings.theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
              }`}>
                <FaPalette className={`mr-2 ${
                  readingSettings.theme === 'dark' ? 'text-purple-400' : 'text-purple-500'
                }`} />
                Theme
              </h4>
              
              <div className="grid grid-cols-3 gap-3">
                {themeOptions.map(option => (
                  <button
                    key={option.value}
                    onClick={() => onChangeTheme(option.value)}
                    className={`px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 transform hover:scale-105 ${
                      readingSettings.theme === option.value
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/30'
                        : readingSettings.theme === 'dark'
                          ? 'bg-gray-600 text-gray-300 hover:bg-gray-500 border border-gray-500 shadow-sm'
                          : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200 shadow-sm'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Controls Section */}
            <div className={`rounded-xl p-4 transition-all duration-300 ${
              readingSettings.theme === 'dark' 
                ? 'bg-gradient-to-r from-gray-700 to-gray-600' 
                : 'bg-gradient-to-r from-gray-50 to-slate-50'
            }`}>
              <div className="flex items-center justify-between">
                {/* Reading Mode */}
                <div className="flex items-center space-x-3">
                  <FaEye className={`text-lg ${
                    readingSettings.theme === 'dark' ? 'text-blue-400' : 'text-blue-500'
                  }`} />
                  <span className={`text-sm font-medium ${
                    readingSettings.theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                  }`}>Chế độ tập trung</span>
                  <button
                    onClick={onToggleReadingMode}
                    className={`relative w-12 h-6 rounded-full transition-all duration-200 ${
                      readingSettings.readingMode 
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500' 
                        : readingSettings.theme === 'dark'
                          ? 'bg-gray-500'
                          : 'bg-gray-300'
                    }`}
                  >
                    <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-200 shadow-lg ${
                      readingSettings.readingMode ? 'translate-x-6' : 'translate-x-0'
                    }`} />
                  </button>
                </div>

                {/* Quick Actions */}
                <div className="flex space-x-3">
                  <button
                    onClick={onShowLearningPanel}
                    className="flex items-center px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg shadow-indigo-500/30"
                  >
                    <FaGraduationCap className="mr-2 text-sm" />
                    <span className="text-sm font-medium">Học tập</span>
                  </button>
                  
                  <button
                    onClick={onResetSettings}
                    className={`flex items-center px-4 py-2 rounded-xl transition-all duration-200 transform hover:scale-105 ${
                      readingSettings.theme === 'dark'
                        ? 'bg-gray-600 hover:bg-gray-500 text-gray-200 border border-gray-500 shadow-sm'
                        : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 shadow-sm'
                    }`}
                  >
                    <FaTimes className="mr-2 text-sm" />
                    <span className="text-sm font-medium">Reset</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default ReadingSettingsPanel;
