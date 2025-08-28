# 🚀 Sawari.pk Production Deployment Checklist

## ✅ Pre-Deployment Setup

### 📊 Database Setup
- [ ] Create MongoDB Atlas account (https://cloud.mongodb.com)
- [ ] Create a new cluster
- [ ] Create database user with strong password
- [ ] Whitelist IP addresses (0.0.0.0/0 for all IPs or specific IPs)
- [ ] Get connection string
- [ ] Test database connection locally

### 🔐 Security Configuration
- [ ] Generate secure JWT secret (256-bit)
  ```bash
  node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
  ```
- [ ] Set up production email account
- [ ] Enable 2FA on email account
- [ ] Generate app-specific password for email

### 📁 Environment Files
- [ ] Copy `.env.production.example` to `.env.production` (backend)
- [ ] Copy `.env.production.example` to `.env.production` (frontend)
- [ ] Update all environment variables with production values
- [ ] Never commit .env files with real credentials

## 🚀 Backend Deployment

### Option 1: Railway (Recommended)
- [ ] Connect GitHub repository to Railway
- [ ] Set root directory to `backend`
- [ ] Add all environment variables in Railway dashboard
- [ ] Deploy and test API endpoints

### Option 2: Render
- [ ] Create new Web Service on Render
- [ ] Connect GitHub repository
- [ ] Set root directory to `backend`
- [ ] Set build command: `npm install`
- [ ] Set start command: `npm start`
- [ ] Add environment variables

### Option 3: Heroku
- [ ] Create Heroku app
- [ ] Add Heroku Git remote
- [ ] Deploy backend subfolder
  ```bash
  git subtree push --prefix backend heroku main
  ```
- [ ] Add environment variables via Heroku CLI or dashboard

## 🌐 Frontend Deployment

### Option 1: Vercel (Recommended)
- [ ] Connect GitHub repository to Vercel
- [ ] Set root directory to `frontend`
- [ ] Set build command: `npm run build`
- [ ] Set output directory: `dist`
- [ ] Add `VITE_API_BASE_URL` environment variable
- [ ] Deploy and test

### Option 2: Netlify
- [ ] Connect GitHub repository to Netlify
- [ ] Set base directory: `frontend`
- [ ] Set build command: `npm run build`
- [ ] Set publish directory: `dist`
- [ ] Add environment variables

## 🔍 Post-Deployment Testing

### Backend API Testing
- [ ] Test health check endpoint: `GET /`
- [ ] Test passenger registration: `POST /api/passengers/register`
- [ ] Test passenger login: `POST /api/passengers/login`
- [ ] Test captain registration: `POST /api/captain/register`
- [ ] Test captain login: `POST /api/captain/login`
- [ ] Test email sending functionality

### Frontend Testing
- [ ] Test all pages load correctly
- [ ] Test passenger registration flow
- [ ] Test passenger login flow  
- [ ] Test captain registration flow
- [ ] Test captain login flow
- [ ] Test responsive design on mobile
- [ ] Test email verification flow
- [ ] Test password reset flow

### Integration Testing
- [ ] Test API calls from frontend to backend
- [ ] Test CORS configuration
- [ ] Test authentication flow end-to-end
- [ ] Test error handling
- [ ] Verify email delivery

## 🛡️ Security Verification
- [ ] Ensure HTTPS is enabled
- [ ] Verify JWT tokens are secure
- [ ] Check CORS settings
- [ ] Verify no sensitive data in client-side code
- [ ] Test authentication middleware
- [ ] Verify input validation works

## 📊 Performance & Monitoring
- [ ] Set up error monitoring (Sentry)
- [ ] Set up uptime monitoring
- [ ] Test loading speeds
- [ ] Verify database performance
- [ ] Set up logging

## 🎯 Go-Live Checklist
- [ ] Update DNS if using custom domain
- [ ] Verify SSL certificate
- [ ] Test all critical user flows
- [ ] Verify email templates render correctly
- [ ] Test cross-browser compatibility
- [ ] Announce launch! 🎉

## 📞 Support & Maintenance
- [ ] Document production URLs
- [ ] Set up backup procedures
- [ ] Plan regular security updates
- [ ] Monitor application performance
- [ ] Plan scaling strategies

---

**🎉 Congratulations! Your Sawari.pk application is now live in production!**

For support: https://gauravkhatriweb.bio