import React, { useState, useEffect, useCallback } from 'react';
import { attemptAPI } from '../api';

const normalizeText = (value) => (value || '').trim();

const getOptionSignature = (option) => {
  if (!option) {
    return '';
  }

  return [normalizeText(option.text), normalizeText(option.imageUrl)]
    .filter(Boolean)
    .join('::');
};

const isMatchingOption = (selectedAnswer, correctAnswer, selectedAnswerId, correctAnswerId) => {
  if (!selectedAnswer || !correctAnswer) {
    return false;
  }

  if (selectedAnswerId && correctAnswerId && selectedAnswerId === correctAnswerId) {
    return true;
  }

  return getOptionSignature(selectedAnswer) === getOptionSignature(correctAnswer);
};

export default function Results({ attemptId, onBack, onRetry }) {
  const [attempt, setAttempt] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchAttempt = useCallback(async () => {
    setLoading(true);
    try {
      const response = await attemptAPI.getAttempt(attemptId);
      setAttempt(response.data.attempt);
      setQuiz(response.data.attempt.quizId);
    } catch (err) {
      setError('Failed to fetch results');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [attemptId]);

  useEffect(() => {
    fetchAttempt();
  }, [fetchAttempt]);

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!attempt || !quiz) {
    return (
      <div className="container">
        <div className="error-message">{error}</div>
        <button className="btn btn-secondary" onClick={onBack}>
          Back
        </button>
      </div>
    );
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const formatAnswerList = (answerList = []) => {
    if (!answerList.length) {
      return <span style={{ color: '#999' }}>No answer selected</span>;
    }

    return answerList.map((answer) => (
      <div key={answer.id} style={{ marginBottom: '8px' }}>
        <span>{answer.text || 'Image-only answer'}</span>
        {answer.imageUrl && (
          <img
            src={answer.imageUrl}
            alt="Answer"
            style={{
              display: 'block',
              maxWidth: '100%',
              height: 'auto',
              maxHeight: '150px',
              marginTop: '10px',
              borderRadius: '4px'
            }}
          />
        )}
      </div>
    ));
  };

  return (
    <div className="container">
      <div className="results-container">
        <div className="results-card">
          <h2>{quiz.title} - Results</h2>

          <div
            className={attempt.passed ? 'pass-message' : 'fail-message'}
            style={{ fontSize: '1.5em', marginBottom: '20px' }}
          >
            {attempt.passed ? '🎉 Passed!' : '❌ Not Passed'}
          </div>

          <div className="score-display">{attempt.percentage}%</div>

          <div className="result-stats">
            <div className="stat-box">
              <label>Score</label>
              <div className="value">
                {attempt.correctAnswers}/{attempt.totalQuestions}
              </div>
            </div>
            <div className="stat-box">
              <label>Passing Score</label>
              <div className="value">{attempt.quizId.passingScore}%</div>
            </div>
            <div className="stat-box">
              <label>Time Taken</label>
              <div className="value">{formatTime(attempt.timeTaken)}</div>
            </div>
            <div className="stat-box">
              <label>Date</label>
              <div className="value">
                {new Date(attempt.completedAt).toLocaleDateString()}
              </div>
            </div>
          </div>

          <hr style={{ margin: '30px 0' }} />

          <h3 style={{ marginBottom: '20px' }}>Review Answers</h3>

          {attempt.answers.map((answer, index) => {
            const question = answer.question;
            const selectedAnswers = answer.selectedAnswers || [];
            const correctAnswers = answer.correctAnswers || [];
            const selectedAnswer = selectedAnswers[0];
            const correctAnswer = correctAnswers[0];
            const isCorrect = answer.isCorrect === true || isMatchingOption(
              selectedAnswer,
              correctAnswer,
              answer.selectedAnswerId,
              question.correctAnswerId
            );

            return (
              <div key={index} className="card" style={{ marginBottom: '15px' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: '10px'
                  }}
                >
                  <span
                    style={{
                      fontSize: '1.2em',
                      marginRight: '10px',
                      color: isCorrect ? '#51cf66' : '#ff6b6b'
                    }}
                  >
                    {isCorrect ? '✓' : '✗'}
                  </span>
                  <h4 style={{ margin: 0 }}>Question {index + 1}</h4>
                </div>

                <p style={{ marginBottom: '10px' }}>
                  <strong>Question:</strong> {question.text}
                </p>

                {question.imageUrl && (
                  <img
                    src={question.imageUrl}
                    alt="Question"
                    className="question-image"
                    style={{ marginBottom: '10px' }}
                  />
                )}

                <p style={{ marginBottom: '10px' }}>
                  <strong>Your Answer:</strong>{' '}
                  {formatAnswerList(selectedAnswers)}
                </p>

                {!isCorrect && (
                  <>
                    <p style={{ marginBottom: '10px' }}>
                      <strong>Correct Answer:</strong>{' '}
                      <span style={{ color: '#51cf66', fontWeight: 'bold' }}>
                        {correctAnswers.length > 1 ? 'Multiple correct answers:' : ''}
                      </span>
                    </p>
                    {formatAnswerList(correctAnswers)}
                  </>
                )}

                {question.description && (
                  <p style={{ marginTop: '10px', fontStyle: 'italic', color: '#666' }}>
                    <strong>Explanation:</strong> {question.description}
                  </p>
                )}
              </div>
            );
          })}

          <div style={{ marginTop: '30px', display: 'flex', gap: '10px' }}>
            <button
              className="btn btn-primary"
              onClick={onBack}
              style={{ flex: 1 }}
            >
              Back to Quizzes
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => onRetry?.(quiz._id)}
              style={{ flex: 1 }}
            >
              Retry Quiz
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
