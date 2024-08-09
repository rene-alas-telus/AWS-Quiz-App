import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { v4 as uuidv4 } from 'uuid'
import './Quiz.css' // Import the CSS file

const Quiz = () => {
  const [questions, setQuestions] = useState([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState({})
  const [userName, setUserName] = useState('')
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

    if (isMultipleChoice) {
      setSelectedAnswers((prev) => {
        const updatedAnswers = {
          ...prev,
          [currentQuestionIndex]: {
            ...prev[currentQuestionIndex],
            [name]: checked
          }
        }
        console.log('Updated Selected Answers:', updatedAnswers)
        return updatedAnswers
      })
    } else {
      setSelectedAnswers((prev) => {
        const updatedAnswers = {
          ...prev,
          [currentQuestionIndex]: {
            [name]: checked
          }
        }
        console.log('Updated Selected Answers:', updatedAnswers)
        return updatedAnswers
      })
    }
  }

  const handleSubmit = () => {
    console.log('Final Selected Answers:', selectedAnswers)
    navigate('/result', { state: { questions, selectedAnswers, userName } })
  }

  const goToPreviousQuestion = () => {
    setCurrentQuestionIndex((prevIndex) => Math.max(prevIndex - 1, 0))
  }

  const goToNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prevIndex) => prevIndex + 1)
    } else {
      handleSubmit()
    }
  }

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
                selectedAnswers[currentQuestionIndex]?.[answer[0]]
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
      <div className="navigation-buttons">
        {currentQuestionIndex > 0 && (
          <button onClick={goToPreviousQuestion}>Previous</button>
        )}
        <button
          onClick={goToNextQuestion}
          disabled={
            isMultipleChoice &&
            Object.keys(selectedAnswers[currentQuestionIndex] || {}).length ===
              0
          }
        >
          {currentQuestionIndex < questions.length - 1 ? 'Next' : 'Submit'}
        </button>
      </div>
    </div>
  )
}

export default Quiz
