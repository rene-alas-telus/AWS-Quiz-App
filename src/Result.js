import React, { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Switch from 'react-switch'
import './Result.css' // Import the CSS file

const Result = () => {
  const location = useLocation()
  const navigate = useNavigate()

  // Destructure state from location
  const { questions, selectedAnswers, userName } = location.state || {}

  const [showIncorrectAnswers, setShowIncorrectAnswers] = useState(false) // Toggle for incorrect answers

  if (!questions || !selectedAnswers) {
    return <div>Error: No data available.</div>
  }

  const calculateResults = () => {
    let correctCount = 0

    questions.forEach((question, index) => {
      const userAnswers = Object.keys(selectedAnswers[index] || {}).filter(
        (key) => selectedAnswers[index][key]
      )
      const correctAnswers = question.correctAnswer
        .split(',')
        .map((answer) => answer.trim())

      // Check if userAnswers match correctAnswers
      if (
        userAnswers.length === correctAnswers.length &&
        userAnswers.every((answer) => correctAnswers.includes(answer)) &&
        correctAnswers.every((answer) => userAnswers.includes(answer))
      ) {
        correctCount++
      }
    })

    const percentage = (correctCount / questions.length) * 100
    return { correctCount, percentage }
  }

  const { correctCount, percentage } = calculateResults()
  const pass = percentage >= 70

  const handleRestart = () => {
    navigate('/quiz')
  }

  // Function to render and count the wrong answers
  const getWrongAnswers = () => {
    return questions
      .map((question, index) => {
        const userAnswers = Object.keys(selectedAnswers[index] || {}).filter(
          (key) => selectedAnswers[index][key]
        )
        const correctAnswers = question.correctAnswer
          .split(',')
          .map((answer) => answer.trim())

        // If user got the question wrong
        if (
          userAnswers.length !== correctAnswers.length ||
          !userAnswers.every((answer) => correctAnswers.includes(answer)) ||
          !correctAnswers.every((answer) => userAnswers.includes(answer))
        ) {
          return (
            <div key={index} className="wrong-answer-section">
              <h4>{question.question}</h4>
              <div className="answers">
                {question.possibleAnswers.map((answer, i) => {
                  const isUserSelected = userAnswers.includes(answer[0])
                  const isCorrectAnswer = correctAnswers.includes(answer[0])
                  return (
                    <div
                      key={i}
                      className={`answer-item ${
                        isUserSelected && !isCorrectAnswer
                          ? 'wrong-answer'
                          : isCorrectAnswer
                          ? 'correct-answer'
                          : ''
                      }`}
                    >
                      {answer}
                    </div>
                  )
                })}
              </div>
            </div>
          )
        }
        return null
      })
      .filter(Boolean) // Remove any null values
  }

  const wrongAnswers = getWrongAnswers() // Store the incorrect answers in a variable
  const incorrectCount = wrongAnswers.length // Calculate the number of incorrect answers

  return (
    <div className="result-container">
      <h1>{userName ? `${userName}'s Result` : 'Your Result'}</h1>
      <p className={`result-text ${pass ? 'pass' : 'fail'}`}>
        {pass ? 'Pass' : 'Fail'} - {percentage.toFixed(2)}%
      </p>

      <div>
        <button
          className="restart-button"
          onClick={handleRestart}
          style={{ marginRight: '20px' }}
        >
          Restart Quiz
        </button>
        <button
          className="restart-button"
          onClick={() => setShowIncorrectAnswers((prev) => !prev)}
        >
          {showIncorrectAnswers
            ? 'Hide Incorrect Answers'
            : 'Show Incorrect Answers'}
        </button>
      </div>

      {/* Display incorrect answers if toggle is active */}
      {showIncorrectAnswers && (
        <div className="wrong-answers-list">
          <h3>{incorrectCount} Total Incorrect Questions:</h3>{' '}
          {/* Show the number of incorrect questions */}
          {incorrectCount > 0 ? wrongAnswers : <p>All answers were correct!</p>}
        </div>
      )}
    </div>
  )
}

export default Result
