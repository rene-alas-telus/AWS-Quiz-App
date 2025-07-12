import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Switch from 'react-switch'
import { FaMoon, FaSun } from 'react-icons/fa'
import './Quiz.css'

const ExamSelection = () => {
  const [selectedExam, setSelectedExam] = useState('')
  const [isDarkMode, setIsDarkMode] = useState(false)
  const navigate = useNavigate()

  const handleExamSelection = (exam) => {
    setSelectedExam(exam)
  }

  const handleStartQuiz = () => {
    if (selectedExam) {
      navigate('/quiz', { state: { examType: selectedExam, isDarkMode } })
    }
  }

  const handleThemeToggle = () => {
    setIsDarkMode((prev) => !prev)
    document.body.classList.toggle('dark-mode')
  }

  return (
    <div className="quiz-container">
      <h1>AWS Certification Practice Test</h1>
      
      <div className="toggle-container">
        <div></div> {/* Empty div for spacing */}
        <label>
          Theme Changer:
          <div style={{ marginLeft: '5px' }}></div>
          <Switch
            onChange={handleThemeToggle}
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
      
      <p>Select which AWS certification exam you want to practice for:</p>
      
      <div className="options-container">
        <div 
          className={`option ${selectedExam === 'practitioner' ? 'selected' : ''}`}
          onClick={() => handleExamSelection('practitioner')}
        >
          <input 
            type="radio" 
            name="examType" 
            checked={selectedExam === 'practitioner'} 
            onChange={() => handleExamSelection('practitioner')} 
          />
          <label>Cloud Practitioner CLF-C02</label>
        </div>
        
        <div 
          className={`option ${selectedExam === 'developer' ? 'selected' : ''}`}
          onClick={() => handleExamSelection('developer')}
        >
          <input 
            type="radio" 
            name="examType" 
            checked={selectedExam === 'developer'} 
            onChange={() => handleExamSelection('developer')} 
          />
          <label>Developer Associate DVA-C02</label>
        </div>
      </div>
      
      <div className="navigation-buttons">
        <button 
          onClick={handleStartQuiz} 
          disabled={!selectedExam}
        >
          Start Quiz
        </button>
      </div>
    </div>
  )
}

export default ExamSelection
