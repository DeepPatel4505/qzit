import React, { useEffect, useMemo, useState } from 'react';
import { quizAPI, imageAPI } from '../api';
import { v4 as uuidv4 } from 'uuid';

const createAnswer = () => ({ id: uuidv4(), text: '', imageUrl: '' });

const createQuestion = () => ({
  id: uuidv4(),
  text: '',
  imageUrl: '',
  description: '',
  questionType: 'single',
  answers: [createAnswer(), createAnswer()],
  correctAnswerIds: [],
  correctAnswerId: ''
});

const normalizeQuestion = (question) => {
  const normalizedCorrectIds = [
    ...(Array.isArray(question.correctAnswerIds) ? question.correctAnswerIds : []),
    question.correctAnswerId
  ].filter(Boolean);

  return {
    ...question,
    text: question.text || '',
    imageUrl: question.imageUrl || '',
    description: question.description || '',
    questionType: question.questionType || (normalizedCorrectIds.length > 1 ? 'multiple' : 'single'),
    answers: (question.answers || []).map((answer) => ({
      ...answer,
      text: answer.text || '',
      imageUrl: answer.imageUrl || ''
    })),
    correctAnswerId: normalizedCorrectIds[0] || '',
    correctAnswerIds: [...new Set(normalizedCorrectIds)]
  };
};

const hasContent = (item) => Boolean(item?.text?.trim() || item?.imageUrl?.trim());

