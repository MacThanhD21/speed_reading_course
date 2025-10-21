import { useState, useEffect, useRef, useCallback, useMemo } from 'react';

// Hook for reading state management
export const useReadingState = (content) => {
  const [isReading, setIsReading] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [wordsRead, setWordsRead] = useState(0);
  const [currentWPM, setCurrentWPM] = useState(0);
  const [smoothedWPM, setSmoothedWPM] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [quizStatus, setQuizStatus] = useState('not_started');

  const intervalRef = useRef(null);
  const lastSmoothedWPMRef = useRef(0);

  // Calculate actual word count from content
  const getTotalWordCount = useCallback(() => {
    if (!content?.content) return 0;
    
    const text = content.content;
    // Remove extra whitespace and split by words
    const words = text.trim().split(/\s+/).filter(word => word.length > 0);
    
    // Debug log
    console.log('Total words calculated:', words.length);
    
    return words.length;
  }, [content?.content]);

  // Calculate words visible in viewport based on scroll position
  const calculateWordsRead = useCallback(() => {
    // Only calculate words read when actually reading
    if (!isReading) return 0;
    
    const viewportHeight = window.innerHeight;
    const scrollTop = window.pageYOffset;
    const documentHeight = document.body.scrollHeight;
    
    const totalWords = getTotalWordCount();
    
    if (totalWords === 0) return 0;
    
    // If content fits in viewport, consider all words as read
    if (documentHeight <= viewportHeight) {
      return totalWords;
    }
    
    // Calculate scroll progress (0 to 1)
    const scrollProgress = Math.min(scrollTop / (documentHeight - viewportHeight), 1);
    
    // More accurate estimation: consider that user needs to scroll through content
    // Add some buffer for better UX (user might scroll back)
    const buffer = 0.1; // 10% buffer
    const adjustedProgress = Math.min(scrollProgress + buffer, 1);
    
    // Estimate words read based on scroll progress
    const estimatedWordsRead = Math.floor(totalWords * adjustedProgress);
    
    // Debug log
    console.log('Words calculation:', {
      totalWords,
      scrollProgress: scrollProgress.toFixed(3),
      adjustedProgress: adjustedProgress.toFixed(3),
      estimatedWordsRead,
      scrollTop,
      documentHeight,
      viewportHeight
    });
    
    return Math.max(0, Math.min(estimatedWordsRead, totalWords));
  }, [getTotalWordCount, isReading]);

  // Update WPM calculation
  const updateWPM = useCallback(() => {
    if (!isReading || isPaused || !startTime) return;

    const now = Date.now();
    const elapsed = (now - startTime) / 60000; // Convert to minutes
    
    if (elapsed > 0) {
      const currentWordsRead = calculateWordsRead();
      
      // Always update words read
      setWordsRead(currentWordsRead);
      
      // Calculate WPM based on actual reading time
      const instantWPM = currentWordsRead / elapsed;
      setCurrentWPM(isNaN(instantWPM) ? 0 : instantWPM);
      
      // Apply exponential moving average for smoothing
      const alpha = 0.3; // Balanced alpha for responsive but smooth updates
      const newSmoothedWPM = alpha * instantWPM + (1 - alpha) * lastSmoothedWPMRef.current;
      lastSmoothedWPMRef.current = isNaN(newSmoothedWPM) ? 0 : newSmoothedWPM;
      setSmoothedWPM(Math.round(isNaN(newSmoothedWPM) ? 0 : newSmoothedWPM));
      
      console.log('WPM Update:', {
        currentWordsRead,
        elapsed: elapsed.toFixed(2),
        instantWPM: instantWPM.toFixed(1),
        smoothedWPM: Math.round(newSmoothedWPM)
      });
    }
  }, [isReading, isPaused, startTime, calculateWordsRead]);

  // Timer effect
  useEffect(() => {
    if (isReading && !isPaused) {
      intervalRef.current = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isReading, isPaused]);

  // Update WPM every 1 second for better responsiveness
  useEffect(() => {
    if (isReading && !isPaused) {
      const wpmInterval = setInterval(updateWPM, 1000);
      return () => clearInterval(wpmInterval);
    }
  }, [isReading, isPaused, updateWPM]);

  // Throttled scroll handler for better performance
  const throttledScrollHandler = useCallback(() => {
    let ticking = false;
    
    const updateScroll = () => {
      const newWordsRead = calculateWordsRead();
      if (newWordsRead !== wordsRead) {
        setWordsRead(newWordsRead);
      }
      ticking = false;
    };
    
    return () => {
      if (!ticking) {
        requestAnimationFrame(updateScroll);
        ticking = true;
      }
    };
  }, [calculateWordsRead, wordsRead]);

  // Add scroll listener with throttling
  useEffect(() => {
    const scrollHandler = throttledScrollHandler();
    window.addEventListener('scroll', scrollHandler, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', scrollHandler);
    };
  }, [throttledScrollHandler]);

  // Reading actions
  const startReading = useCallback(() => {
    setIsReading(true);
    setIsPaused(false);
    setStartTime(Date.now());
    lastSmoothedWPMRef.current = 0;
    setElapsedTime(0);
    setWordsRead(0);
    setCurrentWPM(0);
    setSmoothedWPM(0);
  }, []);

  const togglePause = useCallback(() => {
    if (!isReading) return;
    
    if (isPaused) {
      setStartTime(Date.now() - elapsedTime * 1000);
      setIsPaused(false);
    } else {
      setIsPaused(true);
    }
  }, [isReading, isPaused, elapsedTime]);

  const finishReading = useCallback((onFinishReading) => {
    setIsReading(false);
    setIsPaused(false);
    setQuizStatus('in_progress');
    
    const finalWPM = elapsedTime > 0 && wordsRead > 0 ? Math.round(wordsRead / (elapsedTime / 60)) : 0;
    
    onFinishReading({
      finalWPM: finalWPM || 0,
      wordsRead: wordsRead || 0,
      elapsedTime: Math.round(elapsedTime || 0),
      averageWPM: Math.round(smoothedWPM || 0)
    });
  }, [elapsedTime, wordsRead, smoothedWPM]);

  const resetReading = useCallback(() => {
    setIsReading(false);
    setIsPaused(false);
    setStartTime(null);
    setElapsedTime(0);
    setWordsRead(0);
    setCurrentWPM(0);
    setSmoothedWPM(0);
    setQuizStatus('not_started');
    lastSmoothedWPMRef.current = 0;
    
    // Clear any intervals
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    console.log('Reading state reset');
  }, []);

  const handleQuizCompleted = useCallback((onQuizCompleted) => {
    setQuizStatus('completed');
    if (onQuizCompleted) {
      onQuizCompleted();
    }
  }, []);

  // Helper functions
  const getReadingProgress = useCallback(() => {
    if (!isReading) return 'start';
    if (isReading && quizStatus === 'not_started') return 'reading';
    if (quizStatus === 'completed') return 'finished_all';
    return 'finished_reading';
  }, [isReading, quizStatus]);

  const formatTime = useCallback((seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  return {
    // State
    isReading,
    isPaused,
    elapsedTime,
    wordsRead,
    currentWPM,
    smoothedWPM,
    quizStatus,
    
    // Actions
    startReading,
    togglePause,
    finishReading,
    resetReading,
    handleQuizCompleted,
    
    // Helpers
    getReadingProgress,
    formatTime
  };
};

// Hook for reading settings management
export const useReadingSettings = () => {
  const [readingSettings, setReadingSettings] = useState({
    fontSize: 20,
    lineHeight: 'leading-relaxed',
    fontFamily: 'inter',
    theme: 'light',
    readingMode: false,
    textFormatting: {
      bold: false,
      italic: false,
      underline: false,
      highlight: false,
      highlightColor: '#ffff00'
    }
  });

  // Memoized options
  const fontSizeOptions = useMemo(() => [12, 14, 16, 18, 20, 24, 28, 32, 36, 40, 48, 56, 64, 72, 80, 88, 96, 100], []);
  
  const fontFamilyOptions = useMemo(() => [
    { value: 'inter', label: 'Inter', class: 'font-sans' },
    { value: 'arial', label: 'Arial', class: 'font-sans' },
    { value: 'helvetica', label: 'Helvetica', class: 'font-sans' },
    { value: 'times', label: 'Times New Roman', class: 'font-serif' },
    { value: 'georgia', label: 'Georgia', class: 'font-serif' },
    { value: 'courier', label: 'Courier New', class: 'font-mono' },
    { value: 'verdana', label: 'Verdana', class: 'font-sans' },
    { value: 'trebuchet', label: 'Trebuchet MS', class: 'font-sans' },
    { value: 'comic', label: 'Comic Sans MS', class: 'font-sans' },
    { value: 'impact', label: 'Impact', class: 'font-sans' },
    { value: 'system', label: 'System Font', class: 'font-sans' }
  ], []);

  const themeOptions = useMemo(() => [
    { value: 'light', label: 'Sáng', bg: 'bg-white', text: 'text-gray-800', card: 'bg-white' },
    { value: 'dark', label: 'Tối', bg: 'bg-gray-900', text: 'text-gray-100', card: 'bg-gray-800' },
    { value: 'sepia', label: 'Sepia', bg: 'bg-amber-50', text: 'text-amber-900', card: 'bg-amber-100' },
    { value: 'focus', label: 'Tập trung', bg: 'bg-slate-900', text: 'text-slate-100', card: 'bg-slate-800' }
  ], []);

  // Helper functions
  const getCurrentFontSizeIndex = useCallback(() => {
    return fontSizeOptions.indexOf(readingSettings.fontSize);
  }, [fontSizeOptions, readingSettings.fontSize]);

  const increaseFontSize = useCallback(() => {
    const currentIndex = getCurrentFontSizeIndex();
    if (currentIndex < fontSizeOptions.length - 1) {
      setReadingSettings(prev => ({
        ...prev,
        fontSize: fontSizeOptions[currentIndex + 1]
      }));
    }
  }, [fontSizeOptions, getCurrentFontSizeIndex]);

  const decreaseFontSize = useCallback(() => {
    const currentIndex = getCurrentFontSizeIndex();
    if (currentIndex > 0) {
      setReadingSettings(prev => ({
        ...prev,
        fontSize: fontSizeOptions[currentIndex - 1]
      }));
    }
  }, [fontSizeOptions, getCurrentFontSizeIndex]);

  const changeFontFamily = useCallback((fontFamily) => {
    setReadingSettings(prev => ({
      ...prev,
      fontFamily: fontFamily
    }));
  }, []);

  const changeTheme = useCallback((theme) => {
    setReadingSettings(prev => {
      // Only update if theme actually changed
      if (prev.theme === theme) return prev;
      
      return {
        ...prev,
        theme: theme
      };
    });
  }, []);

  const toggleReadingMode = useCallback(() => {
    setReadingSettings(prev => ({
      ...prev,
      readingMode: !prev.readingMode
    }));
  }, []);

  const toggleBold = useCallback(() => {
    setReadingSettings(prev => ({
      ...prev,
      textFormatting: {
        ...prev.textFormatting,
        bold: !prev.textFormatting.bold
      }
    }));
  }, []);

  const toggleItalic = useCallback(() => {
    setReadingSettings(prev => ({
      ...prev,
      textFormatting: {
        ...prev.textFormatting,
        italic: !prev.textFormatting.italic
      }
    }));
  }, []);

  const toggleUnderline = useCallback(() => {
    setReadingSettings(prev => ({
      ...prev,
      textFormatting: {
        ...prev.textFormatting,
        underline: !prev.textFormatting.underline
      }
    }));
  }, []);

  const toggleHighlight = useCallback(() => {
    setReadingSettings(prev => ({
      ...prev,
      textFormatting: {
        ...prev.textFormatting,
        highlight: !prev.textFormatting.highlight
      }
    }));
  }, []);

  const changeHighlightColor = useCallback((color) => {
    setReadingSettings(prev => ({
      ...prev,
      textFormatting: {
        ...prev.textFormatting,
        highlightColor: color
      }
    }));
  }, []);

  const getFontFamilyClass = useCallback(() => {
    const fontOption = fontFamilyOptions.find(f => f.value === readingSettings.fontFamily);
    return fontOption ? fontOption.class : 'font-sans';
  }, [fontFamilyOptions, readingSettings.fontFamily]);

  const getTextFormattingClasses = useMemo(() => {
    const classes = [];
    if (readingSettings.textFormatting.bold) classes.push('font-bold');
    if (readingSettings.textFormatting.italic) classes.push('italic');
    if (readingSettings.textFormatting.underline) classes.push('underline');
    return classes.join(' ');
  }, [readingSettings.textFormatting]);

  const getHighlightStyle = useMemo(() => {
    // Không áp dụng highlight style cho toàn bộ văn bản nữa
    // Chức năng highlight đã được thay thế bằng color mode
    return {};
  }, [readingSettings.textFormatting]);

  const resetSettings = useCallback(() => {
    setReadingSettings({
      fontSize: 20,
      fontFamily: 'inter',
      theme: 'light',
      textFormatting: {
        bold: false,
        italic: false,
        underline: false,
        highlight: false,
        highlightColor: '#ffff00'
      }
    });
  }, []);

  // Memoized computed values
  const currentTheme = useMemo(() => 
    themeOptions.find(t => t.value === readingSettings.theme) || themeOptions[0], 
    [themeOptions, readingSettings.theme]
  );
  
  const currentFontFamily = useMemo(() => 
    fontFamilyOptions.find(f => f.value === readingSettings.fontFamily) || fontFamilyOptions[0],
    [fontFamilyOptions, readingSettings.fontFamily]
  );

  return {
    // State
    readingSettings,
    fontSizeOptions,
    fontFamilyOptions,
    themeOptions,
    currentTheme,
    currentFontFamily,
    
    // Actions
    increaseFontSize,
    decreaseFontSize,
    changeFontFamily,
    changeTheme,
    toggleReadingMode,
    toggleBold,
    toggleItalic,
    toggleUnderline,
    toggleHighlight,
    changeHighlightColor,
    resetSettings,
    
    // Helpers
    getCurrentFontSizeIndex,
    getFontFamilyClass,
    getTextFormattingClasses,
    getHighlightStyle
  };
};
