#!/bin/bash

# Install npm dependencies
npm install

# Install Python dependencies (assuming you're using a virtual environment)
# Uncomment if needed:
# pip install -r requirements.txt

# Create necessary directories if they don't exist
mkdir -p app/static/assets

# Build the React app for production
npm run build:fastapi

echo "Setup complete!"
echo "To start the FastAPI server: python -m app.main"
echo "For React development: npm run dev"