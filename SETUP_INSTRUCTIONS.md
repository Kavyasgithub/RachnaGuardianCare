# Backend Setup Guide - Rachna Guardian Care

## 🚀 Quick Setup (Step-by-Step)

### Step 1: Install Node.js
Download and install Node.js from https://nodejs.org (LTS version recommended)

### Step 2: Install Dependencies
Open PowerShell/Command Prompt in the backend folder:
```bash
cd backend
npm install
```

### Step 3: Setup MongoDB

**Option A - Local MongoDB (Recommended for Development)**
1. Download MongoDB Community Server: https://www.mongodb.com/try/download/community
2. Install and start MongoDB service
3. Keep default URI in `.env`: `mongodb://localhost:27017/healthcare`

**Option B - MongoDB Atlas (Free Cloud Database)**
1. Create free account: https://www.mongodb.com/cloud/atlas/register
2. Create a new cluster (free tier available)
3. Click "Connect" → "Connect your application"
4. Copy connection string
5. Update `.env` file with your connection string:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/healthcare
   ```

### Step 4: Setup Gmail for Email Notifications

1. Go to your Google Account: https://myaccount.google.com/
2. Security → 2-Step Verification (enable if not already)
3. App Passwords: https://myaccount.google.com/apppasswords
4. Generate new app password for "Mail"
5. Copy the 16-character password
6. Update `.env` file:
   ```
   EMAIL_USER=rgcforyou@gmail.com
   EMAIL_PASSWORD=your-16-char-app-password
   NOTIFICATION_EMAIL=rgcforyou@gmail.com
   ```

### Step 5: Start the Backend Server
```bash
npm start
```

You should see:
```
🚀 Server is running on port 5000
✅ Connected to MongoDB
✅ Email server is ready to send messages
```

### Step 6: Test the Setup

**Test Health Check:**
Open browser: http://localhost:5000/api/health

**Test Form Submission:**
Open your website's index.html and submit the contact form

---

## 📝 Configuration File (.env)

Make sure your `.env` file looks like this:

```env
# MongoDB (choose one)
MONGODB_URI=mongodb://localhost:27017/healthcare
# OR
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/healthcare

# Gmail Configuration
EMAIL_USER=rgcforyou@gmail.com
EMAIL_PASSWORD=abcd efgh ijkl mnop
NOTIFICATION_EMAIL=rgcforyou@gmail.com

# Server Port
PORT=5000
```

---

## ✅ What Happens When Form is Submitted?

1. ✉️ Form data is sent to backend API
2. 💾 Data is saved in MongoDB database
3. 📧 Email notification is sent to `rgcforyou@gmail.com`
4. ✅ Success message shown to user

---

## 🔧 Troubleshooting

**MongoDB Connection Error:**
- Make sure MongoDB service is running
- Check connection string in `.env`

**Email Error:**
- Verify Gmail App Password is correct
- Check 2-Step Verification is enabled
- Ensure no extra spaces in `.env`

**Port Already in Use:**
- Change PORT in `.env` to different number (e.g., 5001)
- Update frontend API URL in script.js

**CORS Error:**
- Backend must be running on http://localhost:5000
- Frontend can be opened as file:// or served on any port

---

## 📊 View Submitted Data

**Get all contacts:**
http://localhost:5000/api/contacts

**Get specific contact:**
http://localhost:5000/api/contacts/:id

---

## 🛠️ Development Mode (Auto-restart)

```bash
npm run dev
```

---

Need help? Check the console logs for detailed error messages!
