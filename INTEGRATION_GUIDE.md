# GearGuard Frontend-Backend Integration

## 🚀 Setup Complete!

Your GearGuard application now has full frontend-backend integration with real authentication.

## 🔧 What's Been Implemented

### Backend (Port 5000)
- ✅ MySQL database connection to `gearguard` database
- ✅ User authentication with JWT tokens
- ✅ Password hashing with bcryptjs
- ✅ API endpoints:
  - `POST /api/auth/signup` - User registration
  - `POST /api/auth/signin` - User login
  - `GET /api/auth/profile` - Get user profile (protected)
  - `POST /api/auth/logout` - User logout (protected)
  - `GET /api/health` - Health check

### Frontend (Port 5174)
- ✅ Real API integration with axios
- ✅ JWT token management
- ✅ Automatic token refresh and error handling
- ✅ Updated authentication forms
- ✅ Protected routes with authentication checks

## 🧪 Testing the Integration

### 1. Access the Application
- Frontend: http://localhost:5174
- Backend API: http://localhost:5000/api

### 2. Test User Registration
1. Go to http://localhost:5174/register
2. Fill in the form:
   - Name: Your Full Name
   - Email: your@email.com
   - Password: password123 (minimum 6 characters)
   - Confirm Password: password123
3. Click "Create Account"
4. You should see a success message

### 3. Test User Login
1. Go to http://localhost:5174/login
2. Use the credentials you just created
3. Click "Sign In"
4. You should be redirected to the dashboard

### 4. Test Protected Routes
- Once logged in, you can access all protected pages
- Try logging out and accessing a protected route - you'll be redirected to login

## 🔍 API Testing

You can test the API directly using tools like Postman or curl:

### Health Check
```bash
curl http://localhost:5000/api/health
```

### Register User
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'
```

### Login User
```bash
curl -X POST http://localhost:5000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

## 🗄️ Database

The application uses your MySQL database `gearguard` with the following user table structure:
- `id` - Auto-increment primary key
- `name` - User's full name
- `email` - Unique email address
- `password_hash` - Encrypted password
- `avatar_url` - Profile picture URL (optional)
- `is_active` - Account status
- `created_at` - Registration timestamp
- `updated_at` - Last update timestamp

## 🔐 Security Features

- ✅ Password hashing with bcryptjs (12 salt rounds)
- ✅ JWT tokens with 7-day expiration
- ✅ Automatic token validation
- ✅ Protected API routes
- ✅ CORS configuration for frontend
- ✅ Input validation and sanitization

## 🚨 Troubleshooting

### Backend Issues
- Make sure MySQL is running and `gearguard` database exists
- Check database credentials in `backend/.env`
- Verify backend is running on port 5000

### Frontend Issues
- Make sure frontend is running on port 5174
- Check browser console for any errors
- Verify API calls are reaching the backend

### Database Connection Issues
- Ensure MySQL service is running
- Check database credentials (username: root, password: 2712)
- Verify database name is `gearguard`

## 📝 Next Steps

Your authentication system is now fully functional! You can:

1. **Add more user fields** - Extend the user model with roles, departments, etc.
2. **Implement password reset** - Add forgot password functionality
3. **Add user management** - Admin panel for managing users
4. **Extend API** - Add endpoints for equipment, maintenance requests, etc.
5. **Add file uploads** - Profile pictures and document attachments

## 🎉 Success!

Your GearGuard application now has a complete authentication system with real database integration. Users can register, login, and access protected areas of your application!