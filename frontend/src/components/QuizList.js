import React, { useState, useEffect, useCallback } from 'react';
import { quizAPI } from '../api';

export default function QuizList({ onSelectQuiz, onCreateQuiz, onEditQuiz }) {
  const [quizzes, setQuizzes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [sort, setSort] = useState('newest');
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await quizAPI.getCategories();
      setCategories(response.data.categories || []);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const fetchQuizzes = useCallback(async (explicitQuery) => {
    setLoading(true);
    setError('');
    try {
      const response = await quizAPI.getAllQuizzes({
        q: explicitQuery !== undefined ? explicitQuery : search,
        category,
        difficulty,
        sort
      });
      setQuizzes(response.data.quizzes);
    } catch (err) {
      setError('Failed to fetch quizzes');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [category, difficulty, search, sort]);

  useEffect(() => {
    fetchQuizzes();
    fetchCategories();
  }, [fetchCategories, fetchQuizzes]);

  const handleDeleteQuiz = async () => {
    if (!deleteTarget) {
      return;
    }

    try {
      await quizAPI.deleteQuiz(deleteTarget._id);
      setQuizzes((prevQuizzes) => prevQuizzes.filter((q) => q._id !== deleteTarget._id));
      setDeleteTarget(null);
    } catch (err) {
      setError('Failed to delete quiz');
      console.error(err);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchQuizzes(search);
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="container">
      {error && <div className="error-message">{error}</div>}
      <div className="list-toolbar">
        <button className="btn btn-primary" onClick={onCreateQuiz}>
          + Create New Quiz
        </button>
      </div>

      <form className="discovery-controls" onSubmit={handleSearchSubmit}>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by title, category, or tags"
        />
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">All categories</option>
          {categories.map((categoryValue) => (
            <option key={categoryValue} value={categoryValue}>
              {categoryValue}
            </option>
          ))}
        </select>
        <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
          <option value="">All difficulties</option>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="newest">Newest</option>
          <option value="updated">Recently updated</option>
          <option value="popular">Most attempted</option>
        </select>
        <button className="btn btn-secondary" type="submit">
          Search
        </button>
      </form>

      {quizzes.length === 0 ? (
        <div className="card" style={{ textAlign: 'center' }}>
          <h2>No Quizzes Yet</h2>
          <p>Try adjusting your filters or create your first quiz.</p>
        </div>
      ) : (
        <div className="quiz-list">
          {quizzes.map((quiz) => (
            <div key={quiz._id} className="quiz-item">
              <h3>{quiz.title}</h3>
              <p>{quiz.description}</p>
              <div className="quiz-meta">
                <span>{quiz.questionCount ?? 0} questions</span>
                <span>{quiz.difficulty}</span>
              </div>
              <div className="quiz-meta">
                <span>{quiz.category || 'General'}</span>
                <span>{quiz.attemptsCount || 0} attempts</span>
              </div>
              <div className="quiz-actions">
                <button
                  className="btn btn-primary"
                  onClick={() => onSelectQuiz(quiz._id)}
                >
                  Take Quiz
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => onEditQuiz(quiz._id)}
                >
                  Edit
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => setDeleteTarget(quiz)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {deleteTarget && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Delete quiz?</h3>
            <p>
              This performs a soft delete so the quiz can still be recovered.
            </p>
            <div className="modal-actions">
              <button className="btn btn-danger" onClick={handleDeleteQuiz}>Delete</button>
              <button className="btn btn-secondary" onClick={() => setDeleteTarget(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
