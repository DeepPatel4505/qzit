# API Documentation

Complete API reference for Qzit Quiz Generator backend.

## Base URL

```
http://localhost:5000/api
```

## Authentication

Currently, the API does not require authentication. Future versions may include JWT-based auth.

## Response Format

All responses follow this format:

### Success Response (2xx)
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {}
}
```

### Error Response (4xx, 5xx)
```json
{
  "success": false,
  "message": "Error description",
  "error": "Error details"
}
```

---

## Quiz Endpoints

### Create Quiz

Creates a new quiz.

**Request:**
```http
POST /api/quizzes
Content-Type: application/json

{
  "title": "Quiz Title",
  "description": "Quiz Description",
  "difficulty": "medium",
  "timeLimit": 600,
  "passingScore": 70,
  "questions": [
    {
      "id": "q1",
      "text": "Question text?",
      "imageUrl": "http://...",
      "answers": [
        {
          "id": "a1",
          "text": "Answer 1",
          "imageUrl": "http://..."
        },
        {
          "id": "a2",
          "text": "Answer 2",
          "imageUrl": "http://..."
        }
      ],
      "correctAnswerId": "a1",
      "description": "Explanation of the answer"
    }
  ]
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Quiz created successfully",
  "quiz": {
    "_id": "507f1f77bcf86cd799439011",
    "title": "Quiz Title",
    "...": "..."
  }
}
```

**Status Codes:**
- `201` - Quiz created successfully
- `400` - Invalid input (missing required fields)
- `500` - Server error

---

### Get All Quizzes

Retrieves a list of all quizzes (without full questions).

**Request:**
```http
GET /api/quizzes
```

**Response (200 OK):**
```json
{
  "success": true,
  "quizzes": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "title": "General Knowledge",
      "description": "Test your knowledge",
      "difficulty": "medium",
      "timeLimit": 600,
      "passingScore": 70,
      "createdAt": "2024-04-26T10:30:00Z"
    }
  ]
}
```

**Status Codes:**
- `200` - Success
- `500` - Server error

---

### Get Single Quiz

Retrieves a specific quiz with all questions and answers.

**Request:**
```http
GET /api/quizzes/:id
```

**Parameters:**
- `id` (string, required) - Quiz MongoDB ID

**Response (200 OK):**
```json
{
  "success": true,
  "quiz": {
    "_id": "507f1f77bcf86cd799439011",
    "title": "Quiz Title",
    "description": "...",
    "questions": [
      {
        "id": "q1",
        "text": "Question?",
        "imageUrl": "...",
        "answers": [...],
        "correctAnswerId": "a1"
      }
    ]
  }
}
```

**Status Codes:**
- `200` - Success
- `404` - Quiz not found
- `500` - Server error

---

### Update Quiz

Updates an existing quiz.

**Request:**
```http
PUT /api/quizzes/:id
Content-Type: application/json

{
  "title": "Updated Title",
  "questions": [...],
  "difficulty": "hard"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Quiz updated successfully",
  "quiz": {...}
}
```

**Status Codes:**
- `200` - Success
- `404` - Quiz not found
- `500` - Server error

---

### Delete Quiz

Deletes a quiz.

**Request:**
```http
DELETE /api/quizzes/:id
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Quiz deleted successfully"
}
```

**Status Codes:**
- `200` - Success
- `404` - Quiz not found
- `500` - Server error

---

## Attempt Endpoints

### Submit Quiz Answers

Submits quiz answers and calculates results.

**Request:**
```http
POST /api/attempts
Content-Type: application/json

