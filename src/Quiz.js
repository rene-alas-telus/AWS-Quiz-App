import React, { useEffect, useState } from 'react'
import Switch from 'react-switch'
import { useNavigate, useLocation } from 'react-router-dom'
import { v4 as uuidv4 } from 'uuid'
import { FaMoon, FaSun, FaClock } from 'react-icons/fa'
import { useAuth } from './contexts/AuthContext'
import { useTheme } from './contexts/ThemeContext'
import './Quiz.css'

const Quiz = () => {
  const [questions, setQuestions] = useState([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState({})
  const [userName, setUserName] = useState('')
  const [showAnswerFeedback, setShowAnswerFeedback] = useState(false)
  const [answerFeedback, setAnswerFeedback] = useState({})
  const [allAnswersSelected, setAllAnswersSelected] = useState(false)
  const [timer, setTimer] = useState(90 * 60) // 90 minutes in seconds
  const [examTitle, setExamTitle] = useState('')
  const navigate = useNavigate()
  const location = useLocation()
  const { currentUser } = useAuth()
  const { isDarkMode, toggleTheme } = useTheme()

  // Fetch questions based on exam type and set dark mode
  useEffect(() => {
    const examType = location.state?.examType || 'practitioner'
    const jsonFile = examType === 'practitioner' 
      ? '/practitionerQuestions.json' 
      : '/developerQuestions.json'
    
    // Set the exam title
    setExamTitle(examType === 'practitioner' 
      ? 'Cloud Practitioner Practice Test' 
      : 'Developer Associate Practice Test')
    
    // No need to set dark mode from location state anymore
    // The ThemeContext handles this now
    
    fetch(jsonFile)
      .then((response) => response.json())
      .then((data) => {
        // Reduced number of questions for testing (65 )
        const shuffled = data.sort(() => 0.5 - Math.random()).slice(0, 65)
        setQuestions(shuffled)
      })
  }, [location.state])

  // Handle the timer countdown
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1)
      }, 1000)
      return () => clearInterval(interval)
    } else {
      // Time's up, auto-submit the quiz
      handleSubmit()
    }
  }, [timer])

  // Format the timer as MM:SS
  const formatTime = (time) => {
    const minutes = Math.floor(time / 60)
    const seconds = time % 60
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`
  }

  const handleAnswerChange = (e) => {
    const { name, checked } = e.target
    const isMultipleChoice =
      questions[currentQuestionIndex].correctAnswer.includes(',')

    setSelectedAnswers((prev) => {
      const updatedAnswers = {
        ...prev,
        [currentQuestionIndex]: isMultipleChoice
          ? {
              ...prev[currentQuestionIndex],
              [name]: checked
            }
          : {
              [name]: checked
            }
      }

      const currentQuestion = questions[currentQuestionIndex]
      const totalAnswersRequired = isMultipleChoice
        ? currentQuestion.correctAnswer.split(',').length
        : 1

      const selectedAnswerCount = Object.keys(
        updatedAnswers[currentQuestionIndex] || {}
      ).length

      setAllAnswersSelected(selectedAnswerCount >= totalAnswersRequired)

      return updatedAnswers
    })
  }

  const handleSubmit = () => {
    // Mark unanswered questions as incorrect
    const autoGradedAnswers = { ...selectedAnswers }
    questions.forEach((question, index) => {
      if (!autoGradedAnswers[index]) {
        autoGradedAnswers[index] = {}
        question.correctAnswer.split(',').forEach((answer) => {
          autoGradedAnswers[index][answer] = false // Mark as incorrect
        })
      }
    })

    // Log the data being passed to the result page
    console.log('Submitting quiz with data:', {
      questions, 
      selectedAnswers: autoGradedAnswers, 
      userName: currentUser?.displayName || userName,
      examTitle
    })

    navigate('/result', {
      state: { 
        questions, 
        selectedAnswers: autoGradedAnswers, 
        userName: currentUser?.displayName || userName,
        examTitle
      }
    })
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

      if (allAnswersSelected) {
        setAnswerFeedback(feedback)
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
      {/* Exam Title */}
      <h1 className="exam-title">{examTitle}</h1>
      
      {/* Timer Display */}
      <div className="timer">
        <p>
          <FaClock
            color={isDarkMode ? 'white' : 'black'}
            style={{ marginRight: '5px' }}
          />
          <label className="timerLabel">Time Remaining:</label>{' '}
          {formatTime(timer)}
        </p>
      </div>

      <div className="toggle-container">
        <label>
          Show Visual Feedback:
          <div style={{ marginLeft: '5px' }}></div>
          <Switch onChange={handleToggleChange} checked={showAnswerFeedback} />
        </label>
        <div style={{ marginLeft: '50px' }}></div>
        <label>
          Theme Changer:
          <div style={{ marginLeft: '5px' }}></div>
          <Switch
            onChange={toggleTheme}
            checked={isDarkMode}
            offColor="#222"
            onColor="#000080"
            checkedIcon={
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  height: '100%',
                  paddingRight: '5px'
                }}
              >
                <FaSun color="yellow" />
              </div>
            }
            uncheckedIcon={
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  height: '100%',
                  paddingRight: '5px'
                }}
              >
                <FaMoon color="white" />
              </div>
            }
          />
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
                id={`answer-${answer[0]}-${currentQuestionIndex}`}
                name={answer[0]}
                checked={!!selectedAnswers[currentQuestionIndex]?.[answer[0]]}
                onChange={handleAnswerChange}
                disabled={
                  isMultipleChoice
                    ? false
                    : !!selectedAnswers[currentQuestionIndex]?.[answer[0]]
                }
              />
              <label htmlFor={`answer-${answer[0]}-${currentQuestionIndex}`}>{answer}</label>
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
                totalAnswersRequired
            }
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}

export default Quiz
