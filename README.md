# 📚 Speed Reading Website

A comprehensive speed reading platform with SmartRead feature, user authentication, and admin panel.

## ✨ Features

- 🚀 **SmartRead**: AI-powered reading sessions with quiz system
- 👥 **User Authentication**: Registration, login, and profile management
- 📊 **Admin Panel**: Comprehensive dashboard with statistics and user management
- 📝 **Contact Form**: User inquiry management
- 🎯 **Reading Analytics**: WPM, REI, RCI tracking
- 🤖 **AI Integration**: Gemini API for quiz generation and grading

## 🛠️ Tech Stack

### Frontend
- React + Vite
- Tailwind CSS
- Framer Motion
- React Router DOM
- Recharts

### Backend
- Node.js + Express
- MongoDB Atlas
- JWT Authentication
- Mongoose ODM

## 📦 Installation

### Prerequisites
- Node.js (v18 or higher)
- MongoDB Atlas account
- Gemini API keys

### Setup Instructions

1. **Clone the repository**
```bash
git clone <repository-url>
cd website_speed_reading
```

2. **Install frontend dependencies**
```bash
npm install
```

3. **Install backend dependencies**
```bash
cd server
npm install
cd ..
```

4. **Configure environment variables**

   **Frontend**: Create `.env` in root directory
   ```env
   VITE_API_URL=/api
   ```

   **Backend**: Create `.env` in `server/` directory
   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   BASE_URL=https://api.yourdomain.com
   GEMINI_API_KEY_1=your_gemini_api_key_1
   GEMINI_API_KEY_2=your_gemini_api_key_2
   ```

   See `.env.example` for complete configuration template.

5. **Start development servers**

   **Backend** (Terminal 1):
   ```bash
   cd server
   npm start
   ```

   **Frontend** (Terminal 2):
   ```bash
   npm run dev
   ```

## 📖 Documentation

- **Backend Setup**: See `BACKEND_SETUP_GUIDE.md`
- **Environment Configuration**: See `ENVIRONMENT_CONFIGURATION.md`
- **Admin Setup**: See `QUICK_ADMIN_SETUP.md`
- **SmartRead Backend**: See `SMARTREAD_BACKEND_SUMMARY.md`

## 🌐 Deployment

### Frontend
Build and deploy the `dist/` folder to your hosting service (Vercel, Netlify, etc.)
```bash
npm run build
```

### Backend
Deploy the `server/` directory to your hosting service (Railway, Render, Heroku, etc.)

**Important**: Set environment variables on your hosting platform before deploying.

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### SmartRead
- `POST /api/smartread/sessions` - Create reading session
- `GET /api/smartread/sessions` - Get reading history
- `POST /api/smartread/quiz-results` - Save quiz result
- `GET /api/smartread/stats` - Get user statistics

### Admin
- `GET /api/admin/dashboard` - Dashboard statistics
- `GET /api/admin/users` - Get all users
- `POST /api/admin/users` - Create new user
- `PUT /api/admin/users/:id` - Update user
- `DELETE /api/admin/users/:id` - Delete user

See `server/README.md` for complete API documentation.

## 🔐 Security

- JWT-based authentication
- Password hashing with bcrypt
- CORS configuration
- Environment variable protection
- Admin route protection

## 📄 License

MIT License

## 👥 Contributing

Contributions are welcome! Please open an issue or submit a pull request.
