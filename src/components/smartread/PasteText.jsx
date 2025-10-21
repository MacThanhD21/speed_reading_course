import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaArrowLeft, FaEye, FaPlay } from 'react-icons/fa';

const PasteText = ({ onNavigate, onStartReading }) => {
  const [text, setText] = useState('');
  const [url, setUrl] = useState('');
  const [mode, setMode] = useState('text'); // 'text' or 'url'
  const [preview, setPreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleTextChange = (e) => {
    setText(e.target.value);
  };

  const handleUrlChange = (e) => {
    setUrl(e.target.value);
  };

  const handlePreview = async () => {
    if (mode === 'url' && url) {
      setIsLoading(true);
      try {
        // Simulate URL fetching - in real implementation, this would call an API
        await new Promise(resolve => setTimeout(resolve, 2000));
        setPreview({
          title: "Bài viết mẫu",
          content: "Đây là nội dung bài viết được trích xuất từ URL...",
          wordCount: 500
        });
      } catch (error) {
        console.error('Error fetching URL:', error);
      } finally {
        setIsLoading(false);
      }
    } else if (mode === 'text' && text) {
      const wordCount = text.trim().split(/\s+/).length;
      setPreview({
        title: "Văn bản đã dán",
        content: text,
        wordCount: wordCount
      });
    }
  };

  const handleStartReading = () => {
    const content = mode === 'url' ? preview?.content : text;
    if (content) {
      onStartReading({
        title: preview?.title || "Văn bản đã dán",
        content: content,
        wordCount: preview?.wordCount || text.trim().split(/\s+/).length,
        source: mode === 'url' ? url : 'pasted'
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <button
            onClick={() => onNavigate('home')}
            className="mr-4 p-2 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <FaArrowLeft className="text-xl text-gray-600" />
          </button>
          <h1 className="text-3xl font-bold text-gray-800">
            Nhập nội dung đọc
          </h1>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Mode Selection */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Chọn phương thức nhập
            </h2>
            <div className="flex space-x-4">
              <button
                onClick={() => setMode('text')}
                className={`px-6 py-3 rounded-lg font-medium transition-all ${
                  mode === 'text'
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Dán văn bản
              </button>
              <button
                onClick={() => setMode('url')}
                className={`px-6 py-3 rounded-lg font-medium transition-all ${
                  mode === 'url'
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Nhập URL
              </button>
            </div>
          </div>

          {/* Input Area */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            {mode === 'text' ? (
              <div>
                <label className="block text-lg font-semibold text-gray-800 mb-4">
                  Dán văn bản của bạn
                </label>
                <textarea
                  value={text}
                  onChange={handleTextChange}
                  placeholder="Dán nội dung bài đọc vào đây..."
                  className="smartread-text smartread-content w-full h-64 p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <div className="mt-2 text-sm text-gray-500">
                  Số từ: {text.trim().split(/\s+/).filter(word => word.length > 0).length}
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-lg font-semibold text-gray-800 mb-4">
                  Nhập URL bài viết
                </label>
                <input
                  type="url"
                  value={url}
                  onChange={handleUrlChange}
                  placeholder="https://example.com/article"
                  className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <div className="mt-2 text-sm text-gray-500">
                  Hệ thống sẽ tự động trích xuất nội dung bài viết
                </div>
              </div>
            )}
          </div>

          {/* Preview Button */}
          <div className="text-center mb-6">
            <button
              onClick={handlePreview}
              disabled={isLoading || (mode === 'text' && !text) || (mode === 'url' && !url)}
              className="btn-primary inline-flex items-center px-6 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaEye className="mr-2" />
              {isLoading ? 'Đang xử lý...' : 'Xem trước'}
            </button>
          </div>

          {/* Preview */}
          {preview && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-lg p-6 mb-6"
            >
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                Xem trước
              </h3>
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <h4 className="font-semibold text-gray-800 mb-2">
                  {preview.title}
                </h4>
                <div className="text-sm text-gray-600 mb-2">
                  Số từ: {preview.wordCount}
                </div>
                <div className="smartread-text smartread-content text-gray-700 max-h-32 overflow-y-auto">
                  {preview.content.substring(0, 300)}...
                </div>
              </div>
            </motion.div>
          )}

          {/* Start Reading Button */}
          {preview && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <button
                onClick={handleStartReading}
                className="btn-accent inline-flex items-center px-8 py-4 text-lg"
              >
                <FaPlay className="mr-2" />
                Bắt đầu đọc
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PasteText;
