import React, { useState } from 'react';
import './styles.css';
import QuizList from './components/QuizList';
import CreateQuiz from './components/CreateQuiz';
import AttemptQuiz from './components/AttemptQuiz';
import Results from './components/Results';
import { quizAPI } from './api';

export default function App() {
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
    } finally {
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

  return (
    <div className="app">
      <div className="header">
        <h1>🎯 Qzit</h1>
        <p>Create and Take Quizzes with Image Support</p>
      </div>

      {currentView !== 'list' && (
        <div className="nav" style={{ marginBottom: '20px' }}>
          <button
            className="nav-btn"
            onClick={handleBackToList}
          >
            ← Back to Quizzes
          </button>
        </div>
      )}

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
    </div>
  );
}