{
  "quizId": "507f1f77bcf86cd799439011",
  "userId": "user_123",
  "userName": "John Doe",
  "userEmail": "john@example.com",
  "timeTaken": 450,
  "answers": [
    {
      "questionId": "q1",
      "selectedAnswerId": "a1"
    },
    {
      "questionId": "q2",
      "selectedAnswerId": "a2"
    }
  ]
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Quiz submitted successfully",
  "result": {
    "correctAnswers": 2,
    "totalQuestions": 3,
    "percentage": 67,
    "passed": false,
    "passingScore": 70,
    "timeTaken": 450
  },
  "attemptId": "507f1f77bcf86cd799439022"
}
```

**Status Codes:**
- `200` - Success
- `400` - Invalid input
- `404` - Quiz not found
- `500` - Server error

---

### Get Attempt Details

Retrieves detailed results of a quiz attempt.

**Request:**
```http
GET /api/attempts/:attemptId
```

**Parameters:**
- `attemptId` (string, required) - Attempt MongoDB ID

**Response (200 OK):**
```json
{
  "success": true,
  "attempt": {
    "_id": "507f1f77bcf86cd799439022",
    "quizId": {...},
    "userId": "user_123",
    "userName": "John Doe",
    "userEmail": "john@example.com",
    "score": 2,
    "percentage": 67,
    "totalQuestions": 3,
    "correctAnswers": 2,
    "passed": false,
    "timeTaken": 450,
    "answers": [
      {
        "questionId": "q1",
        "selectedAnswerId": "a1",
        "isCorrect": true,
        "question": {...}
      }
    ],
    "startedAt": "2024-04-26T10:30:00Z",
    "completedAt": "2024-04-26T10:37:30Z"
  }
}
```

**Status Codes:**
- `200` - Success
- `404` - Attempt not found
- `500` - Server error

---

### Get Quiz Attempts

Retrieves all attempts for a specific quiz.

**Request:**
```http
GET /api/attempts/quiz/:quizId
```

**Parameters:**
- `quizId` (string, required) - Quiz MongoDB ID

**Response (200 OK):**
```json
{
  "success": true,
  "attempts": [
    {
      "_id": "507f1f77bcf86cd799439022",
      "userName": "John Doe",
      "score": 2,
      "percentage": 67,
      "passed": false,
      "completedAt": "2024-04-26T10:37:30Z"
    }
  ]
}
```

**Status Codes:**
- `200` - Success
- `500` - Server error

---

### Get User Attempts

Retrieves all attempts by a specific user.

**Request:**
```http
GET /api/attempts/user/:userId
```

**Parameters:**
- `userId` (string, required) - User ID

**Response (200 OK):**
```json
{
  "success": true,
  "attempts": [
    {
      "_id": "507f1f77bcf86cd799439022",
      "quizId": "507f1f77bcf86cd799439011",
      "score": 2,
      "percentage": 67,
      "completedAt": "2024-04-26T10:37:30Z"
    }
  ]
}
```

**Status Codes:**
- `200` - Success
- `500` - Server error

---

### Get Quiz Statistics

Retrieves aggregate statistics for a quiz.

**Request:**
```http
GET /api/attempts/stats/:quizId
```

**Parameters:**
- `quizId` (string, required) - Quiz MongoDB ID

**Response (200 OK):**
```json
{
  "success": true,
  "statistics": {
    "totalAttempts": 10,
    "averageScore": 7,
    "averagePercentage": 70,
    "passRate": 60,
    "highestScore": 10,
    "lowestScore": 3
  }
}
```

**Status Codes:**
- `200` - Success
- `500` - Server error

---

## Image Endpoints

### Upload Image

Uploads an image file for questions or answers.

**Request:**
```http
POST /api/images/upload
Content-Type: multipart/form-data

image: [binary file]
```

**Form Data:**
- `image` (file, required) - Image file (max 5MB, formats: JPEG, PNG, GIF, WebP)

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Image uploaded successfully",
  "imageUrl": "/uploads/a1b2c3d4-e5f6-g7h8-i9j0.jpg"
}
```

**Status Codes:**
- `200` - Success
- `400` - Invalid file
- `413` - File too large
- `500` - Server error

---

### Delete Image

Deletes an uploaded image.

**Request:**
```http
DELETE /api/images/:filename
```

**Parameters:**
- `filename` (string, required) - Image filename to delete

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Image deleted successfully"
}
```

**Status Codes:**
- `200` - Success
- `404` - Image not found
- `500` - Server error

---

## Health Check

### Server Health

Checks if the server is running.

**Request:**
```http
GET /api/health
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Server is running"
}
```

---

## Error Codes

| Code | Status | Message |
|------|--------|---------|
| 200 | OK | Request successful |
| 201 | Created | Resource created |
| 400 | Bad Request | Invalid input |
| 404 | Not Found | Resource not found |
| 413 | Payload Too Large | File exceeds size limit |
| 500 | Internal Server Error | Server error |

---

## Rate Limiting

Currently no rate limiting is implemented. For production, consider implementing rate limiting middleware.

---

## CORS

CORS is enabled for all origins. For production, configure specific origins in backend/src/server.js:

```javascript
app.use(cors({
  origin: ['https://yourdomain.com'],
  credentials: true
}));
```

---

## cURL Examples

### Create Quiz
```bash
curl -X POST http://localhost:5000/api/quizzes \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My Quiz",
    "questions": [{
      "id": "q1",
      "text": "Question?",
      "answers": [{"id": "a1", "text": "Answer"}],
      "correctAnswerId": "a1"
    }]
  }'
```

### Upload Image
```bash
curl -X POST http://localhost:5000/api/images/upload \
  -F "image=@image.jpg"
```

### Submit Quiz
```bash
curl -X POST http://localhost:5000/api/attempts \
  -H "Content-Type: application/json" \
  -d '{
    "quizId": "...",
    "userName": "User",
    "answers": [{"questionId": "q1", "selectedAnswerId": "a1"}]
  }'
```

---

For more examples and usage patterns, see [README.md](./README.md).
