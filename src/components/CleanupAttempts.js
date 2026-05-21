import React, { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { getLatestQuizAttempts, deleteQuizAttempt } from '../services/quizService'

// Temporary admin/self-service page for removing duplicate quiz attempts that
// were created by the pre-fix Result-page remount bug. Mounted at /cleanup.
const CleanupAttempts = () => {
  const { currentUser } = useAuth()
  const [attempts, setAttempts] = useState([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState(null)
  const [deletingAll, setDeletingAll] = useState(false)
  const [message, setMessage] = useState('')

  const load = async () => {
    if (!currentUser) return
    setLoading(true)
    const data = await getLatestQuizAttempts(currentUser.uid, 50)
    setAttempts(data)
    setLoading(false)
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser])

  const handleDelete = async (attemptDocId) => {
    if (!window.confirm(`Delete this quiz attempt?\n\n${attemptDocId}`)) return
    setBusyId(attemptDocId)
    setMessage('')
    const result = await deleteQuizAttempt(currentUser.uid, attemptDocId)
    setBusyId(null)
    if (result?.deleted) {
      setMessage(`Deleted ${attemptDocId}`)
      load()
    } else {
      setMessage(`Failed to delete: ${result?.error || 'unknown error'}`)
    }
  }

  const handleDeleteAll = async () => {
    if (attempts.length === 0) return
    const typed = window.prompt(
      `This will permanently delete ALL ${attempts.length} of your quiz attempts.\n\nType DELETE to confirm.`
    )
    if (typed !== 'DELETE') return
    setDeletingAll(true)
    setMessage('')
    let deleted = 0
    let failed = 0
    for (const a of attempts) {
      const result = await deleteQuizAttempt(currentUser.uid, a.id)
      if (result?.deleted) deleted += 1
      else failed += 1
    }
    setDeletingAll(false)
    setMessage(`Deleted ${deleted} attempt(s)${failed ? `, ${failed} failed` : ''}.`)
    load()
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (!currentUser) return <div style={{ padding: 20 }}>Please log in.</div>
  if (loading) return <div style={{ padding: 20 }}>Loading attempts…</div>

  return (
    <div style={{ padding: 20, maxWidth: 900, margin: '0 auto' }}>
      <h2>Cleanup Quiz Attempts</h2>
      <p style={{ opacity: 0.8 }}>
        Showing your {attempts.length} most recent attempts. Click Delete to remove a row from Firestore.
      </p>
      <div style={{ margin: '10px 0' }}>
        <button
          onClick={handleDeleteAll}
          disabled={deletingAll || attempts.length === 0}
          style={{
            background: '#7a0017',
            color: '#fff',
            border: '1px solid #b00020',
            padding: '8px 16px',
            borderRadius: 4,
            fontWeight: 'bold',
            cursor: deletingAll || attempts.length === 0 ? 'not-allowed' : 'pointer',
            opacity: deletingAll || attempts.length === 0 ? 0.6 : 1
          }}
        >
          {deletingAll ? 'Deleting all…' : `Delete All (${attempts.length})`}
        </button>
      </div>
      {message && (
        <div style={{ padding: 10, margin: '10px 0', background: '#1e3a5f', color: '#fff', borderRadius: 4 }}>
          {message}
        </div>
      )}
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#333', color: '#fff' }}>
            <th style={{ padding: 8, textAlign: 'left' }}>Date</th>
            <th style={{ padding: 8, textAlign: 'left' }}>Exam</th>
            <th style={{ padding: 8, textAlign: 'right' }}>Score</th>
            <th style={{ padding: 8, textAlign: 'left' }}>Doc ID</th>
            <th style={{ padding: 8 }}></th>
          </tr>
        </thead>
        <tbody>
          {attempts.map((a) => (
            <tr key={a.id} style={{ borderBottom: '1px solid #444' }}>
              <td style={{ padding: 8 }}>{formatDate(a.date)}</td>
              <td style={{ padding: 8 }}>{a.examType}</td>
              <td style={{ padding: 8, textAlign: 'right' }}>{a.score?.toFixed(2)}%</td>
              <td style={{ padding: 8, fontSize: 11, opacity: 0.7, wordBreak: 'break-all' }}>{a.id}</td>
              <td style={{ padding: 8, textAlign: 'right' }}>
                <button
                  onClick={() => handleDelete(a.id)}
                  disabled={busyId === a.id}
                  style={{
                    background: '#b00020',
                    color: '#fff',
                    border: 'none',
                    padding: '6px 12px',
                    borderRadius: 4,
                    cursor: busyId === a.id ? 'wait' : 'pointer'
                  }}
                >
                  {busyId === a.id ? 'Deleting…' : 'Delete'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default CleanupAttempts
