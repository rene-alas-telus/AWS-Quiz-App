import React from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import Quiz from './Quiz'
import Result from './Result'
import ExamSelection from './ExamSelection'
import Login from './components/Login'
import Navbar from './components/Navbar'
import PrivateRoute from './components/PrivateRoute'
import CleanupAttempts from './components/CleanupAttempts'
import { AuthProvider } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import './App.css'

const App = () => {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Router>
          <Navbar />
          <div className="app-container">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={
                <PrivateRoute>
                  <ExamSelection />
                </PrivateRoute>
              } />
              <Route path="/quiz" element={
                <PrivateRoute>
                  <Quiz />
                </PrivateRoute>
              } />
              <Route path="/result" element={
                <PrivateRoute>
                  <Result />
                </PrivateRoute>
              } />
              <Route path="/cleanup" element={
                <PrivateRoute>
                  <CleanupAttempts />
                </PrivateRoute>
              } />
            </Routes>
          </div>
        </Router>
      </ThemeProvider>
    </AuthProvider>
  )
}

export default App
