import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import './Result.css' // Import the CSS file

const Result = () => {
  const location = useLocation()
  const navigate = useNavigate()

  // Destructure state from location
  const { questions, selectedAnswers, userName } = location.state || {}

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

      // Debugging logs
      console.log('Question:', question.question)
      console.log('User Answers:', userAnswers)
      console.log('Correct Answers:', correctAnswers)

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

  return (
    <div className="result-container">
      <h1>{userName ? `${userName}'s Result` : 'Your Result'}</h1>
      <p className={`result-text ${pass ? 'pass' : 'fail'}`}>
        {pass ? 'Pass' : 'Fail'} - {percentage.toFixed(2)}%
      </p>
      <button className="restart-button" onClick={handleRestart}>
        Restart Quiz
      </button>
    </div>
  )
}

export default Result
