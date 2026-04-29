# Qzit - Quiz Generator Web App

A complete full-stack quiz generator application with support for creating quizzes, taking quizzes, viewing results, and handling images in questions and answers.

## Features

✨ **Create Quizzes**
- Create custom quizzes with multiple questions
- Builder UX with left-panel question navigation and live preview
- Single-correct, multiple-correct, and true/false question types
- Support for question text, question images, answer options, and answer images
- Reorder, duplicate, and delete questions while editing
- Set category, tags, difficulty, status, timers, and passing score
- Multiple answer options per question

🎯 **Take Quizzes**
- Attempt quizzes with a user-friendly interface
- Real-time quiz timer and optional per-question timer
- Progress indicator and question jump grid
- Navigate between questions and submit with incomplete warning
- Auto-save progress and resume later
- User name and email capture

📊 **View Results**
- Detailed results page with score, percentage, and time taken
- Review all answers with correct/incorrect indicators
- Compare selected answers vs correct answers (single and multiple)
- View images for both questions and answers
- Retry quiz from results screen

🔎 **Discovery & Management**
- Search quizzes by title/tags/category
- Filter by category and difficulty
- Sort by newest, updated, and popular
- Soft delete by default and optional hard delete with admin token
- Version-safe quiz updates when a quiz already has attempts

🖼️ **Image Support**
- Upload images for questions
- Upload images for answer options
- Automatically serve images through the backend
- Support for JPEG, PNG, GIF, and WebP formats

## Project Structure

```
Qzit/
├── backend/                    # Node.js/Express backend
│   ├── src/
│   │   ├── controllers/       # API controllers
│   │   ├── models/            # MongoDB models
│   │   ├── routes/            # API routes
│   │   ├── middleware/        # Custom middleware
│   │   ├── db.js              # Database connection
│   │   └── server.js          # Main server file
│   ├── uploads/               # Uploaded images directory
│   ├── package.json
│   ├── .env.example
│   └── .gitignore
│
└── frontend/                   # React frontend
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── components/        # React components
    │   ├── api.js             # API client
    │   ├── App.js             # Main App component
    │   ├── index.js           # Entry point
    │   ├── index.css          # Global styles
    │   └── styles.css         # Component styles
    ├── package.json
    ├── .env.example
    └── .gitignore
```

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- MongoDB (local or cloud instance)

## Installation

### 1. Clone/Setup the Repository

```bash
cd d:\WebApps\Qzit
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file from example
copy .env.example .env

# Edit .env with your MongoDB connection string
# MONGODB_URI=mongodb://localhost:27017/qzit
# PORT=5000

# Start the backend server
npm start
# Or for development with auto-reload:
npm run dev
```

The backend will run on `http://localhost:5000`

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env file from example
copy .env.example .env

# REACT_APP_API_URL=http://localhost:5000/api

# Start the frontend development server
npm start
```

The frontend will open at `http://localhost:3000`

## Configuration

### Backend Environment Variables (.env)

```
MONGODB_URI=mongodb://localhost:27017/qzit
PORT=5000
NODE_ENV=development
ADMIN_DELETE_TOKEN=replace_with_secure_admin_token
```

### Frontend Environment Variables (.env)

```
REACT_APP_API_URL=http://localhost:5000/api
```

## API Endpoints

### Quiz Routes (`/api/quizzes`)

- `POST /api/quizzes` - Create a new quiz
- `GET /api/quizzes` - Get all quizzes (supports `q`, `category`, `difficulty`, `sort`)
- `GET /api/quizzes/categories/list` - Get available categories
- `GET /api/quizzes/:id` - Get a specific quiz
- `PUT /api/quizzes/:id` - Update a quiz
- `DELETE /api/quizzes/:id` - Soft delete a quiz
- `DELETE /api/quizzes/:id?hardDelete=true` - Hard delete (requires `x-admin-token`)

### Attempt Routes (`/api/attempts`)

- `POST /api/attempts` - Submit quiz answers
- `POST /api/attempts/progress` - Save in-progress attempt
- `GET /api/attempts/progress/:quizId?userId=...` - Load in-progress attempt
- `GET /api/attempts/:attemptId` - Get attempt details
- `GET /api/attempts/quiz/:quizId` - Get all attempts for a quiz
- `GET /api/attempts/user/:userId` - Get user's attempts
- `GET /api/attempts/stats/:quizId` - Get quiz statistics

