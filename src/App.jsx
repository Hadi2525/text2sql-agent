import { useState } from 'react'
import Container from './components/Container'
import FileUpload from './components/FileUpload'
import QueryExecution from './components/QueryExecution'
import QueryResults from './components/QueryResults'
import DatabaseSchema from './components/DatabaseSchema'

function App() {
  const [uuid, setUuid] = useState(null)
  const [queryResults, setQueryResults] = useState(null)
  const [queryError, setQueryError] = useState('')
  const [schema, setSchema] = useState('')
  const [schemaError, setSchemaError] = useState('')

  return (
    <Container>
      <FileUpload 
        onFileUploaded={(newUuid) => setUuid(newUuid)}
      />
      
      <QueryExecution 
        uuid={uuid}
        onQueryExecuted={(results, error) => {
          setQueryResults(results)
          setQueryError(error || '')
        }}
      />
      
      <QueryResults 
        results={queryResults}
        error={queryError}
      />
      
      <DatabaseSchema 
        uuid={uuid}
        schema={schema}
        error={schemaError}
        onSchemaFetched={(newSchema, error) => {
          setSchema(newSchema)
          setSchemaError(error || '')
        }}
      />
    </Container>
  )
}

export default App