# 🚀 Production Deployment Checklist

## ⚠️ Critical Issues to Fix Before Deployment

### 1. **CORS Configuration** (CRITICAL - Security Risk)
- **Issue**: Currently allows ALL origins (`app.use(cors())`)
- **Fix**: Configure allowed origins from environment variables
- **Priority**: HIGH - Must fix before production

### 2. **API URL Configuration**
- **Issue**: Frontend uses `/api` as fallback - won't work if frontend/backend on different domains
- **Fix**: Ensure `VITE_API_URL` is set in production environment
- **Priority**: HIGH

### 3. **Environment Variables Validation**
- **Issue**: Missing validation for required environment variables
- **Fix**: Add startup validation
- **Priority**: MEDIUM

### 4. **Error Logging**
- **Issue**: Errors only logged to console
- **Fix**: Add proper logging service (Winston, Pino, etc.)
- **Priority**: MEDIUM

### 5. **Rate Limiting**
- **Issue**: No rate limiting on API endpoints
- **Fix**: Add express-rate-limit
- **Priority**: MEDIUM

## ✅ Pre-Deployment Checklist

### Backend
- [ ] Fix CORS configuration (allow only production frontend domain)
- [ ] Set `NODE_ENV=production`
- [ ] Set `MONGODB_URI` with production database
- [ ] Set `JWT_SECRET` with strong random key
- [ ] Set `BASE_URL` with actual production API URL
- [ ] Set `GEMINI_API_KEY_1` and `GEMINI_API_KEY_2`
- [ ] Verify error handling hides stack traces
- [ ] Test database connection
- [ ] Verify admin user exists or seed one

### Frontend
- [ ] Set `VITE_API_URL` with production API URL
- [ ] Build production bundle: `npm run build`
- [ ] Verify build output in `dist/` folder
- [ ] Test API connectivity
- [ ] Verify environment variables are injected at build time

### Security
- [ ] HTTPS enabled
- [ ] CORS configured correctly
- [ ] Environment variables secured (not in code)
- [ ] JWT secret is strong and unique
- [ ] Password hashing verified (bcrypt)
- [ ] Admin routes protected

### Performance
- [ ] Database indexes created
- [ ] Connection pooling configured
- [ ] Static assets optimized
- [ ] Bundle size optimized

### Monitoring
- [ ] Health check endpoint working (`/api/health`)
- [ ] Error logging configured
- [ ] Database connection monitoring

## 📋 Required Environment Variables

### Backend (.env or hosting platform)
```env
NODE_ENV=production
PORT=5000
HOST=0.0.0.0
BASE_URL=https://api.yourdomain.com
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your_very_strong_secret_here
CORS_ORIGIN=https://yourdomain.com,https://www.yourdomain.com
GEMINI_API_KEY_1=your_key_1
GEMINI_API_KEY_2=your_key_2
```

### Frontend (.env.production)
```env
VITE_API_URL=https://api.yourdomain.com/api
```

## 🔧 Post-Deployment Verification

1. **Health Check**
   ```bash
   curl https://api.yourdomain.com/api/health
   ```

2. **Frontend Loads**
   - Open production frontend URL
   - Verify no console errors
   - Test API calls

3. **Authentication**
   - Test user registration
   - Test user login
   - Test admin login

4. **API Endpoints**
   - Test all protected routes
   - Verify CORS works correctly
   - Test error handling

5. **Database**
   - Verify data persists
   - Check database connection status

## 📝 Notes

- Never commit `.env` files
- Use environment variables from hosting platform
- Regularly rotate API keys and secrets
- Monitor error logs after deployment
- Set up backup strategy for database