export default function CreateQuiz({ quizToEdit, isEditMode = false, onComplete, onUpdateComplete, onCancel }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('General');
  const [tags, setTags] = useState('');
  const [creatorName, setCreatorName] = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  const [status, setStatus] = useState('published');
  const [timeLimit, setTimeLimit] = useState(0);
  const [questionTimeLimit, setQuestionTimeLimit] = useState(0);
  const [passingScore, setPassingScore] = useState(70);
  const [questions, setQuestions] = useState([createQuestion()]);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!quizToEdit) {
      return;
    }

    const normalizedQuestions = (quizToEdit.questions || []).map(normalizeQuestion);
    setTitle(quizToEdit.title || '');
    setDescription(quizToEdit.description || '');
    setCategory(quizToEdit.category || 'General');
    setTags((quizToEdit.tags || []).join(', '));
    setCreatorName(quizToEdit.creator?.name || '');
    setDifficulty(quizToEdit.difficulty || 'medium');
    setStatus(quizToEdit.status || 'published');
    setTimeLimit(quizToEdit.timeLimit || 0);
    setQuestionTimeLimit(quizToEdit.questionTimeLimit || 0);
    setPassingScore(quizToEdit.passingScore || 70);
    setQuestions(normalizedQuestions.length > 0 ? normalizedQuestions : [createQuestion()]);
    setActiveQuestionIndex(0);
  }, [quizToEdit]);

  const activeQuestion = useMemo(() => questions[activeQuestionIndex], [questions, activeQuestionIndex]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const key = isEditMode && quizToEdit?._id
        ? `qzit_builder_edit_${quizToEdit._id}`
        : 'qzit_builder_draft';

      localStorage.setItem(key, JSON.stringify({
        title,
        description,
        category,
        tags,
        creatorName,
        difficulty,
        status,
        timeLimit,
        questionTimeLimit,
        passingScore,
        questions,
        activeQuestionIndex
      }));
    }, 400);

    return () => clearTimeout(timer);
  }, [
    activeQuestionIndex,
    category,
    creatorName,
    description,
    difficulty,
    isEditMode,
    passingScore,
    questionTimeLimit,
    questions,
    quizToEdit,
    status,
    tags,
    timeLimit,
    title
  ]);

  const updateActiveQuestion = (updater) => {
    setQuestions((prevQuestions) => {
      const nextQuestions = [...prevQuestions];
      const previous = nextQuestions[activeQuestionIndex];
      nextQuestions[activeQuestionIndex] = updater(previous);
      return nextQuestions;
    });
  };

  const setQuestionType = (questionType) => {
    updateActiveQuestion((question) => {
      if (questionType === 'true_false') {
        const trueId = uuidv4();
        const falseId = uuidv4();
        return {
          ...question,
          questionType,
          answers: [
            { id: trueId, text: 'True', imageUrl: '' },
            { id: falseId, text: 'False', imageUrl: '' }
          ],
          correctAnswerIds: question.correctAnswerIds.filter((id) => id === trueId || id === falseId),
          correctAnswerId: question.correctAnswerId === trueId || question.correctAnswerId === falseId
            ? question.correctAnswerId
            : ''
        };
      }

      const correctedIds = (question.correctAnswerIds || []).slice(0, questionType === 'single' ? 1 : undefined);
      return {
        ...question,
        questionType,
        correctAnswerIds: correctedIds,
        correctAnswerId: correctedIds[0] || ''
      };
    });
  };

  const addQuestion = () => {
    setQuestions((prevQuestions) => [...prevQuestions, createQuestion()]);
    setActiveQuestionIndex(questions.length);
  };

  const duplicateQuestion = (index) => {
    setQuestions((prevQuestions) => {
      const source = normalizeQuestion(prevQuestions[index]);
      const duplicate = {
        ...source,
        id: uuidv4(),
        answers: source.answers.map((answer) => ({ ...answer, id: uuidv4() })),
        correctAnswerId: '',
        correctAnswerIds: []
      };
      const nextQuestions = [...prevQuestions];
      nextQuestions.splice(index + 1, 0, duplicate);
      return nextQuestions;
    });
    setActiveQuestionIndex(index + 1);
  };

  const moveQuestion = (index, direction) => {
    const target = index + direction;
    if (target < 0 || target >= questions.length) {
      return;
    }

    setQuestions((prevQuestions) => {
      const next = [...prevQuestions];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
    setActiveQuestionIndex(target);
  };

  const removeQuestion = (index) => {
    if (questions.length === 1) {
      setError('A quiz needs at least one question');
      return;
    }

    setQuestions((prevQuestions) => prevQuestions.filter((_, questionIndex) => questionIndex !== index));
    setActiveQuestionIndex((prevIndex) => Math.max(0, Math.min(prevIndex, questions.length - 2)));
  };

  const addAnswer = () => {
    if (activeQuestion.questionType === 'true_false') {
      return;
    }

    updateActiveQuestion((question) => ({
      ...question,
      answers: [...question.answers, createAnswer()]
    }));
  };

  const removeAnswer = (answerIndex) => {
    if (activeQuestion.answers.length <= 2) {
      setError('Each question must have at least two answers');
      return;
    }

    const answer = activeQuestion.answers[answerIndex];

    updateActiveQuestion((question) => {
      const nextAnswers = question.answers.filter((_, index) => index !== answerIndex);
      const nextCorrectIds = (question.correctAnswerIds || []).filter((id) => id !== answer.id);
      return {
        ...question,
        answers: nextAnswers,
        correctAnswerIds: nextCorrectIds,
        correctAnswerId: nextCorrectIds[0] || ''
      };
    });
  };

  const updateAnswerField = (answerIndex, field, value) => {
    updateActiveQuestion((question) => {
      const nextAnswers = [...question.answers];
      nextAnswers[answerIndex] = { ...nextAnswers[answerIndex], [field]: value };
      return {
        ...question,
        answers: nextAnswers
      };
    });
  };

  const toggleCorrectAnswer = (answerId) => {
    updateActiveQuestion((question) => {
      if (question.questionType === 'multiple') {
        const ids = (question.correctAnswerIds || []).includes(answerId)
          ? question.correctAnswerIds.filter((id) => id !== answerId)
          : [...(question.correctAnswerIds || []), answerId];

        return {
          ...question,
          correctAnswerIds: ids,
          correctAnswerId: ids[0] || ''
        };
      }

      return {
        ...question,
        correctAnswerId: answerId,
        correctAnswerIds: [answerId]
      };
    });
  };

  const removeQuestionImage = () => {
    updateActiveQuestion((question) => ({ ...question, imageUrl: '' }));
  };

  const removeAnswerImage = (answerIndex) => {
    updateAnswerField(answerIndex, 'imageUrl', '');
  };

  const handleImageUpload = async (file, type, answerIndex) => {
    try {
      const response = await imageAPI.uploadImage(file);
      if (type === 'question') {
        updateActiveQuestion((question) => ({
          ...question,
          imageUrl: response.data.imageUrl
        }));
      } else {
        updateAnswerField(answerIndex, 'imageUrl', response.data.imageUrl);
      }
    } catch (err) {
      setError('Failed to upload image. Please try again.');
      console.error(err);
    }
  };

  const validateQuiz = () => {
    if (!title.trim()) {
      return 'Quiz title is required';
    }

    if (questions.length === 0) {
      return 'At least one question is required';
    }

    for (const question of questions) {
      if (!hasContent(question)) {
        return 'Each question needs text, image, or both';
      }

      const validAnswers = question.answers.filter(hasContent);
      if (validAnswers.length < 2) {
        return 'Each question needs at least two answer options with content';
      }

      const correctAnswerIds = [
        ...(Array.isArray(question.correctAnswerIds) ? question.correctAnswerIds : []),
        question.correctAnswerId
      ].filter(Boolean);

      if (correctAnswerIds.length === 0) {
        return 'You must select at least one correct answer for every question';
      }

      if (question.questionType === 'single' && correctAnswerIds.length > 1) {
        return 'Single-choice questions can only have one correct answer';
      }
    }

    return '';
  };

  const handleSubmit = async () => {
    const validationError = validateQuiz();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError('');

    const payload = {
      title: title.trim(),
      description,
      category: category.trim() || 'General',
      tags,
      creatorName: creatorName.trim() || 'Anonymous',
      difficulty,
      status,
      timeLimit: parseInt(timeLimit, 10) || 0,
      questionTimeLimit: parseInt(questionTimeLimit, 10) || 0,
      passingScore: parseInt(passingScore, 10) || 70,
      questions: questions.map((question) => {
        const normalized = normalizeQuestion(question);
        return {
          ...normalized,
          correctAnswerId: normalized.correctAnswerIds[0] || normalized.correctAnswerId || '',
          correctAnswerIds: normalized.correctAnswerIds
        };
      })
    };

    try {
      if (isEditMode && quizToEdit?._id) {
        await quizAPI.updateQuiz(quizToEdit._id, payload);
        onUpdateComplete?.();
      } else {
        await quizAPI.createQuiz(payload);
        onComplete?.();
      }
    } catch (err) {
      setError(isEditMode ? 'Failed to update quiz' : 'Failed to create quiz');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container builder-container">
      <div className="builder-shell card">
        <div className="builder-meta">
          <h2>{isEditMode ? 'Edit Quiz' : 'Create Quiz'}</h2>
          {error && <div className="error-message">{error}</div>}

          <div className="builder-grid">
            <div className="form-group">
              <label>Title *</label>
              <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Quiz title" />
            </div>
            <div className="form-group">
              <label>Category</label>
              <input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g. Science" />
            </div>
            <div className="form-group">
              <label>Creator name</label>
              <input value={creatorName} onChange={(e) => setCreatorName(e.target.value)} placeholder="Your display name" />
            </div>
            <div className="form-group">
              <label>Tags (comma separated)</label>
              <input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="math, algebra, grade 7" />
            </div>
            <div className="form-group">
              <label>Difficulty</label>
              <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
            <div className="form-group">
              <label>Status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </div>
            <div className="form-group">
              <label>Quiz timer (seconds)</label>
              <input type="number" min="0" value={timeLimit} onChange={(e) => setTimeLimit(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Per-question timer (seconds)</label>
              <input type="number" min="0" value={questionTimeLimit} onChange={(e) => setQuestionTimeLimit(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Passing score (%)</label>
              <input type="number" min="0" max="100" value={passingScore} onChange={(e) => setPassingScore(e.target.value)} />
            </div>
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What this quiz covers" />
          </div>
        </div>

        <div className="builder-main">
          <aside className="builder-left">
            <div className="builder-left-header">
              <h3>Questions</h3>
              <button className="btn btn-primary" onClick={addQuestion}>+ Add</button>
            </div>

            {questions.length === 0 && (
              <div className="card" style={{ textAlign: 'center' }}>
                No questions yet - add your first question.
              </div>
            )}

            {questions.map((question, index) => {
              const answered = hasContent(question) && question.answers.some(hasContent);
              const active = index === activeQuestionIndex;

              return (
                <div key={question.id} className={`builder-question-item ${active ? 'active' : ''}`}>
                  <button className="question-select-btn" onClick={() => setActiveQuestionIndex(index)}>
                    <strong>Q{index + 1}</strong>
                    <span>{question.text?.trim() || 'Untitled question'}</span>
                    <small>{answered ? 'Ready' : 'Incomplete'}</small>
                  </button>
                  <div className="builder-question-controls">
                    <button className="btn btn-secondary" onClick={() => moveQuestion(index, -1)}>Up</button>
                    <button className="btn btn-secondary" onClick={() => moveQuestion(index, 1)}>Down</button>
                    <button className="btn btn-secondary" onClick={() => duplicateQuestion(index)}>Duplicate</button>
                    <button className="btn btn-danger" onClick={() => removeQuestion(index)}>Delete</button>
                  </div>
                </div>
              );
            })}
          </aside>

          <section className="builder-right">
            {activeQuestion && (
              <>
                <h3>Question {activeQuestionIndex + 1}</h3>

                <div className="form-group">
                  <label>Question type</label>
                  <select value={activeQuestion.questionType} onChange={(e) => setQuestionType(e.target.value)}>
                    <option value="single">Single correct</option>
                    <option value="multiple">Multiple correct</option>
                    <option value="true_false">True / False</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Question text</label>
                  <textarea
                    value={activeQuestion.text}
                    onChange={(e) => updateActiveQuestion((question) => ({ ...question, text: e.target.value }))}
                    placeholder="Write the question or leave empty for image-only"
                  />
                </div>

                <div className="form-group">
                  <label>Question image</label>
                  <input type="file" accept="image/*" onChange={(e) => e.target.files[0] && handleImageUpload(e.target.files[0], 'question')} />
                  {activeQuestion.imageUrl && (
                    <div className="image-actions">
                      <img src={activeQuestion.imageUrl} alt="Question" className="image-preview" />
                      <button className="btn btn-secondary" onClick={removeQuestionImage}>Remove image</button>
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label>Explanation (shown in results)</label>
                  <textarea
                    value={activeQuestion.description}
                    onChange={(e) => updateActiveQuestion((question) => ({ ...question, description: e.target.value }))}
                    placeholder="Explain the correct answer"
                  />
                </div>

                <h4>Answers</h4>
                {activeQuestion.answers.map((answer, answerIndex) => {
                  const isCorrect = (activeQuestion.correctAnswerIds || []).includes(answer.id);
                  return (
                    <div key={answer.id} className="answer-editor">
                      <label className="correct-toggle">
                        <input
                          type={activeQuestion.questionType === 'multiple' ? 'checkbox' : 'radio'}
                          name={`correct-${activeQuestion.id}`}
                          checked={isCorrect}
                          onChange={() => toggleCorrectAnswer(answer.id)}
                        />
                        Correct
                      </label>
                      <input
                        type="text"
                        value={answer.text}
                        onChange={(e) => updateAnswerField(answerIndex, 'text', e.target.value)}
                        placeholder="Answer text"
                      />
                      {activeQuestion.questionType !== 'true_false' && (
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => e.target.files[0] && handleImageUpload(e.target.files[0], 'answer', answerIndex)}
                        />
                      )}

                      {answer.imageUrl && (
                        <div className="image-actions">
                          <img src={answer.imageUrl} alt="Answer" className="image-preview" />
                          <button className="btn btn-secondary" onClick={() => removeAnswerImage(answerIndex)}>Remove image</button>
                        </div>
                      )}

                      {activeQuestion.questionType !== 'true_false' && activeQuestion.answers.length > 2 && (
                        <button className="btn btn-danger" onClick={() => removeAnswer(answerIndex)}>Delete answer</button>
                      )}
                    </div>
                  );
                })}

                {activeQuestion.questionType !== 'true_false' && (
                  <button className="btn btn-secondary" onClick={addAnswer}>+ Add answer</button>
                )}

                <div className="live-preview card">
                  <h4>Live preview</h4>
                  <p><strong>{activeQuestion.text || 'Image-only question'}</strong></p>
                  {activeQuestion.imageUrl && <img src={activeQuestion.imageUrl} alt="Preview question" className="image-preview" />}
                  <ul className="preview-answer-list">
                    {activeQuestion.answers.map((answer) => (
                      <li key={answer.id} className={(activeQuestion.correctAnswerIds || []).includes(answer.id) ? 'correct' : ''}>
                        <span>{answer.text || 'Image-only answer'}</span>
                        {answer.imageUrl && <img src={answer.imageUrl} alt="Preview answer" className="image-preview" />}
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}
          </section>
        </div>

        <div className="builder-actions">
          <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
            {loading ? (isEditMode ? 'Saving...' : 'Publishing...') : (isEditMode ? 'Save Changes' : 'Create Quiz')}
          </button>
          <button className="btn btn-secondary" onClick={onCancel}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
