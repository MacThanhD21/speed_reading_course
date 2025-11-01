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
  const [selectedColor, setSelectedColor] = useState('#ff0000');

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
    
    if (selectedText && selectedText.length > 0 && selection.rangeCount > 0) {
      try {
        const range = selection.getRangeAt(0);
        
        const span = document.createElement('span');
        span.style.color = selectedColor;
        span.style.fontWeight = 'bold';
        span.style.display = 'inline';
        
        const contents = range.extractContents();
        span.appendChild(contents);
        range.insertNode(span);
        
        setColoredTexts(prev => [...prev, {
          id: Date.now(),
          text: selectedText,
          color: selectedColor,
          element: span
        }]);
      } catch (error) {
        console.log('Cannot color this selection:', error);
      }
      
      selection.removeAllRanges();
    }
  };

  const clearColoredTexts = () => {
    const coloredElements = contentRef.current?.querySelectorAll('span[style*="color"]');
    coloredElements?.forEach(element => {
      const parent = element.parentNode;
      parent.replaceChild(document.createTextNode(element.textContent), element);
      parent.normalize();
    });
    setColoredTexts([]);
  };

  useEffect(() => {
    setIsColorMode(readingSettings.textFormatting.highlight);
  }, [readingSettings.textFormatting.highlight]);

  // Parse and format text content
  const parseContent = (text) => {
    if (!text) return [];
    
    // Normalize line breaks
    const normalized = text
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .replace(/\n{3,}/g, '\n\n');
    
    // Split by double line breaks for paragraphs
    const paragraphs = normalized
      .split(/\n\n+/)
      .map(p => {
        // Join single line breaks within paragraph with space
        return p.split('\n').map(line => line.trim()).filter(line => line).join(' ');
      })
      .filter(p => p.trim().length > 0);
    
    return paragraphs;
  };

  // Get theme colors
  const getThemeStyles = () => {
    const theme = readingSettings.theme;
    const readingMode = readingSettings.readingMode;
    
    if (readingMode) {
      return {
        bg: '#ffffff',
        text: '#1f2937',
        title: '#1e40af'
      };
    }
    
    switch (theme) {
      case 'dark':
        return {
          bg: '#111827',
          text: '#f3f4f6',
          title: '#fbbf24'
        };
      case 'sepia':
        return {
          bg: '#fef3c7',
          text: '#78350f',
          title: '#92400e'
        };
      case 'focus':
        return {
          bg: '#0f172a',
          text: '#e2e8f0',
          title: '#60a5fa'
        };
      default: // light
        return {
          bg: '#ffffff',
          text: '#1f2937',
          title: '#1e40af'
        };
    }
  };

  const themeStyles = getThemeStyles();
  const textContent = content?.content || content || '';
  const paragraphs = parseContent(textContent);

  return (
    <div className="pt-20 sm:pt-24 md:pt-28 pb-12 sm:pb-16">
      {/* Color Palette */}
      {isColorMode && (
        <div className="fixed top-16 sm:top-20 right-2 sm:right-4 z-50 bg-white rounded-lg shadow-xl p-3 sm:p-4 border max-w-[calc(100vw-1rem)]">
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
                  selectedColor === color ? 'border-gray-800 scale-110' : 'border-gray-300'
                } transition-all`}
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
            className="mt-3 w-full px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs rounded transition-colors"
          >
            Xóa tất cả màu
          </button>
        </div>
      )}
      
      {/* Clean Text Container */}
      <div className="w-full flex justify-center">
        <div className="w-full max-w-3xl mx-4 sm:mx-6 md:mx-8 lg:mx-auto">
          <motion.div
            {...fadeInUp}
            className="rounded-2xl shadow-xl transition-all duration-300"
            style={{
              backgroundColor: themeStyles.bg,
              padding: '3rem 2rem',
              boxShadow: readingSettings.theme === 'dark' || readingSettings.theme === 'focus'
                ? '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2)'
                : '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
            }}
          >
            {/* Text Content */}
            <div 
              ref={contentRef}
              className={`smartread-content transition-all duration-300 ${currentFontFamily.class} ${getTextFormattingClasses} select-text ${
                isColorMode ? 'cursor-crosshair' : 'cursor-text'
              }`}
              style={{
                fontSize: `${readingSettings.fontSize}px`,
                lineHeight: '1.75',
                fontFamily: readingSettings.fontFamily === 'system' 
                  ? 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                  : undefined,
                color: themeStyles.text,
                ...getHighlightStyle,
                textAlign: 'left',
                maxWidth: '100%',
                wordSpacing: '0.05em',
                letterSpacing: '0.01em',
                textRendering: 'optimizeLegibility',
                WebkitFontSmoothing: 'antialiased',
                MozOsxFontSmoothing: 'grayscale'
              }}
              onMouseUp={handleMouseUp}
              tabIndex={0}
            >
              {/* Selection Styles */}
              <style>{`
                .smartread-content ::selection {
                  background: ${readingSettings.theme === 'dark' || readingSettings.theme === 'focus'
                    ? '#f59e0b'
                    : readingSettings.theme === 'sepia'
                      ? '#d97706'
                      : '#3b82f6'} !important;
                  color: ${readingSettings.theme === 'dark' || readingSettings.theme === 'focus'
                    ? '#1f2937'
                    : readingSettings.theme === 'sepia'
                      ? 'white'
                      : 'white'} !important;
                  border-radius: 4px !important;
                }
                
                .smartread-content ::-moz-selection {
                  background: ${readingSettings.theme === 'dark' || readingSettings.theme === 'focus'
                    ? '#f59e0b'
                    : readingSettings.theme === 'sepia'
                      ? '#d97706'
                      : '#3b82f6'} !important;
                  color: ${readingSettings.theme === 'dark' || readingSettings.theme === 'focus'
                    ? '#1f2937'
                    : readingSettings.theme === 'sepia'
                      ? 'white'
                      : 'white'} !important;
                  border-radius: 4px !important;
                }
                
                .smartread-content ::-webkit-selection {
                  background: ${readingSettings.theme === 'dark' || readingSettings.theme === 'focus'
                    ? '#f59e0b'
                    : readingSettings.theme === 'sepia'
                      ? '#d97706'
                      : '#3b82f6'} !important;
                  color: ${readingSettings.theme === 'dark' || readingSettings.theme === 'focus'
                    ? '#1f2937'
                    : readingSettings.theme === 'sepia'
                      ? 'white'
                      : 'white'} !important;
                  border-radius: 4px !important;
                }
              `}</style>

              {paragraphs.map((paragraph, index) => {
                // First paragraph as title if short
                const isTitle = index === 0 && (paragraph.length < 200 || paragraph.split(' ').length < 25);
                
                if (isTitle) {
                  return (
                    <h1 
                      key={`title-${index}`}
                      className="mb-8 sm:mb-10 md:mb-12 text-center font-bold"
                      style={{
                        fontSize: `${Math.min(readingSettings.fontSize * 1.8, 48)}px`,
                        lineHeight: '1.2',
                        color: themeStyles.title,
                        fontWeight: 700,
                        letterSpacing: '-0.02em',
                        marginBottom: '3rem'
                      }}
                    >
                      {paragraph}
                    </h1>
                  );
                }
                
                // Regular paragraphs
                return (
                  <p 
                    key={`para-${index}`}
                    className="mb-6"
                    style={{
                      lineHeight: '1.75',
                      marginBottom: '1.5rem',
                      color: themeStyles.text,
                      textAlign: 'left',
                      wordSpacing: '0.05em',
                      letterSpacing: '0.01em'
                    }}
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