import { useState, useRef } from 'react'
import { executeQuery } from '../services/api'

function QueryExecution({ uuid, onQueryExecuted }) {
  const [isExecuting, setIsExecuting] = useState(false)
  const queryInputRef = useRef(null)

  const handleExecuteQuery = async () => {
    const query = queryInputRef.current.value.trim()
    
    if (!query) {
      onQueryExecuted(null, 'Please enter a query')
      return
    }
    
    if (!uuid) {
      onQueryExecuted(null, 'Please upload a file first')
      return
    }

    setIsExecuting(true)
    
    try {
      const results = await executeQuery(uuid, query)
      onQueryExecuted(results, null)
    } catch (error) {
      console.error('Query error:', error)
      onQueryExecuted(null, error.message || 'Failed to execute query. Please check the server and try again.')
    } finally {
      setIsExecuting(false)
    }
  }

  return (
    <div className="section">
      <h2>Execute SQL Query</h2>
      <textarea 
        ref={queryInputRef}
        placeholder="Enter your SQL query here (e.g., SELECT * FROM data)"
        disabled={isExecuting}
      />
      <div className="button-group">
        <button 
          onClick={handleExecuteQuery}
          disabled={!uuid || isExecuting}
        >
          {isExecuting ? 'Executing...' : 'Execute Query'}
        </button>
      </div>
    </div>
  )
}

export default QueryExecution