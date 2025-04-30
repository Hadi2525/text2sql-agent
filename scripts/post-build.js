import fs from 'fs-extra'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const staticDir = path.resolve(__dirname, '../../app/static')
const indexHtml = path.resolve(staticDir, 'index.html')

async function main() {
  try {
    console.log('Running post-build tasks...')
    
    // Check if the build directory exists
    if (!fs.existsSync(staticDir)) {
      console.error('Static directory does not exist:', staticDir)
      process.exit(1)
    }
    
    // Ensure the index.html file exists
    if (!fs.existsSync(indexHtml)) {
      console.error('index.html not found in build output')
      process.exit(1)
    }
    
    // You could add additional post-processing here if needed
    // For example, updating paths in index.html, copying additional files, etc.
    
    console.log('Post-build tasks completed successfully!')
    console.log(`Build output is in: ${staticDir}`)
  } catch (error) {
    console.error('Error during post-build:', error)
    process.exit(1)
  }
}

main()