# Quick Start Guide - Qzit Quiz Generator

## Prerequisites

Before you begin, ensure you have:
- Node.js v14+ installed
- MongoDB running locally or access to MongoDB Atlas
- npm installed

## 5-Minute Quick Start

### Step 1: Start MongoDB

If using local MongoDB:
```bash
# Windows
net start MongoDB

# Mac/Linux
brew services start mongodb-community
```

Or use MongoDB Atlas cloud database (recommended for production).

### Step 2: Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create and configure .env file
copy .env.example .env
# Edit .env if needed (default settings should work for local MongoDB)

# Start backend server
npm start
```

✅ Backend running at: http://localhost:5000

### Step 3: Frontend Setup (in a new terminal)

```bash
cd frontend

# Install dependencies
npm install

# Create .env file
copy .env.example .env

# Start frontend
npm start
```

✅ Frontend will automatically open at: http://localhost:3000

## Using the App

### Create Your First Quiz

1. Click **"+ Create New Quiz"**
2. Enter quiz title and description
3. Set difficulty and passing score
4. Click **"Add Question"** section:
   - Type your question
   - (Optional) Upload a question image
   - Add at least 2 answer options
   - (Optional) Upload images for answers
   - Select the correct answer
5. Click **"Add Question to Quiz"**
6. Repeat for more questions
7. Click **"Create Quiz"**

### Take a Quiz

1. From the quiz list, click **"Take Quiz"**
2. Enter your name and email
3. Click **"Start Quiz"**
4. Select answers by clicking on options
5. Use Previous/Next to navigate
6. Click **"Submit Quiz"** on the last question

### View Results

After submitting:
- See your score and percentage
- Review each question and answer
- Compare your answers with correct ones
- See time taken and pass/fail status

## API Testing

### Create a Quiz (cURL)

```bash
curl -X POST http://localhost:5000/api/quizzes \
  -H "Content-Type: application/json" \
  -d '{
    "title": "General Knowledge",
    "description": "Test your general knowledge",
    "questions": [{
      "id": "q1",
      "text": "What is 2 + 2?",
      "answers": [
        {"id": "a1", "text": "3"},
        {"id": "a2", "text": "4"},
        {"id": "a3", "text": "5"}
      ],
      "correctAnswerId": "a2"
    }],
    "difficulty": "easy",
    "passingScore": 70
  }'
```

### Upload an Image

```bash
curl -X POST http://localhost:5000/api/images/upload \
  -F "image=@/path/to/image.jpg"
```

## Common Issues & Solutions

### Port Already in Use

```bash
# Find process using port 5000
netstat -ano | findstr :5000

# Kill process (Windows)
taskkill /PID <PID> /F
```

### MongoDB Connection Error

```bash
# Check if MongoDB is running
# Local: check MongoDB service
# Cloud: verify connection string in .env

# Test connection
node -e "const mongoose = require('mongoose'); mongoose.connect('mongodb://localhost:27017/qzit').then(() => console.log('Connected!')).catch(e => console.error(e))"
```

### Images Not Uploading

1. Ensure `backend/uploads` directory exists
2. Check file size (max 5MB)
3. Verify file format (JPEG, PNG, GIF, WebP)
4. Check backend logs for specific errors

## Next Steps

- 📚 Read the full [README.md](./README.md)
- 🚀 Deploy to production (See README for deployment guides)
- 🎨 Customize the styling (frontend/src/styles.css)
- 🛠️ Add more features or modify the codebase

## Development Mode

For faster development with auto-reload:

### Backend
```bash
cd backend
npm install -g nodemon
npm run dev
```

### Frontend
```bash
cd frontend
npm start
```

The app automatically reloads when you make changes!

## Tips

- 💡 You can add time limits to quizzes (in seconds)
- 🖼️ Upload images for questions and answers to make quizzes more engaging
- 🎯 Set different difficulty levels (easy, medium, hard)
- ✨ Images can be of any common format (JPG, PNG, GIF, WebP)
- 📊 View all quiz attempts and statistics

## Documentation

- API Documentation: See README.md for full API endpoints
- Database Schema: See README.md for data models
- Deployment Guide: See README.md for production setup

Happy Quiz Creating! 🎉
