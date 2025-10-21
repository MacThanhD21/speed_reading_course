import React from 'react';
import { motion } from 'framer-motion';

const ReadingContent = ({
  // Content
  content,
  contentRef,
  
  // Settings
  readingSettings,
  currentTheme,
  currentFontFamily,
  
  // Helper functions
  getTextFormattingClasses,
  getHighlightStyle
}) => {
  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3, ease: "easeOut" }
  };

  return (
    <div className="pt-24 sm:pt-20 pb-8">
      <div className="w-full">
        <motion.div
          {...fadeInUp}
          className={`rounded-lg sm:rounded-xl shadow-lg p-6 sm:p-12 transition-colors duration-300 ${
            readingSettings.readingMode 
              ? 'bg-white border-2 border-blue-200' 
              : currentTheme.card
          }`}
          style={{
            backgroundColor: readingSettings.readingMode 
              ? 'white' 
              : readingSettings.theme === 'dark' 
                ? '#1f2937' 
                : readingSettings.theme === 'sepia'
                  ? '#fef3c7'
                  : 'white'
          }}
        >
          {/* Enhanced CSS for text selection and mouse UI */}
          <style jsx>{`
            /* Dynamic text selection based on theme */
            .smartread-content ::selection {
              background: ${readingSettings.theme === 'dark' 
                ? '#f59e0b' 
                : readingSettings.theme === 'sepia' 
                ? '#d97706'
                : '#3b82f6'} !important;
              color: ${readingSettings.theme === 'dark'
                ? '#1f2937'
                : readingSettings.theme === 'sepia'
                ? 'white'
                : 'white'} !important;
              text-shadow: none !important;
              border-radius: 3px !important;
            }
            
            .smartread-content ::-moz-selection {
              background: ${readingSettings.theme === 'dark' 
                ? '#f59e0b' 
                : readingSettings.theme === 'sepia' 
                ? '#d97706'
                : '#3b82f6'} !important;
              color: ${readingSettings.theme === 'dark'
                ? '#1f2937'
                : readingSettings.theme === 'sepia'
                ? 'white'
                : 'white'} !important;
              text-shadow: none !important;
              border-radius: 3px !important;
            }
            
            .smartread-content ::-webkit-selection {
              background: ${readingSettings.theme === 'dark' 
                ? '#f59e0b' 
                : readingSettings.theme === 'sepia' 
                ? '#d97706'
                : '#3b82f6'} !important;
              color: ${readingSettings.theme === 'dark'
                ? '#1f2937'
                : readingSettings.theme === 'sepia'
                ? 'white'
                : 'white'} !important;
              text-shadow: none !important;
              border-radius: 3px !important;
            }
            
            /* Enhanced performance CSS */
            .smartread-content {
              cursor: text !important;
              will-change: transform, opacity;
              transform: translateZ(0);
              backface-visibility: hidden;
              perspective: 1000px;
            }
            
            .smartread-content:hover {
              cursor: text !important;
            }
            
            /* Optimized transitions */
            .smartread-content * {
              transition: background-color 0.15s ease, color 0.15s ease !important;
              will-change: background-color, color;
            }
            
            /* Hardware acceleration for animations */
            .smartread-content p:hover,
            .smartread-content h1:hover,
            .smartread-content h2:hover,
            .smartread-content h3:hover {
              background-color: rgba(59, 130, 246, 0.05);
              border-radius: 4px;
              transition: background-color 0.2s ease;
              transform: translateZ(0);
            }
            
            /* Better text rendering with performance */
            .smartread-content {
              text-rendering: optimizeLegibility;
              -webkit-font-smoothing: antialiased;
              -moz-osx-font-smoothing: grayscale;
              font-feature-settings: 'kern' 1, 'liga' 1;
            }
            
            /* Enhanced selection feedback */
            .smartread-content::selection {
              animation: selectionPulse 0.3s ease-out;
            }
            
            @keyframes selectionPulse {
              0% {
                background-color: ${readingSettings.theme === 'dark'
                  ? 'rgba(245, 158, 11, 0.3)'
                  : readingSettings.theme === 'sepia'
                  ? 'rgba(217, 119, 6, 0.3)'
                  : 'rgba(59, 130, 246, 0.3)'};
              }
              100% {
                background-color: ${readingSettings.theme === 'dark'
                  ? '#f59e0b'
                  : readingSettings.theme === 'sepia'
                  ? '#d97706'
                  : '#3b82f6'};
              }
            }
          `}</style>

          {/* Highlight first paragraph as title */}
          <div 
            ref={contentRef}
            className={`smartread-text smartread-content max-w-none leading-normal transition-all duration-300 ${currentFontFamily.class} ${getTextFormattingClasses()} select-text cursor-text px-8 py-8`}
            style={{
              fontSize: `${readingSettings.fontSize}px`,
              lineHeight: '1.4',
              fontFamily: readingSettings.fontFamily === 'system' ? 'system-ui, -apple-system, sans-serif' : undefined,
              ...getHighlightStyle(),
              // Custom selection styles
              '::selection': {
                backgroundColor: '#3b82f6',
                color: 'white'
              },
              '::-moz-selection': {
                backgroundColor: '#3b82f6',
                color: 'white'
              }
            }}
            tabIndex={0}
          >
            {content.content.split('\n').map((paragraph, index) => {
              // First paragraph is treated as title
              if (index === 0 && paragraph.trim()) {
                  return (
                    <h1 
                      key={index} 
                      className={`mb-4 sm:mb-6 text-center font-bold transition-colors duration-300 ${
                        readingSettings.readingMode 
                          ? 'text-blue-800 text-2xl sm:text-3xl lg:text-4xl' 
                          : `${currentTheme.text} text-xl sm:text-2xl lg:text-3xl`
                      }`}
                    >
                      {paragraph}
                    </h1>
                  );
              }
              
              // Regular paragraphs
              return (
                <p 
                  key={index} 
                  className={`mb-2 sm:mb-3 transition-colors duration-300 ${
                    readingSettings.readingMode 
                      ? 'text-gray-800' 
                      : currentTheme.text
                  }`}
                >
                  {paragraph}
                </p>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ReadingContent;
