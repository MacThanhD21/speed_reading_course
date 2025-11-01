import GeminiApiKey from '../models/GeminiApiKey.js';

// Use node-fetch if fetch is not available (Node.js < 18)
let fetch;
try {
  fetch = globalThis.fetch;
} catch (e) {
  // Fallback for older Node.js versions - would need to install node-fetch
  console.warn('fetch not available, using dynamic import');
}

/**
 * Test health của một API key bằng cách gọi Gemini API
 */
const testApiKeyHealth = async (apiKey) => {
  // Dynamic import fetch if not available
  if (!fetch) {
    try {
      const nodeFetch = await import('node-fetch');
      fetch = nodeFetch.default;
    } catch (e) {
      throw new Error('fetch is not available. Please install node-fetch or use Node.js 18+');
    }
  }
  try {
    const testUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
    
    const response = await fetch(testUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: 'Test'
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 10,
        }
      }),
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });

    if (response.ok) {
      return {
        status: 'healthy',
        message: 'API key hoạt động tốt',
      };
    } else if (response.status === 429) {
      return {
        status: 'rate_limited',
        message: 'API key đã vượt quá rate limit',
      };
    } else if (response.status === 403) {
      return {
        status: 'error',
        message: 'API key không hợp lệ hoặc không có quyền',
      };
    } else {
      const errorText = await response.text();
      return {
        status: 'error',
        message: `Lỗi ${response.status}: ${errorText.substring(0, 100)}`,
      };
    }
  } catch (error) {
    return {
      status: 'error',
      message: error.message || 'Không thể kiểm tra API key',
    };
  }
};

// @desc    Get all API keys
// @route   GET /api/admin/api-keys
// @access  Private/Admin
export const getApiKeys = async (req, res) => {
  try {
    const keys = await GeminiApiKey.find().sort({ createdAt: -1 });
    
    // Mask keys for security
    const safeKeys = keys.map(key => ({
      ...key.toObject(),
      key: key.getMaskedKey(),
      fullKey: key.key, // Include full key for admin (will be sent but not displayed in UI)
    }));

    res.json({
      success: true,
      data: safeKeys,
      total: keys.length,
      active: keys.filter(k => k.isActive).length,
      healthy: keys.filter(k => k.healthStatus === 'healthy').length,
    });
  } catch (error) {
    console.error('Get API keys error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi server khi lấy danh sách API keys',
    });
  }
};

// @desc    Get single API key
// @route   GET /api/admin/api-keys/:id
// @access  Private/Admin
export const getApiKey = async (req, res) => {
  try {
    const key = await GeminiApiKey.findById(req.params.id);

    if (!key) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy API key',
      });
    }

    res.json({
      success: true,
      data: {
        ...key.toObject(),
        key: key.getMaskedKey(),
        fullKey: key.key,
      },
    });
  } catch (error) {
    console.error('Get API key error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi server',
    });
  }
};

// @desc    Create new API key
// @route   POST /api/admin/api-keys
// @access  Private/Admin
export const createApiKey = async (req, res) => {
  try {
    const { key, name, description, isActive } = req.body;

    if (!key) {
      return res.status(400).json({
        success: false,
        message: 'API key là bắt buộc',
      });
    }

    // Validate key format (should start with AIza)
    if (!key.startsWith('AIza')) {
      return res.status(400).json({
        success: false,
        message: 'API key không đúng định dạng (phải bắt đầu bằng AIza)',
      });
    }

    // Check if key already exists
    const existingKey = await GeminiApiKey.findOne({ key });
    if (existingKey) {
      return res.status(400).json({
        success: false,
        message: 'API key này đã tồn tại',
      });
    }

    // Test health of new key
    const healthCheck = await testApiKeyHealth(key);
    
    const apiKey = await GeminiApiKey.create({
      key,
      name: name || 'Gemini API Key',
      description: description || '',
      isActive: isActive !== undefined ? isActive : true,
      healthStatus: healthCheck.status,
      lastChecked: new Date(),
      lastError: healthCheck.status === 'error' ? healthCheck.message : null,
      createdBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: 'Đã tạo API key thành công',
      data: {
        ...apiKey.toObject(),
        key: apiKey.getMaskedKey(),
        healthCheck,
      },
    });
  } catch (error) {
    console.error('Create API key error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'API key này đã tồn tại',
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi server khi tạo API key',
    });
  }
};

