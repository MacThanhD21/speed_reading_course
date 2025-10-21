import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

const ReadingContent = React.memo(({
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
  const [coloredTexts, setColoredTexts] = useState([]);
  const [isColorMode, setIsColorMode] = useState(false);
  const [selectedColor, setSelectedColor] = useState('#ff0000'); // Default red
  
  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3, ease: "easeOut" }
  };

  // Handle text selection for coloring
  const handleMouseUp = (e) => {
    if (!isColorMode) return;
    
    const selection = window.getSelection();
    const selectedText = selection.toString().trim();
    
    if (selectedText && selectedText.length > 0) {
      const range = selection.getRangeAt(0);
      
      // Create colored span element
      const span = document.createElement('span');
      span.style.color = selectedColor;
      span.style.fontWeight = 'bold';
      span.style.display = 'inline';
      
      try {
        // Extract the selected content
        const contents = range.extractContents();
        
        // Add the content to the span
        span.appendChild(contents);
        
        // Insert the span at the range position
        range.insertNode(span);
        
        // Add to state for tracking
        setColoredTexts(prev => [...prev, {
          id: Date.now(),
          text: selectedText,
          color: selectedColor,
          element: span
        }]);
        
        console.log('Colored text:', selectedText, 'with color:', selectedColor);
      } catch (error) {
        console.log('Cannot color this selection:', error);
      }
      
      // Clear selection
      selection.removeAllRanges();
    }
  };

  // Clear all colored texts
  const clearColoredTexts = () => {
    const coloredElements = contentRef.current?.querySelectorAll('span[style*="color"]');
    coloredElements?.forEach(element => {
      const parent = element.parentNode;
      parent.replaceChild(document.createTextNode(element.textContent), element);
      parent.normalize();
    });
    setColoredTexts([]);
  };

  // Toggle color mode
  useEffect(() => {
    setIsColorMode(readingSettings.textFormatting.highlight); // Reuse highlight toggle
  }, [readingSettings.textFormatting.highlight]);

  return (
    <div className="pt-24 sm:pt-20 pb-8">
      {/* Color Palette */}
      {isColorMode && (
        <div className="fixed top-20 right-4 z-50 bg-white rounded-lg shadow-lg p-4 border">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Chọn màu chữ:</h3>
          <div className="grid grid-cols-6 gap-2">
            {[
              '#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff',
              '#ff8000', '#8000ff', '#00ff80', '#ff0080', '#80ff00', '#0080ff',
              '#ff4000', '#4000ff', '#00ff40', '#ff0040', '#40ff00', '#0040ff',
              '#ffc000', '#c000ff', '#00ffc0', '#ff00c0', '#c0ff00', '#00c0ff',
              '#ff6000', '#6000ff', '#00ff60', '#ff0060', '#60ff00', '#0060ff',
              '#000000', '#808080', '#ffffff', '#800000', '#008000', '#000080'
            ].map((color) => (
              <button
                key={color}
                className={`w-8 h-8 rounded border-2 ${
                  selectedColor === color ? 'border-gray-800' : 'border-gray-300'
                }`}
                style={{ backgroundColor: color }}
                onClick={() => setSelectedColor(color)}
                title={color}
              />
            ))}
          </div>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-xs text-gray-600">Màu hiện tại:</span>
            <div 
              className="w-6 h-6 rounded border border-gray-300"
              style={{ backgroundColor: selectedColor }}
            />
          </div>
          <button
            onClick={clearColoredTexts}
            className="mt-3 w-full px-3 py-1 bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs rounded transition-colors"
          >
            Xóa tất cả màu
          </button>
        </div>
      )}
      
      {/* Paper-like container */}
      <div className="flex justify-center px-4">
        <div className="w-full max-w-5xl">
          <motion.div
            {...fadeInUp}
            className={`rounded-lg sm:rounded-xl shadow-lg transition-colors duration-300 ${
              readingSettings.readingMode 
                ? 'bg-white border-2 border-blue-200' 
                : currentTheme.card
            }`}
            style={{
              backgroundColor: readingSettings.readingMode 
                ? '#fefefe' 
                : readingSettings.theme === 'dark' 
                  ? '#1f2937' 
                  : readingSettings.theme === 'sepia'
                    ? '#fef3c7'
                    : readingSettings.theme === 'focus'
                      ? '#1e293b'
                      : '#fefefe', // Paper white
              backgroundImage: readingSettings.theme === 'light' || readingSettings.readingMode
                ? `repeating-linear-gradient(
                    transparent,
                    transparent 31px,
                    #e5e7eb 31px,
                    #e5e5e7 32px
                  )`
                : 'none',
              backgroundSize: '100% 32px',
              padding: '3rem 4rem',
              margin: '0 auto',
              boxShadow: readingSettings.theme === 'light' || readingSettings.readingMode
                ? '0 0 0 1px #d1d5db, 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
            }}
          >
          {/* Enhanced CSS for text selection and mouse UI */}
          <style>{`
            /* Dynamic text selection based on theme and color mode */
            .smartread-content ::selection {
              background: ${isColorMode 
                ? '#e0e0e0' 
                : readingSettings.theme === 'dark' 
                  ? '#f59e0b' 
                  : readingSettings.theme === 'sepia' 
                    ? '#d97706'
                    : '#3b82f6'} !important;
              color: ${isColorMode 
                ? '#000000'
                : readingSettings.theme === 'dark'
                  ? '#1f2937'
                  : readingSettings.theme === 'sepia'
                    ? 'white'
                    : 'white'} !important;
              text-shadow: none !important;
              border-radius: 3px !important;
            }
            
            .smartread-content ::-moz-selection {
              background: ${isColorMode 
                ? '#e0e0e0' 
                : readingSettings.theme === 'dark' 
                  ? '#f59e0b' 
                  : readingSettings.theme === 'sepia' 
                    ? '#d97706'
                    : '#3b82f6'} !important;
              color: ${isColorMode 
                ? '#000000'
                : readingSettings.theme === 'dark'
                  ? '#1f2937'
                  : readingSettings.theme === 'sepia'
                    ? 'white'
                    : 'white'} !important;
              text-shadow: none !important;
              border-radius: 3px !important;
            }
            
            .smartread-content ::-webkit-selection {
              background: ${isColorMode 
                ? '#e0e0e0' 
                : readingSettings.theme === 'dark' 
                  ? '#f59e0b' 
                  : readingSettings.theme === 'sepia' 
                    ? '#d97706'
                    : '#3b82f6'} !important;
              color: ${isColorMode 
                ? '#000000'
                : readingSettings.theme === 'dark'
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

            {/* Paper-like text styling */}
            <style>{`
              .paper-text {
                color: ${readingSettings.theme === 'dark' 
                  ? '#e5e7eb' 
                  : readingSettings.theme === 'sepia'
                    ? '#92400e'
                    : readingSettings.theme === 'focus'
                      ? '#e2e8f0'
                      : '#1f2937'};
                text-shadow: ${readingSettings.theme === 'light' || readingSettings.readingMode
                  ? '0 1px 2px rgba(0, 0, 0, 0.05)'
                  : 'none'};
                word-wrap: break-word;
                word-break: normal;
                white-space: normal;
                overflow-wrap: break-word;
              }
            `}</style>

            {/* Paper-like text content */}
            <div 
              ref={contentRef}
              className={`paper-text smartread-content max-w-none leading-relaxed transition-all duration-300 ${currentFontFamily.class} ${getTextFormattingClasses} select-text px-4 py-4 ${
                isColorMode ? 'cursor-crosshair' : 'cursor-text'
              }`}
              style={{
                fontSize: `${readingSettings.fontSize}px`,
                lineHeight: '1.6',
                fontFamily: readingSettings.fontFamily === 'system' ? 'system-ui, -apple-system, sans-serif' : undefined,
                ...getHighlightStyle,
                maxWidth: 'none', // Remove width constraint
                margin: '0 auto'
              }}
              onMouseUp={handleMouseUp}
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
    </div>
  );
});

export default ReadingContent;
