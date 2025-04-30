import { useState, useRef } from 'react'
import { uploadFile } from '../services/api'

function FileUpload({ onFileUploaded }) {
  const [uploadStatus, setUploadStatus] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef(null)

  const handleUpload = async () => {
    const file = fileInputRef.current.files[0]
    if (!file) {
      setUploadStatus('Please select a CSV or Excel file')
      return
    }

    setIsUploading(true)
    setUploadStatus('')

    try {
      const uuid = await uploadFile(file)
      setUploadStatus(`File uploaded successfully. UUID: ${uuid}`)
      onFileUploaded(uuid)
    } catch (error) {
      console.error('Upload error:', error)
      setUploadStatus(error.message || 'Failed to upload file. Please check the server and try again.')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="section">
      <h2>Upload CSV or Excel File</h2>
      <input 
        type="file" 
        ref={fileInputRef}
        accept=".csv,.xlsx" 
        disabled={isUploading}
      />
      <div className="button-group">
        <button 
          onClick={handleUpload} 
          disabled={isUploading}
        >
          {isUploading ? 'Uploading...' : 'Upload'}
        </button>
      </div>
      {uploadStatus && (
        <p className={uploadStatus.includes('success') ? 'status' : 'error'}>
          {uploadStatus}
        </p>
      )}
    </div>
  )
}

export default FileUpload