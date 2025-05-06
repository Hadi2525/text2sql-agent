/**
 * Upload a file to the server
 * @param {File} file - The file to upload
 * @returns {Promise<string>} - The UUID of the uploaded file
 */
export async function uploadFile(file) {
    const formData = new FormData()
    formData.append('file', file)
    
    const response = await fetch('/upload-file', {
      method: 'POST',
      body: formData
    })
    
    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(data.detail || 'Error uploading file')
    }
    
    if (!data.uuid) {
      throw new Error('No UUID received from server')
    }
    
    return data.uuid
  }
  
  /**
   * Execute a SQL query against the uploaded file
   * @param {string} uuid - The UUID of the uploaded file
   * @param {string} query - The SQL query to execute
   * @returns {Promise<object>} - The query results
   */
  export async function executeQuery(uuid, query) {
    const payload = { uuid, query }
    
    const response = await fetch('/execute-query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })
    
    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(data.detail || 'Error executing query')
    }
    
    return data
  }
  
  /**
   * Get the schema of the uploaded file
   * @param {string} uuid - The UUID of the uploaded file
   * @returns {Promise<string>} - The schema as a string
   */
  export async function getSchema(uuid) {
    const response = await fetch(`/get-schema/${uuid}`)
    
    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(data.detail || 'Error getting schema')
    }
    
    return data.schema
  }