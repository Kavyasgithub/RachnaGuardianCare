# Healthcare Backend API

Backend server for Rachna Guardian Care website with MongoDB storage and email notifications.

## Features

- ✅ Store contact form submissions in MongoDB
- ✅ Send email notifications for new submissions
- ✅ RESTful API endpoints
- ✅ CORS enabled for frontend integration

## Setup Instructions

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment Variables

Edit the `.env` file and update:

```env
# For local MongoDB
MONGODB_URI=mongodb://localhost:27017/healthcare

# OR for MongoDB Atlas (cloud)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/healthcare

# Gmail Configuration
EMAIL_USER=rgcforyou@gmail.com
EMAIL_PASSWORD=your-app-password-here
NOTIFICATION_EMAIL=rgcforyou@gmail.com
```

### 3. Get Gmail App Password

1. Go to your Google Account settings
2. Enable 2-Factor Authentication
3. Generate an App Password: https://myaccount.google.com/apppasswords
4. Copy the 16-character password to `.env` file

### 4. Setup MongoDB

**Option A: Local MongoDB**
- Install MongoDB from https://www.mongodb.com/try/download/community
- Start MongoDB service

**Option B: MongoDB Atlas (Free Cloud)**
- Create free account at https://www.mongodb.com/cloud/atlas
- Create a cluster
- Get connection string and update `.env`

### 5. Start Server

```bash
npm start
```

Or for development with auto-restart:

```bash
npm run dev
```

## API Endpoints

### POST /api/contact
Submit a new contact form

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+91-9876543210",
  "service": "Elder Care Services",
  "message": "I need assistance..."
}
```

### GET /api/contacts
Get all contact submissions

### GET /api/contacts/:id
Get specific contact by ID

### PATCH /api/contacts/:id
Update contact status

### GET /api/health
Check server health

## Testing
Test the API using:
- Browser: http://localhost:5000/api/health
- Postman or curl
- Frontend form submission
