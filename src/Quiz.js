import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { v4 as uuidv4 } from 'uuid'
import './Quiz.css' // Import the CSS file

const Quiz = () => {
  const [questions, setQuestions] = useState([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState({})
  const [userName, setUserName] = useState('')
  const [showAnswerFeedback, setShowAnswerFeedback] = useState(false)
  const [answerFeedback, setAnswerFeedback] = useState({})
  const [allAnswersSelected, setAllAnswersSelected] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    // Fetch questions and randomize
    fetch('/questions.json') // Adjusted path to fetch from public folder
      .then((response) => response.json())
      .then((data) => {
        const shuffled = data.sort(() => 0.5 - Math.random()).slice(0, 65)
        setQuestions(shuffled)
      })
  }, [])

  const handleAnswerChange = (e) => {
    const { name, checked } = e.target
    const isMultipleChoice =
      questions[currentQuestionIndex].correctAnswer.includes(',')

    setSelectedAnswers((prev) => {
      const updatedAnswers = {
        ...prev,
        [currentQuestionIndex]: {
          ...prev[currentQuestionIndex],
          [name]: checked
        }
      }

      // Check if all required answers are selected
      const currentQuestion = questions[currentQuestionIndex]
      const totalAnswersRequired = isMultipleChoice
        ? currentQuestion.correctAnswer.split(',').length
        : 1

      const selectedAnswerCount = Object.keys(
        updatedAnswers[currentQuestionIndex] || {}
      ).length

      // Update the state to indicate if all required answers are selected
      setAllAnswersSelected(selectedAnswerCount >= totalAnswersRequired)

      return updatedAnswers
    })
  }

  const handleSubmit = () => {
    navigate('/result', { state: { questions, selectedAnswers, userName } })
  }

  const goToPreviousQuestion = () => {
    setCurrentQuestionIndex((prevIndex) => Math.max(prevIndex - 1, 0))
  }

  const goToNextQuestion = () => {
    if (showAnswerFeedback) {
      setTimeout(() => {
        if (currentQuestionIndex < questions.length - 1) {
          setCurrentQuestionIndex((prevIndex) => prevIndex + 1)
          setAnswerFeedback({})
        } else {
          handleSubmit()
        }
      }, 2000)
    } else {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex((prevIndex) => prevIndex + 1)
      } else {
        handleSubmit()
      }
    }
  }

  const handleToggleChange = () => {
    setShowAnswerFeedback((prev) => !prev)
  }

  useEffect(() => {
    if (showAnswerFeedback && selectedAnswers[currentQuestionIndex]) {
      const currentQuestion = questions[currentQuestionIndex]
      const correctAnswers = new Set(currentQuestion.correctAnswer.split(','))
      const selected = new Set(
        Object.keys(selectedAnswers[currentQuestionIndex] || {})
      )
      const feedback = {}

      // Determine feedback
      for (const answer of currentQuestion.possibleAnswers) {
        const isCorrect = correctAnswers.has(answer[0])
        const isSelected = selected.has(answer[0])
        if (isCorrect && isSelected) {
          feedback[answer[0]] = 'correct'
        } else if (isCorrect) {
          feedback[answer[0]] = 'correct'
        } else if (isSelected) {
          feedback[answer[0]] = 'incorrect'
        }
      }

      // Show feedback only if all required answers are selected
      if (allAnswersSelected) {
        setAnswerFeedback(feedback)
        // Navigate after displaying feedback
        goToNextQuestion()
      }
    }
  }, [
    showAnswerFeedback,
    selectedAnswers,
    currentQuestionIndex,
    questions,
    allAnswersSelected
  ])

  if (questions.length === 0) {
    return <div>Loading...</div>
  }

  const currentQuestion = questions[currentQuestionIndex]
  const isMultipleChoice = currentQuestion.correctAnswer.includes(',')
  const totalAnswersRequired = isMultipleChoice
    ? currentQuestion.correctAnswer.split(',').length
    : null

  return (
    <div className="quiz-container">
      <div className="toggle-container">
        <label>
          <input
            type="checkbox"
            checked={showAnswerFeedback}
            onChange={handleToggleChange}
          />
          Show Answer Feedback
        </label>
      </div>
      <div className="question-container">
        <h2>Question {currentQuestionIndex + 1}</h2>
        <p className="question-text">
          {currentQuestion.question}
          {isMultipleChoice &&
            totalAnswersRequired &&
            ` (Select ${totalAnswersRequired} answers)`}
        </p>
        <div className="options-container">
          {currentQuestion.possibleAnswers.map((answer) => (
            <div
              key={uuidv4()}
              className={`option ${
                answerFeedback[answer[0]] === 'correct'
                  ? 'correct'
                  : answerFeedback[answer[0]] === 'incorrect'
                  ? 'incorrect'
                  : selectedAnswers[currentQuestionIndex]?.[answer[0]]
                  ? 'selected'
                  : ''
              }`}
            >
              <input
                type={isMultipleChoice ? 'checkbox' : 'radio'}
                name={answer[0]}
                checked={!!selectedAnswers[currentQuestionIndex]?.[answer[0]]}
                onChange={handleAnswerChange}
                disabled={
                  isMultipleChoice
                    ? false
                    : !!selectedAnswers[currentQuestionIndex]?.[answer[0]]
                }
              />
              <label>{answer}</label>
            </div>
          ))}
        </div>
      </div>
      {!showAnswerFeedback && (
        <div className="navigation-buttons">
          <button onClick={goToPreviousQuestion} disabled={showAnswerFeedback}>
            Previous
          </button>
          <button
            onClick={goToNextQuestion}
            disabled={
              isMultipleChoice &&
              Object.keys(selectedAnswers[currentQuestionIndex] || {}).length <
                (isMultipleChoice ? totalAnswersRequired : 1)
            }
          >
            {currentQuestionIndex < questions.length - 1 ? 'Next' : 'Submit'}
          </button>
        </div>
      )}
    </div>
  )
}

export default Quiz
