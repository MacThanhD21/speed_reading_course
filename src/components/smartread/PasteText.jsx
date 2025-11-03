import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { FaPlay, FaPaste } from 'react-icons/fa';

const PasteText = ({ onStartReading }) => {
  const [text, setText] = useState('');
  const [isPasting, setIsPasting] = useState(false);
  const textareaRef = useRef(null);

  const handleTextChange = (e) => {
    setText(e.target.value);
  };

  // Handle paste from clipboard
  const handlePasteClick = async () => {
    try {
      setIsPasting(true);
      const clipboardText = await navigator.clipboard.readText();
      setText(clipboardText);
      
      // Focus vào textarea sau khi paste
      if (textareaRef.current) {
        textareaRef.current.focus();
        // Scroll to bottom
        textareaRef.current.scrollTop = textareaRef.current.scrollHeight;
      }
    } catch (error) {
      console.error('Error reading clipboard:', error);
      // Fallback: prompt user to paste manually
      // Silent fail - user can use Ctrl+V instead
      console.warn('Clipboard API not available');
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    } finally {
      setIsPasting(false);
    }
  };

  const handleStartReading = () => {
    const trimmedText = text.trim();
    if (trimmedText) {
      const wordCount = trimmedText.split(/\s+/).filter(word => word.length > 0).length;
      onStartReading({
        title: "Văn bản đã dán",
        content: trimmedText,
        wordCount: wordCount,
        source: 'pasted'
      });
    }
  };

  const wordCount = text.trim().split(/\s+/).filter(word => word.length > 0).length;
  const canStart = wordCount >= 10; // Ít nhất 10 từ

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              Dán nội dung để bắt đầu đọc
            </h1>
            <p className="text-gray-600">
              Dán văn bản của bạn vào đây và bắt đầu luyện tập đọc nhanh ngay
            </p>
          </div>

          {/* Input Area */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <label className="block text-lg font-semibold text-gray-800">
                Nội dung bài đọc
              </label>
              <button
                onClick={handlePasteClick}
                disabled={isPasting}
                className="inline-flex items-center px-4 py-2 bg-blue-50 hover:bg-blue-100 text-[#1A66CC] rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Dán từ clipboard"
              >
                <FaPaste className="mr-2" />
                {isPasting ? 'Đang dán...' : 'Dán'}
              </button>
            </div>
            
            <textarea
              ref={textareaRef}
              value={text}
              onChange={handleTextChange}
              onPaste={(e) => {
                // Auto focus and scroll after paste
                setTimeout(() => {
                  if (textareaRef.current) {
                    textareaRef.current.scrollTop = textareaRef.current.scrollHeight;
                  }
                }, 0);
              }}
              placeholder="Dán nội dung bài đọc vào đây hoặc click nút 'Dán' ở trên..."
              className="smartread-text smartread-content w-full h-80 p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-[#1A66CC] focus:border-transparent outline-none transition-shadow"
              autoFocus
            />
            
            <div className="mt-3 flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Số từ: <span className="font-semibold text-gray-700">{wordCount}</span>
                {wordCount > 0 && (
                  <span className="ml-2 text-xs">
                    ({Math.ceil(wordCount / 200)} phút đọc ước tính)
                  </span>
                )}
              </div>
              {wordCount < 10 && wordCount > 0 && (
                <p className="text-xs text-yellow-600">
                  ⚠️ Cần ít nhất 10 từ để bắt đầu đọc
                </p>
              )}
            </div>
          </div>

          {/* Start Reading Button */}
          <div className="text-center">
            <motion.button
              onClick={handleStartReading}
              disabled={!canStart}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: canStart ? 1 : 0.6 }}
              whileHover={canStart ? { scale: 1.02 } : {}}
              whileTap={canStart ? { scale: 0.98 } : {}}
              className={`inline-flex items-center px-8 py-4 text-lg font-semibold rounded-xl shadow-lg transition-all ${
                canStart
                  ? 'bg-gradient-to-r from-[#1A66CC] to-[#124A9D] hover:from-[#1555B0] hover:to-[#0F3F87] text-white'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <FaPlay className="mr-2" />
              {canStart ? 'Bắt đầu đọc' : `Cần thêm ${10 - wordCount} từ nữa`}
            </motion.button>
            
            {canStart && (
              <p className="mt-4 text-sm text-gray-600">
                💡 Tip: Bạn cũng có thể dán bằng Ctrl+V hoặc click nút "Dán"
              </p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PasteText;
