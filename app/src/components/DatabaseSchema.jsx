import { useState } from 'react'
import { getSchema } from '../services/api'

function DatabaseSchema({ uuid, schema, error, onSchemaFetched }) {
  const [isFetching, setIsFetching] = useState(false)

  const handleGetSchema = async () => {
    if (!uuid) {
      onSchemaFetched('', 'Please upload a file first')
      return
    }

    setIsFetching(true)
    
    try {
      const schemaData = await getSchema(uuid)
      onSchemaFetched(schemaData, null)
    } catch (error) {
      console.error('Schema error:', error)
      onSchemaFetched('', error.message || 'Failed to get schema. Please check the server and try again.')
    } finally {
      setIsFetching(false)
    }
  }

  return (
    <div className="section">
      <h2>Database Schema</h2>
      <div className="button-group">
        <button 
          onClick={handleGetSchema}
          disabled={!uuid || isFetching}
        >
          {isFetching ? 'Fetching...' : 'Get Schema'}
        </button>
      </div>
      
      {error && <p className="error">{error}</p>}
      
      {schema && <pre>{schema}</pre>}
    </div>
  )
}

export default DatabaseSchema