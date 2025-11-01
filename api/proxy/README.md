# API Proxy Functions (Vercel Serverless)

⚠️ **LƯU Ý**: Các file trong thư mục này là Vercel serverless functions, nhưng hiện tại **KHÔNG được sử dụng** trong production.

Frontend đã chuyển sang gọi trực tiếp Gemini API từ client-side qua `geminiService.js`.

## Bảo mật API Keys

**QUAN TRỌNG**: 
- ❌ **KHÔNG** hardcode API keys trong source code
- ✅ **CHỈ** sử dụng environment variables
- ✅ Đảm bảo file `.env` đã được thêm vào `.gitignore`

## Cấu hình

Nếu cần sử dụng các functions này, cấu hình trong Vercel Dashboard hoặc `.env`:

```bash
GEMINI_API_KEYS=key1,key2,key3
```

## Files

- `generate-quiz.js`: Tạo quiz từ text content (KHÔNG DÙNG)
- `grade-quiz.js`: Chấm quiz bằng AI (KHÔNG DÙNG - đã chuyển sang local grading)

