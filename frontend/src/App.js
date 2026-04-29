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
    <div className="app-shell">
      <header className="hero">
        <div className="hero-copy">
          <span className="eyebrow">Qzit</span>
          <h1>Minimal quizzes with a refined gold accent.</h1>
          <p>
            Create, share, and take image-rich quizzes in a clean workspace designed to stay out of the way.
          </p>
        </div>

        {currentView !== 'list' ? (
          <button className="nav-btn nav-btn-ghost" onClick={handleBackToList}>
            Back to quizzes
          </button>
        ) : (
          <div className="hero-badge">Focused layout • Subtle motion • Warm neutral palette</div>
        )}
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
