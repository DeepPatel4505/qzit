import React, { useState, useEffect, useCallback, useRef } from 'react';
import { quizAPI, attemptAPI } from '../api';

const getStorageKey = (quizId) => `qzit_progress_${quizId}`;

const getUserId = (name, email) => {
  const base = (email || name || 'anonymous').toLowerCase().trim();
  return base.replace(/[^a-z0-9]+/g, '_') || 'anonymous';
};

export default function AttemptQuiz({ quizId, onComplete, onCancel }) {
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const answersRef = useRef({});
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [startTime, setStartTime] = useState(null);
  const [showUserForm, setShowUserForm] = useState(true);
  const [timeLeft, setTimeLeft] = useState(null);
  const [questionTimeLeft, setQuestionTimeLeft] = useState(null);
  const [hasLocalDraft, setHasLocalDraft] = useState(false);
  const [isResumed, setIsResumed] = useState(false);

  const getAnsweredCount = useCallback(() => {
    if (!quiz) {
      return 0;
    }

    return quiz.questions.filter((question) => (answersRef.current[question.id] || []).length > 0).length;
  }, [quiz]);

  const fetchQuiz = useCallback(async () => {
    setLoading(true);
    try {
      const response = await quizAPI.getQuiz(quizId);
      setQuiz(response.data.quiz);

      const savedDraftRaw = localStorage.getItem(getStorageKey(quizId));
      if (savedDraftRaw) {
        const savedDraft = JSON.parse(savedDraftRaw);
        setHasLocalDraft(true);
        setUserName(savedDraft.userName || '');
        setUserEmail(savedDraft.userEmail || '');
      }
    } catch (err) {
      setError('Failed to fetch quiz');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [quizId]);

  useEffect(() => {
    fetchQuiz();
  }, [fetchQuiz]);

  const buildAttemptAnswers = useCallback(() => {
    if (!quiz) {
      return [];
    }

    return quiz.questions.map((question) => {
      const selectedIds = answersRef.current[question.id] || [];
      return {
        questionId: question.id,
        selectedAnswerId: selectedIds[0] || '',
        selectedAnswerIds: selectedIds
      };
    });
  }, [quiz]);

  const handleSubmit = useCallback(async (forceSubmit = false) => {
    if (!quiz || !startTime) {
      return;
    }

    const unanswered = quiz.questions.filter((question) => {
      const selectedIds = answersRef.current[question.id] || [];
      return selectedIds.length === 0;
    });

    if (!forceSubmit && unanswered.length > 0) {
      const shouldContinue = window.confirm(
        `You have ${unanswered.length} unanswered question(s). Submit anyway?`
      );
      if (!shouldContinue) {
        return;
      }
    }

    const elapsedSecondsFromStart = Math.floor((Date.now() - startTime) / 1000);
    const totalAllowedTime = quiz.timeLimit > 0 ? quiz.timeLimit : elapsedSecondsFromStart;
    const timeTaken = Math.min(totalAllowedTime, elapsedSecondsFromStart);
    const normalizedUserId = getUserId(userName, userEmail);
    const attemptData = {
      quizId,
      userId: normalizedUserId,
      userName,
      userEmail,
      answers: buildAttemptAnswers(),
      timeTaken
    };

    setSubmitting(true);
    try {
      const response = await attemptAPI.submitAnswers(attemptData);
      localStorage.removeItem(getStorageKey(quizId));
      onComplete(response.data.attemptId, response.data.result);
    } catch (err) {
      setError('Failed to submit quiz');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  }, [buildAttemptAnswers, onComplete, quiz, quizId, startTime, userEmail, userName]);

  useEffect(() => {
    if (!quiz || !startTime) return;

    if (quiz.timeLimit > 0) {
      setTimeLeft(quiz.timeLimit);

      const interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            handleSubmit(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [handleSubmit, quiz, startTime]);

  useEffect(() => {
    if (!quiz || !startTime || !quiz.questionTimeLimit || quiz.questionTimeLimit <= 0) {
      return undefined;
    }

    setQuestionTimeLeft(quiz.questionTimeLimit);
    const interval = setInterval(() => {
      setQuestionTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          if (currentQuestionIndex < quiz.questions.length - 1) {
            setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
            return quiz.questionTimeLimit;
          }

          handleSubmit(true);
          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [currentQuestionIndex, handleSubmit, quiz, startTime]);

  useEffect(() => {
    if (!quiz || !startTime || showUserForm) {
      return undefined;
    }

    const interval = setInterval(async () => {
      const elapsedTime = Math.floor((Date.now() - startTime) / 1000);
      const draftPayload = {
        quizId,
        userId: getUserId(userName, userEmail),
        userName,
        userEmail,
        elapsedTime,
        currentQuestionIndex,
        answers: buildAttemptAnswers()
      };

      localStorage.setItem(getStorageKey(quizId), JSON.stringify({
        ...draftPayload,
        startTime,
        answers: answersRef.current
      }));

      try {
        await attemptAPI.saveProgress(draftPayload);
      } catch (err) {
        // Keep local draft even if API save fails.
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [buildAttemptAnswers, currentQuestionIndex, quiz, quizId, showUserForm, startTime, userEmail, userName]);

  const handleStartQuiz = () => {
    if (!userName.trim()) {
      setError('Please enter your name');
      return;
    }
    setShowUserForm(false);
    setStartTime(Date.now());
    setIsResumed(false);
    setError('');
  };

  const handleResumeQuiz = async () => {
    const savedDraftRaw = localStorage.getItem(getStorageKey(quizId));
    if (!savedDraftRaw) {
      handleStartQuiz();
      return;
    }

    const savedDraft = JSON.parse(savedDraftRaw);
    setUserName(savedDraft.userName || userName);
    setUserEmail(savedDraft.userEmail || userEmail);
    const normalizedAnswers = savedDraft.answers || {};
    setAnswers(normalizedAnswers);
    answersRef.current = normalizedAnswers;
    setCurrentQuestionIndex(savedDraft.currentQuestionIndex || 0);
    setStartTime(savedDraft.startTime || Date.now());
    setShowUserForm(false);
    setIsResumed(true);

    try {
      const response = await attemptAPI.getProgress(quizId, getUserId(savedDraft.userName, savedDraft.userEmail));
      const progress = response.data.progress;
      if (progress?.answers?.length) {
        const answerMap = progress.answers.reduce((acc, entry) => {
          const ids = entry.selectedAnswerIds || (entry.selectedAnswerId ? [entry.selectedAnswerId] : []);
          acc[entry.questionId] = ids;
          return acc;
        }, {});

        setAnswers(answerMap);
        answersRef.current = answerMap;
        setCurrentQuestionIndex(progress.metadata?.currentQuestionIndex || savedDraft.currentQuestionIndex || 0);
      }
    } catch (err) {
      // Local draft remains source of truth if backend draft fetch fails.
    }
  };

  const handleSelectAnswer = (answerId) => {
    const currentQuestion = quiz.questions[currentQuestionIndex];
    const currentSelection = answersRef.current[currentQuestion.id] || [];

    let nextSelection;
    if (currentQuestion.questionType === 'multiple') {
      nextSelection = currentSelection.includes(answerId)
        ? currentSelection.filter((id) => id !== answerId)
        : [...currentSelection, answerId];
    } else {
      nextSelection = [answerId];
    }

    setAnswers((prevAnswers) => {
      const nextAnswers = {
        ...prevAnswers,
        [currentQuestion.id]: nextSelection
      };
      answersRef.current = nextAnswers;
      return nextAnswers;
    });
  };

  const handleNext = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleCancelAttempt = () => {
    if (showUserForm) {
      onCancel();
      return;
    }

    const shouldSave = window.confirm('Exit and keep your progress for resume?');
    if (shouldSave) {
      localStorage.setItem(getStorageKey(quizId), JSON.stringify({
        quizId,
        userName,
        userEmail,
        currentQuestionIndex,
        startTime,
        answers: answersRef.current
      }));
    } else {
      localStorage.removeItem(getStorageKey(quizId));
    }

    onCancel();
  };

  if (loading && !quiz) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="container">
        <div className="error-message">{error}</div>
        <button className="btn btn-secondary" onClick={onCancel}>
          Back
        </button>
      </div>
    );
  }

  if (showUserForm) {
    return (
      <div className="container">
        <div className="card attempt-panel">
          <h2>{quiz.title}</h2>
          <p>{quiz.description}</p>

          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label>Your Name *</label>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Enter your name"
              onKeyPress={(e) => e.key === 'Enter' && handleStartQuiz()}
            />
          </div>

          <div className="form-group">
            <label>Email (Optional)</label>
            <input
              type="email"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              placeholder="Enter your email"
            />
          </div>

          <div className="attempt-intro">
            <p><strong>📚 Questions:</strong> {quiz.questions.length}</p>
            <p><strong>🎯 Passing Score:</strong> {quiz.passingScore}%</p>
            {quiz.timeLimit > 0 && (
              <p><strong>⏱️ Time Limit:</strong> {quiz.timeLimit} seconds</p>
            )}
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              className="btn btn-primary"
              onClick={handleStartQuiz}
              style={{ flex: 1 }}
            >
              Start Quiz
            </button>
            <button
              className="btn btn-secondary"
              onClick={handleCancelAttempt}
              style={{ flex: 1 }}
            >
              Cancel
            </button>
          </div>

          {hasLocalDraft && (
            <button
              className="btn btn-secondary"
              onClick={handleResumeQuiz}
              style={{ width: '100%', marginTop: '10px' }}
            >
              Resume previous attempt
            </button>
          )}
        </div>
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];

  return (
    <div className="container">
      <div className="card attempt-panel attempt-panel-wide">
        {quiz.timeLimit > 0 && (
          <div
            className={`timer ${
              timeLeft <= 60 ? 'warning' : timeLeft <= 30 ? 'danger' : ''
            }`}
          >
            ⏱️ Time Left: {Math.floor(timeLeft / 60)}:
            {String(timeLeft % 60).padStart(2, '0')}
          </div>
        )}

        {quiz.questionTimeLimit > 0 && (
          <div className={`timer ${questionTimeLeft <= 10 ? 'danger' : 'warning'}`}>
            Question timer: {questionTimeLeft}s
          </div>
        )}

        <div className="attempt-intro">
          <h3>
            Question {currentQuestionIndex + 1} of {quiz.questions.length}
          </h3>
          <div className="progress-track">
            <div
              className="progress-fill"
              style={{ width: `${((currentQuestionIndex + 1) / quiz.questions.length) * 100}%` }}
            ></div>
          </div>
        </div>

        <div className="question-jump-grid">
          {quiz.questions.map((question, index) => {
            const answered = (answers[question.id] || []).length > 0;
            const isActive = index === currentQuestionIndex;
            return (
              <button
                key={question.id}
                className={`jump-btn ${answered ? 'answered' : ''} ${isActive ? 'active' : ''}`}
                onClick={() => setCurrentQuestionIndex(index)}
              >
                {index + 1}
              </button>
            );
          })}
        </div>

        <div className="question-display">
          <h3>{currentQuestion.text || 'Image-only question'}</h3>
          {currentQuestion.imageUrl && (
            <img
              src={currentQuestion.imageUrl}
              alt="Question"
              className="question-image"
            />
          )}
        </div>

        <div style={{ marginBottom: '20px' }}>
          <h4>
            {currentQuestion.questionType === 'multiple'
              ? 'Select one or more answers:'
              : 'Select an answer:'}
          </h4>
          {currentQuestion.answers.map((answer, index) => (
            <div
              key={answer.id}
              className={`answer-option ${
                (answers[currentQuestion.id] || []).includes(answer.id) ? 'selected' : ''
              }`}
              onClick={() => handleSelectAnswer(answer.id)}
            >
              <input
                type={currentQuestion.questionType === 'multiple' ? 'checkbox' : 'radio'}
                id={answer.id}
                name="answer"
                checked={(answers[currentQuestion.id] || []).includes(answer.id)}
                onChange={() => handleSelectAnswer(answer.id)}
              />
              <label htmlFor={answer.id}>
                  <div className="answer-content">
                  <span>{answer.text || 'Image-only answer'}</span>
                  {answer.imageUrl && (
                    <img
                      src={answer.imageUrl}
                      alt="Answer"
                        className="answer-image"
                    />
                  )}
                </div>
              </label>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <button
            className="btn btn-secondary"
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
          >
            ← Previous
          </button>

          {currentQuestionIndex < quiz.questions.length - 1 ? (
            <button
              className="btn btn-primary"
              onClick={handleNext}
              style={{ flex: 1 }}
            >
              Next →
            </button>
          ) : (
            <button
              className="btn btn-success"
              onClick={() => handleSubmit(false)}
              disabled={submitting}
              style={{ flex: 1 }}
            >
              {submitting ? 'Submitting...' : 'Submit Quiz'}
            </button>
          )}
        </div>

        <div className="attempt-summary">
          <span>Answered: {getAnsweredCount()} / {quiz.questions.length}</span>
          {isResumed && <span>Resumed session active</span>}
        </div>

        <button
          className="btn btn-secondary"
          onClick={handleCancelAttempt}
          style={{ width: '100%' }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
