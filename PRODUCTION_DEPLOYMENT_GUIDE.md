# 🚀 Production Deployment Guide

## Critical Fixes Applied

### 1. ✅ CORS Configuration Fixed
- Now validates origins from `CORS_ORIGIN` environment variable
- In production, only allows specified origins
- Prevents security vulnerabilities

### 2. ✅ Environment Variables Validation
- Server validates required variables at startup
- Exits gracefully with clear error messages if missing

### 3. ✅ Request Size Limits
- Added `limit: '10mb'` to prevent DoS attacks
- Configurable via environment variables if needed

## Step-by-Step Deployment

### Backend Deployment

#### 1. Set Environment Variables

On your hosting platform (Heroku, Railway, Render, etc.), set:

```env
NODE_ENV=production
PORT=5000
HOST=0.0.0.0
BASE_URL=https://api.yourdomain.com
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/speedreading_admin
JWT_SECRET=generate_a_strong_random_secret_here_at_least_32_characters
CORS_ORIGIN=https://yourdomain.com,https://www.yourdomain.com
GEMINI_API_KEY_1=your_gemini_api_key_1
GEMINI_API_KEY_2=your_gemini_api_key_2
```

**Generate JWT_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Important Notes:**
- `CORS_ORIGIN`: Comma-separated list of allowed frontend URLs (no trailing slash)
- `BASE_URL`: Full URL of your API server (including https://)
- `MONGODB_URI`: Must include database name: `.../speedreading_admin`
- Never commit these values to git!

#### 2. Deploy Backend Code

```bash
cd server
# Deploy to your hosting platform
# The platform will run: npm start
```

#### 3. Verify Backend Deployment

```bash
# Health check
curl https://api.yourdomain.com/api/health

# Should return:
# {"status":"OK","message":"Speed Reading API is running","timestamp":"...","environment":"production"}
```

### Frontend Deployment

#### 1. Create Production Environment File

Create `.env.production` in root directory:

```env
VITE_API_URL=https://api.yourdomain.com/api
```

**Important:** 
- URL must include `/api` at the end
- Must use HTTPS in production
- No trailing slash after `/api`

#### 2. Build Frontend

```bash
npm run build
```

This creates optimized production bundle in `dist/` folder.

#### 3. Deploy Frontend

Deploy the `dist/` folder to your hosting platform:
- **Vercel**: Auto-detects Vite builds
- **Netlify**: Deploy `dist/` folder
- **GitHub Pages**: Use `gh-pages` package

```bash
# Example for Vercel
vercel --prod

# Example for Netlify
netlify deploy --prod --dir=dist
```

#### 4. Verify Frontend Deployment

1. Open production frontend URL
2. Check browser console (F12) - should have no errors
3. Test API connectivity:
   - Try to register/login
   - Check Network tab - API calls should go to your API URL

## Post-Deployment Verification

### 1. Health Checks

**Backend:**
```bash
curl https://api.yourdomain.com/api/health
```

**Frontend:**
- Open browser DevTools → Network tab
- Check if API requests go to correct URL
- Verify no CORS errors

### 2. Test Authentication Flow

1. ✅ User Registration
2. ✅ User Login
3. ✅ Admin Login (if admin exists)
4. ✅ Protected Routes Access

### 3. Test API Endpoints

```bash
# Test registration
curl -X POST https://api.yourdomain.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'

# Test login
curl -X POST https://api.yourdomain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### 4. Check Logs

- Backend logs should show:
  - ✅ MongoDB connected
  - ✅ CORS enabled for your domains
  - ✅ Server running on port
  - ✅ No errors

### 5. Security Checks

- [ ] HTTPS enabled (check browser padlock icon)
- [ ] CORS working (no CORS errors in console)
- [ ] No sensitive data in console logs
- [ ] Error messages don't expose stack traces

## Common Issues & Solutions

### Issue 1: CORS Errors

**Symptom:** Browser console shows CORS policy errors

**Solution:**
- Verify `CORS_ORIGIN` includes your frontend URL exactly (with https://, no trailing slash)
- Check backend logs - should show "CORS enabled for: ..."
- In production, CORS_ORIGIN must be set

### Issue 2: API Calls Fail with 404

**Symptom:** All API calls return 404

**Solution:**
- Verify `VITE_API_URL` is set correctly in `.env.production`
- Rebuild frontend: `npm run build`
- Check API URL in browser Network tab matches backend URL

### Issue 3: Database Connection Fails

**Symptom:** Backend crashes with MongoDB connection error

**Solution:**
- Verify `MONGODB_URI` includes database name: `.../speedreading_admin`
- Check MongoDB Atlas Network Access allows your hosting platform IP
- Verify MongoDB username/password are correct

### Issue 4: Authentication Doesn't Work

**Symptom:** Can't login, tokens invalid

**Solution:**
- Verify `JWT_SECRET` is set and same across all instances (if multiple)
- Check token expiration time
- Clear browser localStorage and try again

### Issue 5: Build Fails

**Symptom:** Frontend build errors

**Solution:**
- Check Node.js version (should be 18+)
- Delete `node_modules` and `package-lock.json`, then `npm install`
- Check for TypeScript/ESLint errors

## Monitoring & Maintenance

### Regular Checks

1. **Error Logs**: Monitor backend error logs daily
2. **Database**: Check connection status
3. **Performance**: Monitor API response times
4. **Security**: Review access logs for suspicious activity

### Backup Strategy

1. **Database**: Set up automated MongoDB Atlas backups
2. **Code**: Use git tags for production releases
3. **Environment**: Document all environment variables

### Updates

1. Keep dependencies updated
2. Test updates in staging environment first
3. Use blue-green deployment when possible

## Emergency Rollback

If something goes wrong:

1. **Backend**: Revert to previous deployment on hosting platform
2. **Frontend**: Rebuild with previous `.env.production` values
3. **Database**: Restore from backup if needed

## Support

- Check `PRODUCTION_CHECKLIST.md` for complete checklist
- Review error logs for specific issues
- Test in staging environment before production