// @desc    Update API key
// @route   PUT /api/admin/api-keys/:id
// @access  Private/Admin
export const updateApiKey = async (req, res) => {
  try {
    const { name, description, isActive } = req.body;

    const apiKey = await GeminiApiKey.findById(req.params.id);

    if (!apiKey) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy API key',
      });
    }

    if (name !== undefined) apiKey.name = name;
    if (description !== undefined) apiKey.description = description;
    if (isActive !== undefined) apiKey.isActive = isActive;

    await apiKey.save();

    res.json({
      success: true,
      message: 'Đã cập nhật API key thành công',
      data: {
        ...apiKey.toObject(),
        key: apiKey.getMaskedKey(),
      },
    });
  } catch (error) {
    console.error('Update API key error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi server khi cập nhật',
    });
  }
};

// @desc    Delete API key
// @route   DELETE /api/admin/api-keys/:id
// @access  Private/Admin
export const deleteApiKey = async (req, res) => {
  try {
    const apiKey = await GeminiApiKey.findById(req.params.id);

    if (!apiKey) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy API key',
      });
    }

    await apiKey.deleteOne();

    res.json({
      success: true,
      message: 'Đã xóa API key thành công',
    });
  } catch (error) {
    console.error('Delete API key error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi server khi xóa',
    });
  }
};

// @desc    Test API key health
// @route   POST /api/admin/api-keys/:id/test
// @access  Private/Admin
export const testApiKey = async (req, res) => {
  try {
    const apiKey = await GeminiApiKey.findById(req.params.id);

    if (!apiKey) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy API key',
      });
    }

    // Test health
    const healthCheck = await testApiKeyHealth(apiKey.key);

    // Update key status
    apiKey.healthStatus = healthCheck.status;
    apiKey.lastChecked = new Date();
    apiKey.lastError = healthCheck.status === 'error' ? healthCheck.message : null;
    
    if (healthCheck.status === 'rate_limited') {
      // Set reset time to 1 hour from now
      apiKey.quota.resetAt = new Date(Date.now() + 3600000);
    } else if (healthCheck.status === 'healthy') {
      apiKey.quota.resetAt = null;
    }

    await apiKey.save();

    res.json({
      success: true,
      message: `Kết quả kiểm tra: ${healthCheck.message}`,
      data: {
        healthStatus: healthCheck.status,
        message: healthCheck.message,
        lastChecked: apiKey.lastChecked,
      },
    });
  } catch (error) {
    console.error('Test API key error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi server khi kiểm tra',
    });
  }
};

// @desc    Test all API keys health
// @route   POST /api/admin/api-keys/test-all
// @access  Private/Admin
export const testAllApiKeys = async (req, res) => {
  try {
    const keys = await GeminiApiKey.find({ isActive: true });
    
    const results = await Promise.all(
      keys.map(async (key) => {
        const healthCheck = await testApiKeyHealth(key.key);
        
        // Update key status
        key.healthStatus = healthCheck.status;
        key.lastChecked = new Date();
        key.lastError = healthCheck.status === 'error' ? healthCheck.message : null;
        
        if (healthCheck.status === 'rate_limited') {
          key.quota.resetAt = new Date(Date.now() + 3600000);
        } else if (healthCheck.status === 'healthy') {
          key.quota.resetAt = null;
        }

        await key.save();

        return {
          id: key._id,
          name: key.name,
          status: healthCheck.status,
          message: healthCheck.message,
        };
      })
    );

    res.json({
      success: true,
      message: `Đã kiểm tra ${results.length} API keys`,
      data: results,
    });
  } catch (error) {
    console.error('Test all API keys error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi server khi kiểm tra',
    });
  }
};