### Image Routes (`/api/images`)

- `POST /api/images/upload` - Upload an image
- `DELETE /api/images/:filename` - Delete an image

## Database Schema

### Quiz Model

```javascript
{
  title: String,
  description: String,
  questions: [
    {
      id: String,
      text: String,
      imageUrl: String,
      answers: [
        {
          id: String,
          text: String,
          imageUrl: String
        }
      ],
      correctAnswerId: String,
      description: String
    }
  ],
  difficulty: String (easy/medium/hard),
  timeLimit: Number (in seconds),
  passingScore: Number,
  createdAt: Date,
  updatedAt: Date
}
```

### Attempt Model

```javascript
{
  quizId: ObjectId,
  userId: String,
  userName: String,
  userEmail: String,
  answers: [
    {
      questionId: String,
      selectedAnswerId: String,
      isCorrect: Boolean
    }
  ],
  score: Number,
  percentage: Number,
  totalQuestions: Number,
  correctAnswers: Number,
  timeTaken: Number,
  passed: Boolean,
  startedAt: Date,
  completedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

## Usage

### Creating a Quiz

1. Click "Create New Quiz" button
2. Enter quiz title and description
3. Select difficulty level, time limit, and passing score
4. Add questions:
   - Enter question text
   - (Optional) Upload question image
   - Add answer options (at least 2 required)
   - (Optional) Upload images for answer options
   - Select the correct answer
5. Click "Add Question to Quiz" to add more questions
6. Click "Create Quiz" to finalize

### Taking a Quiz

1. Click "Take Quiz" on any quiz card
2. Enter your name and email (optional)
3. Click "Start Quiz"
4. Answer each question by selecting an option
5. Use Previous/Next buttons to navigate
6. Click "Submit Quiz" on the last question
7. View your results

### Viewing Results

After completing a quiz, you'll see:
- Your percentage score
- Number of correct answers
- Pass/Fail status
- Time taken
- Detailed review of each question and answer

## Image Upload Details

- **Supported formats**: JPEG, PNG, GIF, WebP
- **Max file size**: 5MB per image
- **Storage**: Local file system (`backend/uploads` folder)
- **Access**: Images served via `/uploads/:filename` endpoint

## Error Handling

The application includes comprehensive error handling:
- Network error notifications
- Form validation messages
- File upload validation
- Database error responses
- Graceful fallbacks

## Security Considerations

For production deployment:

1. **Environment Variables**: Store sensitive data in .env files
2. **CORS**: Configure appropriate CORS origins
3. **File Upload**: Additional validation for uploaded files
4. **Input Validation**: Server-side validation of all inputs
5. **Database**: Use MongoDB Atlas for production databases
6. **Image Storage**: Consider using cloud storage (AWS S3, Cloudinary)

## Deployment

### Backend Deployment (Vercel/Heroku)

1. Install Vercel CLI or Heroku CLI
2. Configure environment variables in deployment platform
3. Deploy:

```bash
# Vercel
vercel

# Heroku
heroku create your-app-name
git push heroku main
```

### Frontend Deployment (Vercel)

1. Connect your GitHub repository
2. Set environment variables
3. Deploy directly from Vercel dashboard

### Database

Use MongoDB Atlas for cloud hosting:
1. Create a cluster at mongodb.com
2. Copy connection string
3. Add to backend `.env` file

## Troubleshooting

### Backend won't start
- Check if MongoDB is running
- Verify connection string in .env
- Check if port 5000 is available

### Frontend can't connect to backend
- Verify backend is running on port 5000
- Check `REACT_APP_API_URL` in frontend .env
- Ensure CORS is enabled in backend

### Images not uploading
- Check file size (max 5MB)
- Verify file format is supported
- Ensure `backend/uploads` directory exists and is writable

### Database errors
- Check MongoDB connection
- Verify database name in connection string
- Run migrations if needed

## Future Enhancements

- [ ] Quiz categories/tags
- [ ] User authentication system
- [ ] Leaderboards
- [ ] Quiz analytics dashboard
- [ ] Question bank/question templates
- [ ] Bulk upload via CSV
- [ ] Mobile app
- [ ] Email notifications
- [ ] WebSocket real-time updates
- [ ] Export results as PDF

## License

This project is open source and available under the MIT License.

## Support

For issues or questions, please refer to the GitHub repository or create an issue.
