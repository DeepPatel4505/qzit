import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './styles.css';
import QuizList from './components/QuizList';
import CreateQuiz from './components/CreateQuiz';
import AttemptQuiz from './components/AttemptQuiz';
import Results from './components/Results';
import Login from './components/Login';
import Register from './components/Register';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { quizAPI } from './api';

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div className="loading-screen">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function AppContent() {
  const { isAuthenticated, user, logout } = useAuth();
  const [currentView, setCurrentView] = useState('list'); // list, create, edit, attempt, results
  const [selectedQuizId, setSelectedQuizId] = useState(null);
  const [resultAttemptId, setResultAttemptId] = useState(null);
  const [quizToEdit, setQuizToEdit] = useState(null);

  const handleSelectQuiz = (quizId) => {
    setSelectedQuizId(quizId);
    setCurrentView('attempt');
  };

  const handleCreateQuizClick = () => {
    setQuizToEdit(null);
    setCurrentView('create');
  };

  const handleEditQuiz = async (quizId) => {
    try {
      const response = await quizAPI.getQuiz(quizId);
      setQuizToEdit(response.data.quiz);
      setCurrentView('edit');
    } catch (error) {
      console.error(error);
    }
  };

  const handleQuizCreated = () => {
    setCurrentView('list');
  };

  const handleQuizUpdated = () => {
    setQuizToEdit(null);
    setCurrentView('list');
  };

  const handleQuizCompleted = (attemptId) => {
    setResultAttemptId(attemptId);
    setCurrentView('results');
  };

  const handleRetryQuiz = (quizId) => {
    setSelectedQuizId(quizId);
    setCurrentView('attempt');
  };

  const handleBackToList = () => {
    setCurrentView('list');
    setSelectedQuizId(null);
    setResultAttemptId(null);
    setQuizToEdit(null);
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="app-shell">
      <header className="hero">
        <div className="hero-copy">
          <span className="eyebrow">Qzit</span>
          <h1>A focused quiz workspace for creating and taking assessments.</h1>
          <p>
            Keep quiz creation and attempts simple, fast, and visually quiet.
          </p>
        </div>

        <div className="header-controls">
          {isAuthenticated && (
            <div className="user-info">
              <span>Welcome, {user?.username}!</span>
              <button className="nav-btn nav-btn-ghost logout-btn" onClick={handleLogout}>
                Logout
              </button>
            </div>
          )}

          {currentView !== 'list' ? (
            <button className="nav-btn nav-btn-ghost" onClick={handleBackToList}>
              Back to quizzes
            </button>
          ) : (
            <div className="hero-badge">Fast discovery • Clean structure • Private sessions</div>
          )}
        </div>
      </header>

      <main className="app-content">
        {currentView === 'list' && (
          <QuizList
            onSelectQuiz={handleSelectQuiz}
            onCreateQuiz={handleCreateQuizClick}
            onEditQuiz={handleEditQuiz}
          />
        )}

        {(currentView === 'create' || currentView === 'edit') && (
          <CreateQuiz
            quizToEdit={quizToEdit}
            isEditMode={currentView === 'edit'}
            onComplete={handleQuizCreated}
            onUpdateComplete={handleQuizUpdated}
            onCancel={handleBackToList}
          />
        )}

        {currentView === 'attempt' && selectedQuizId && (
          <AttemptQuiz
            quizId={selectedQuizId}
            onComplete={handleQuizCompleted}
            onCancel={handleBackToList}
          />
        )}

        {currentView === 'results' && resultAttemptId && (
          <Results
            attemptId={resultAttemptId}
            onBack={handleBackToList}
            onRetry={handleRetryQuiz}
          />
        )}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AppContent />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </Router>
  );
}
