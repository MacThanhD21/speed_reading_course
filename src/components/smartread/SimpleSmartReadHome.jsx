import React from 'react';

const SimpleSmartReadHome = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-800 mb-4">
            SmartRead
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Đo tốc độ đọc thực tế và kiểm tra khả năng hiểu biết của bạn
          </p>
        </div>

        {/* Quick Tip */}
        <div className="bg-blue-100 border-l-4 border-blue-500 p-4 mb-8 rounded-r-lg">
          <p className="text-blue-800 font-medium">
            💡 <strong>Mẹo:</strong> Để có kết quả tốt nhất, hãy đọc ở nơi yên tĩnh và sử dụng tai nghe nếu cần thiết.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {/* Demo */}
          <div 
            className="bg-white rounded-xl shadow-lg p-6 cursor-pointer hover:shadow-xl transition-all duration-300"
            onClick={() => onNavigate('demo')}
          >
            <div className="text-center">
              <div className="mb-4 flex justify-center">
                <div className="text-4xl text-red-600">🚀</div>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Demo
              </h3>
              <p className="text-gray-600 text-sm">
                Xem demo và thông tin về SmartRead
              </p>
            </div>
          </div>

          {/* AI Test */}
          <div 
            className="bg-white rounded-xl shadow-lg p-6 cursor-pointer hover:shadow-xl transition-all duration-300"
            onClick={() => onNavigate('ai-test')}
          >
            <div className="text-center">
              <div className="mb-4 flex justify-center">
                <div className="text-4xl text-purple-600">🤖</div>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                AI Test
              </h3>
              <p className="text-gray-600 text-sm">
                Test chức năng tạo câu hỏi bằng AI
              </p>
            </div>
          </div>

          {/* Gemini Test */}
          <div 
            className="bg-white rounded-xl shadow-lg p-6 cursor-pointer hover:shadow-xl transition-all duration-300"
            onClick={() => onNavigate('gemini-test')}
          >
            <div className="text-center">
              <div className="mb-4 flex justify-center">
                <div className="text-4xl text-blue-600">🧠</div>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Gemini Test
              </h3>
              <p className="text-gray-600 text-sm">
                Test kết nối Gemini API
              </p>
            </div>
          </div>

          {/* Env Debug */}
          <div 
            className="bg-white rounded-xl shadow-lg p-6 cursor-pointer hover:shadow-xl transition-all duration-300"
            onClick={() => onNavigate('env-debug')}
          >
            <div className="text-center">
              <div className="mb-4 flex justify-center">
                <div className="text-4xl text-orange-600">🔧</div>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Env Debug
              </h3>
              <p className="text-gray-600 text-sm">
                Debug environment variables
              </p>
            </div>
          </div>

          {/* Paste Text */}
          <div 
            className="bg-white rounded-xl shadow-lg p-6 cursor-pointer hover:shadow-xl transition-all duration-300"
            onClick={() => onNavigate('paste-text')}
          >
            <div className="text-center">
              <div className="mb-4 flex justify-center">
                <div className="text-4xl text-blue-600">📄</div>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Dán văn bản
              </h3>
              <p className="text-gray-600 text-sm">
                Dán nội dung bài đọc để đo tốc độ đọc
              </p>
            </div>
          </div>

          {/* URL */}
          <div 
            className="bg-white rounded-xl shadow-lg p-6 cursor-pointer hover:shadow-xl transition-all duration-300"
            onClick={() => onNavigate('paste-url')}
          >
            <div className="text-center">
              <div className="mb-4 flex justify-center">
                <div className="text-4xl text-green-600">🔗</div>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Nhập URL
              </h3>
              <p className="text-gray-600 text-sm">
                Nhập link bài viết để tự động trích xuất nội dung
              </p>
            </div>
          </div>

          {/* Upload */}
          <div 
            className="bg-white rounded-xl shadow-lg p-6 cursor-pointer hover:shadow-xl transition-all duration-300"
            onClick={() => onNavigate('upload-file')}
          >
            <div className="text-center">
              <div className="mb-4 flex justify-center">
                <div className="text-4xl text-purple-600">📤</div>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Tải file
              </h3>
              <p className="text-gray-600 text-sm">
                Tải lên file văn bản để đọc
              </p>
            </div>
          </div>

          {/* History */}
          <div 
            className="bg-white rounded-xl shadow-lg p-6 cursor-pointer hover:shadow-xl transition-all duration-300"
            onClick={() => onNavigate('history')}
          >
            <div className="text-center">
              <div className="mb-4 flex justify-center">
                <div className="text-4xl text-orange-600">📊</div>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Lịch sử
              </h3>
              <p className="text-gray-600 text-sm">
                Xem lại các phiên đọc trước đó
              </p>
            </div>
          </div>

          {/* Settings */}
          <div 
            className="bg-white rounded-xl shadow-lg p-6 cursor-pointer hover:shadow-xl transition-all duration-300"
            onClick={() => onNavigate('settings')}
          >
            <div className="text-center">
              <div className="mb-4 flex justify-center">
                <div className="text-4xl text-gray-600">⚙️</div>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Cài đặt
              </h3>
              <p className="text-gray-600 text-sm">
                Tùy chỉnh giao diện và cài đặt
              </p>
            </div>
          </div>
        </div>

        {/* How it works */}
        <div className="mt-16 bg-white rounded-xl shadow-lg p-8 max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            Cách hoạt động
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-600 font-bold">1</span>
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Dán văn bản</h3>
              <p className="text-gray-600 text-sm">Dán nội dung bài đọc hoặc nhập URL</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-green-600 font-bold">2</span>
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Đọc và đo tốc độ</h3>
              <p className="text-gray-600 text-sm">Đọc văn bản và theo dõi tốc độ WPM trực tiếp</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-purple-600 font-bold">3</span>
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Kiểm tra hiểu biết</h3>
              <p className="text-gray-600 text-sm">Làm bài kiểm tra tự động để đánh giá khả năng hiểu</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleSmartReadHome;
