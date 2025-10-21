import React from 'react';

const EnvDebugComponent = () => {
  const geminiKey = import.meta.env.VITE_GEMINI_API_KEY;
  const openaiKey = import.meta.env.VITE_OPENAI_API_KEY;
  
  console.log('Environment variables debug:');
  console.log('VITE_GEMINI_API_KEY:', geminiKey);
  console.log('VITE_OPENAI_API_KEY:', openaiKey);
  console.log('import.meta.env:', import.meta.env);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Environment Variables Debug</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Current Environment Variables:</h2>
          
          <div className="space-y-4">
            <div className="border p-4 rounded">
              <h3 className="font-medium text-gray-800 mb-2">VITE_GEMINI_API_KEY:</h3>
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${geminiKey ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-sm font-mono">
                  {geminiKey ? `${geminiKey.substring(0, 10)}...` : 'Not found'}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Full value: {geminiKey || 'undefined'}
              </p>
            </div>
            
            <div className="border p-4 rounded">
              <h3 className="font-medium text-gray-800 mb-2">VITE_OPENAI_API_KEY:</h3>
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${openaiKey ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-sm font-mono">
                  {openaiKey ? `${openaiKey.substring(0, 10)}...` : 'Not found'}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Full value: {openaiKey || 'undefined'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">All Environment Variables:</h2>
          <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto">
            {JSON.stringify(import.meta.env, null, 2)}
          </pre>
        </div>

        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-medium text-yellow-800 mb-2">Troubleshooting:</h3>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• Kiểm tra file .env có tồn tại trong thư mục gốc</li>
            <li>• Restart development server sau khi thay đổi .env</li>
            <li>• Đảm bảo variables có prefix VITE_</li>
            <li>• Kiểm tra console để xem debug logs</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default EnvDebugComponent;
