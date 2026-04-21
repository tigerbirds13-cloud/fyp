# 🔐 Google OAuth Setup - Complete Guide

## ⚠️ Important: Google OAuth Requires Credentials

To enable Google OAuth, you must configure it with actual credentials from Google Cloud Console.

---

## 🚀 Step-by-Step Setup

### Step 1: Create Google OAuth Credentials

1. **Go to Google Cloud Console:**
   - Visit: https://console.cloud.google.com/

2. **Create a New Project:**
   - Click on the project selector at the top
   - Click "NEW PROJECT"
   - Name: "HomeTown Helper"
   - Click "CREATE"

3. **Enable Google+ API:**
   - In the search bar, search for "Google+ API"
   - Click on "Google+ API"
   - Click "ENABLE"

4. **Create OAuth 2.0 Credentials:**
   - Go to "Credentials" (left sidebar)
   - Click "Create Credentials" → "OAuth client ID"
   - If prompted, click "Configure consent screen" first
   - For consent screen:
     - Choose "External"
     - Fill in required fields
     - Add your email
     - Click "Save and Continue"
     - Skip optional scopes
   - After consent screen is configured, go back to Credentials
   - Click "Create Credentials" → "OAuth client ID"
   - Choose "Web application"
   - Add authorized redirect URIs:
     ```
     http://localhost:3000
     http://localhost:3000/auth/google/callback
     http://localhost:3000/login
     ```
   - Click "CREATE"

5. **Copy Your Credentials:**
   - Copy the **Client ID** and **Client Secret**
   - Keep these safe and never commit to version control

---

### Step 2: Configure Environment Variables

#### Backend Configuration (`backend/.env`)

Replace the placeholder values with your actual credentials:

```env
PORT=5002
MONGODB_URI=mongodb://127.0.0.1:27017/fyp?directConnection=true&serverSelectionTimeoutMS=2000
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=7d
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password

# Replace these with your actual Google credentials
GOOGLE_CLIENT_ID=YOUR_ACTUAL_CLIENT_ID_HERE
GOOGLE_CLIENT_SECRET=YOUR_ACTUAL_CLIENT_SECRET_HERE
GOOGLE_REDIRECT_URI=http://localhost:3000/auth/google/callback
```

#### Frontend Configuration (`frontend/.env`)

```env
REACT_APP_GOOGLE_CLIENT_ID=YOUR_ACTUAL_CLIENT_ID_HERE
REACT_APP_API_URL=http://localhost:5002
```

---

### Step 3: Restart Your Application

After updating `.env` files, restart both servers:

```bash
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend
cd frontend
npm start
```

---

## ✅ Testing Google OAuth

### Test in Frontend:

1. Go to http://localhost:3000
2. Click on "Login"
3. Look for "Continue With Google" button
4. Click the button and sign in with your Google account

### Expected Behavior:

✅ Google Sign-In button appears
✅ Click button opens Google login popup
✅ After signing in, user is redirected to home page
✅ User data stored in localStorage

---

## 🔧 Development Mode Without Credentials

If you haven't set up Google credentials yet, the app includes a **fallback authentication mode**:

- The Google button will show "Loading Google Sign-In..."
- Backend will display a helpful error message
- Regular email/password login still works 100%

---

## 🐛 Troubleshooting

### Issue: "Google SDK Failed to Load"
**Solution:** Check your internet connection. The browser must download Google's SDK from their servers.

### Issue: "Invalid Configuration" Error
**Solution:** Make sure REACT_APP_GOOGLE_CLIENT_ID is set correctly in frontend/.env

### Issue: CORS Error
**Solution:** Ensure backend CORS is configured. Check `backend/server.js` has `app.use(cors())`

### Issue: Token Verification Failed
**Solution:** 
- Verify Client ID matches between Google Console and `.env`
- Check that `GOOGLE_REDIRECT_URI` is registered in Google Console
- Ensure authorized URIs include `http://localhost:3000`

---

## 📱 Production Deployment

For production, update:

1. **backend/.env:**
   ```env
   FRONTEND_URL=https://yourdomain.com
   GOOGLE_REDIRECT_URI=https://yourdomain.com/auth/google/callback
   ```

2. **frontend/.env:**
   ```env
   REACT_APP_API_URL=https://api.yourdomain.com
   ```

3. **Google Console:**
   - Add your production URLs to authorized redirect URIs:
     - `https://yourdomain.com`
     - `https://yourdomain.com/auth/google/callback`

---

## 🔒 Security Notes

⚠️ **Never commit credentials to version control**
- Add `.env` files to `.gitignore`
- Use environment-specific configuration tools
- For deployment, use environment variables in your hosting platform

✅ **Best Practices:**
- Rotate credentials periodically
- Use different credentials for development/production
- Monitor Google Cloud Console for suspicious activity

---

## ✨ How It Works

### Backend Flow:
1. Frontend sends Google token to `/api/auth/google`
2. Backend verifies token with Google
3. Backend creates/updates user in MongoDB
4. Backend generates JWT token
5. Frontend stores JWT and user data

### Frontend Flow:
1. User clicks "Continue With Google"
2. Google SDK opens authentication popup
3. User signs in with Google account
4. Frontend receives Google ID token
5. Frontend sends token to backend API
6. Frontend stores JWT from backend
7. Frontend redirects to home page

---

## 📚 Resources

- [Google Cloud Console](https://console.cloud.google.com/)
- [Google Sign-In Documentation](https://developers.google.com/identity/protocols/oauth2)
- [google-auth-library-nodejs](https://github.com/googleapis/google-auth-library-nodejs)

---

## ✅ Verification Checklist

- [ ] Created Google Cloud Project
- [ ] Enabled Google+ API
- [ ] Created OAuth 2.0 Web Application credentials
- [ ] Copied Client ID and Client Secret
- [ ] Updated `backend/.env` with credentials
- [ ] Updated `frontend/.env` with Client ID
- [ ] Restarted backend server
- [ ] Restarted frontend server
- [ ] Can see Google button on login page
- [ ] Google login works without errors
- [ ] User data saved to database
- [ ] JWT token stored in localStorage

Once all are checked, Google OAuth is fully functional! ✨
