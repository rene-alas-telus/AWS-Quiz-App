import React from 'react';
import './QuizHistory.css';

const QuizHistory = ({ attempts }) => {
  if (!attempts || attempts.length === 0) {
    return (
      <div className="quiz-history-container">
        <h3>Quiz History</h3>
        <p className="no-history">No previous quiz attempts found.</p>
      </div>
    );
  }

  // Format date to a more readable format
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="quiz-history-container">
      <h3>Quiz History</h3>
      <div className="table-container">
        <table className="quiz-history-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Exam Type</th>
              <th>Score</th>
              <th>Result</th>
            </tr>
          </thead>
          <tbody>
            {attempts.map((attempt) => (
              <tr key={attempt.id}>
                <td>{formatDate(attempt.date)}</td>
                <td>{attempt.examType}</td>
                <td>{attempt.score.toFixed(2)}%</td>
                <td>
                  <span className={`result-badge ${attempt.passed ? 'success' : 'fail'}`}>
                    {attempt.passed ? 'Success' : 'Fail'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default QuizHistory;
