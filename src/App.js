import React from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import Quiz from './Quiz'
import Result from './Result'

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Quiz />} />
        <Route path="/quiz" element={<Quiz />} />
        <Route path="/result" element={<Result />} />
      </Routes>
    </Router>
  )
}

export default App
