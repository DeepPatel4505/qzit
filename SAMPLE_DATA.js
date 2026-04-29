// Sample Quiz Data - You can use this to populate your database
// Copy and paste this data using MongoDB Compass or MongoSH

const sampleQuizzes = [
  {
    _id: "quiz_001",
    title: "General Knowledge Quiz",
    description: "Test your knowledge on various topics around the world",
    difficulty: "medium",
    questions: [
      {
        id: "q1",
        text: "What is the capital of France?",
        imageUrl: "",
        answers: [
          { id: "a1", text: "London", imageUrl: "" },
          { id: "a2", text: "Paris", imageUrl: "" },
          { id: "a3", text: "Berlin", imageUrl: "" },
          { id: "a4", text: "Madrid", imageUrl: "" }
        ],
        correctAnswerId: "a2",
        description: "Paris is the capital and most populous city of France."
      },
      {
        id: "q2",
        text: "Which planet is known as the Red Planet?",
        imageUrl: "",
        answers: [
          { id: "a1", text: "Venus", imageUrl: "" },
          { id: "a2", text: "Mars", imageUrl: "" },
          { id: "a3", text: "Jupiter", imageUrl: "" },
          { id: "a4", text: "Saturn", imageUrl: "" }
        ],
        correctAnswerId: "a2",
        description: "Mars is called the Red Planet due to its reddish appearance caused by iron oxide on its surface."
      },
      {
        id: "q3",
        text: "What is the largest ocean on Earth?",
        imageUrl: "",
        answers: [
          { id: "a1", text: "Atlantic Ocean", imageUrl: "" },
          { id: "a2", text: "Indian Ocean", imageUrl: "" },
          { id: "a3", text: "Pacific Ocean", imageUrl: "" },
          { id: "a4", text: "Arctic Ocean", imageUrl: "" }
        ],
        correctAnswerId: "a3",
        description: "The Pacific Ocean is the largest and deepest of the world's five oceanic divisions."
      }
    ],
    timeLimit: 600,
    passingScore: 70,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: "quiz_002",
    title: "JavaScript Basics",
    description: "Test your JavaScript programming knowledge",
    difficulty: "easy",
    questions: [
      {
        id: "q1",
        text: "What does 'let' keyword do in JavaScript?",
        imageUrl: "",
        answers: [
          { id: "a1", text: "Declares a block-scoped variable", imageUrl: "" },
          { id: "a2", text: "Declares a global variable", imageUrl: "" },
          { id: "a3", text: "Creates a function", imageUrl: "" },
          { id: "a4", text: "Imports a module", imageUrl: "" }
        ],
        correctAnswerId: "a1",
        description: "'let' declares a block-scoped local variable, which can optionally be initialized to a value."
      },
      {
        id: "q2",
        text: "What is the output of typeof []?",
        imageUrl: "",
        answers: [
          { id: "a1", text: "array", imageUrl: "" },
          { id: "a2", text: "object", imageUrl: "" },
          { id: "a3", text: "list", imageUrl: "" },
          { id: "a4", text: "undefined", imageUrl: "" }
        ],
        correctAnswerId: "a2",
        description: "In JavaScript, arrays are objects, so typeof [] returns 'object'."
      },
      {
        id: "q3",
        text: "Which method removes the last element from an array?",
        imageUrl: "",
        answers: [
          { id: "a1", text: "remove()", imageUrl: "" },
          { id: "a2", text: "pop()", imageUrl: "" },
          { id: "a3", text: "shift()", imageUrl: "" },
          { id: "a4", text: "delete()", imageUrl: "" }
        ],
        correctAnswerId: "a2",
        description: "The pop() method removes the last element from an array and returns that element."
      }
    ],
    timeLimit: 300,
    passingScore: 70,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: "quiz_003",
    title: "World History",
    description: "Test your knowledge of world history events",
    difficulty: "hard",
    questions: [
      {
        id: "q1",
        text: "In what year did the Berlin Wall fall?",
        imageUrl: "",
        answers: [
          { id: "a1", text: "1987", imageUrl: "" },
          { id: "a2", text: "1988", imageUrl: "" },
          { id: "a3", text: "1989", imageUrl: "" },
          { id: "a4", text: "1990", imageUrl: "" }
        ],
        correctAnswerId: "a3",
        description: "The Berlin Wall fell on November 9, 1989, marking a significant moment in Cold War history."
      },
      {
        id: "q2",
        text: "Which empire built Machu Picchu?",
        imageUrl: "",
        answers: [
          { id: "a1", text: "Aztec Empire", imageUrl: "" },
          { id: "a2", text: "Inca Empire", imageUrl: "" },
          { id: "a3", text: "Maya Empire", imageUrl: "" },
          { id: "a4", text: "Ottoman Empire", imageUrl: "" }
        ],
        correctAnswerId: "a2",
        description: "Machu Picchu was built by the Inca Empire in the mid-15th century, around 1450 CE."
      }
    ],
    timeLimit: 900,
    passingScore: 75,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// SQL/MongoDB Insert Commands

// MongoDB with mongosh:
/*
use qzit
db.quizzes.insertMany([
  {
    title: "General Knowledge Quiz",
    description: "Test your knowledge on various topics around the world",
    difficulty: "medium",
    questions: [
      {
        id: "q1",
        text: "What is the capital of France?",
        imageUrl: "",
        answers: [
          { id: "a1", text: "London", imageUrl: "" },
          { id: "a2", text: "Paris", imageUrl: "" }
        ],
        correctAnswerId: "a2"
      }
    ],
    timeLimit: 600,
    passingScore: 70,
    createdAt: new Date(),
    updatedAt: new Date()
  }
])
*/

module.exports = sampleQuizzes;
