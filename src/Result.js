import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Switch from 'react-switch'
import { FaMoon, FaSun } from 'react-icons/fa'
import { useAuth } from './contexts/AuthContext'
import { useTheme } from './contexts/ThemeContext'
import { saveQuizAttempt, getLatestQuizAttempts } from './services/quizService'
import QuizHistory from './components/QuizHistory'
import './Result.css'

const Result = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { currentUser } = useAuth()

  // Destructure state from location
  const { questions, selectedAnswers, userName, examTitle } = location.state || {}

  const [showIncorrectAnswers, setShowIncorrectAnswers] = useState(false) // Toggle for incorrect answers
  const { isDarkMode, toggleTheme } = useTheme()
  const [quizAttempts, setQuizAttempts] = useState([])
  const [loading, setLoading] = useState(true)
  const [attemptSaved, setAttemptSaved] = useState(false)

  // Calculate results
  const calculateResults = () => {
    if (!questions || !selectedAnswers) return { correctCount: 0, percentage: 0 }
    
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

  // Save quiz attempt and fetch history - combined into a single useEffect
  useEffect(() => {
    const fetchData = async () => {
      if (!currentUser) return
      
      try {
        // Only save the quiz attempt if it hasn't been saved yet and we have questions
        if (!attemptSaved && questions) {
          console.log('Saving quiz attempt for user:', currentUser.uid)
          console.log('Quiz data:', {
            examTitle,
            percentage,
            correctCount,
            questions: questions.length // Just log the length to avoid console clutter
          })
          
          // Save the current quiz attempt with a unique ID
          const result = await saveQuizAttempt(currentUser.uid, {
            examTitle,
            percentage,
            correctCount,
            questions,
            attemptId: `${currentUser.uid}_${Date.now()}`
          })
          console.log('Save result:', result)
          setAttemptSaved(true)
        }
        
        // Always fetch quiz history
        console.log('Fetching quiz history for user:', currentUser.uid)
        const attempts = await getLatestQuizAttempts(currentUser.uid)
        console.log('Fetched quiz attempts:', attempts)
        setQuizAttempts(attempts)
      } catch (error) {
        console.error('Error saving/fetching quiz data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [currentUser, questions, examTitle, percentage, correctCount, attemptSaved])

  // No need for a separate handleThemeToggle function, we'll use toggleTheme from context

  const handleRestart = () => {
    navigate('/')
  }

  if (!questions || !selectedAnswers) {
    return <div>Error: No data available.</div>
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
      {examTitle && <h2 className="exam-title">{examTitle}</h2>}
      
      <div className="toggle-container">
        <div></div> {/* Empty div for spacing */}
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
      
      <h1>{currentUser?.displayName ? `${currentUser.displayName}'s Result` : 'Your Result'}</h1>
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
      
      {/* Quiz History Section */}
      {!loading && <QuizHistory attempts={quizAttempts} />}
    </div>
  )
}

export default Result
