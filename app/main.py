from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import sqlite3
import os
import uuid
import shutil
from pathlib import Path
import threading
import time
import logging
from dotenv import load_dotenv
from utils import convert_to_sqlite, get_schema
from WorkflowManager import WorkflowManager
load_dotenv()
# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

# Set up CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Define upload directory
UPLOAD_DIR = Path(os.getenv("UPLOAD_PATH"))
UPLOAD_DIR.mkdir(exist_ok=True)

# Initialize Agent
agent = WorkflowManager().returnGraph()

# Serve static files at /static
app.mount("/static", StaticFiles(directory="static"), name="static")

# Serve index.html at the root
@app.get("/")
async def serve_index():
    return FileResponse("static/index.html")

# Pydantic model for execute-query endpoint
class QueryRequest(BaseModel):
    uuid: str
    query: str



# Endpoint for uploading .csv or .xlsx files
@app.post("/upload-file")
async def upload_file(file: UploadFile = File(...)):
    if not file or not file.filename:
        logger.error("No file provided in upload request")
        raise HTTPException(status_code=400, detail="No file uploaded")

    file_extension = Path(file.filename).suffix.lower()
    if file_extension not in [".csv", ".xlsx"]:
        logger.error(f"Invalid file extension: {file_extension}")
        raise HTTPException(status_code=400, detail="Only .csv and .xlsx files are allowed")

    file_uuid = str(uuid.uuid4())
    input_file_path = UPLOAD_DIR / f"{file_uuid}{file_extension}"
    sqlite_file_path = UPLOAD_DIR / f"{file_uuid}.sqlite"

    try:
        # Save uploaded file
        with open(input_file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        logger.info(f"Saved file: {input_file_path}")

        # Convert to SQLite
        convert_to_sqlite(input_file_path, sqlite_file_path, file_extension)
        logger.info(f"Converted file to SQLite: {sqlite_file_path}")

        # Remove input file
        os.remove(input_file_path)
        logger.info(f"Removed input file: {input_file_path}")

        return {"uuid": file_uuid}
    except ValueError as e:
        logger.error(f"Value error during file processing: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except OSError as e:
        logger.error(f"OS error during file operation: {str(e)}")
        raise HTTPException(status_code=500, detail=f"File operation error: {str(e)}")
    except Exception as e:
        logger.error(f"Unexpected error during upload: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")
    finally:
        # Ensure input file is removed if it exists
        if input_file_path.exists():
            try:
                os.remove(input_file_path)
                logger.info(f"Cleaned up input file: {input_file_path}")
            except OSError as e:
                logger.error(f"Failed to clean up input file: {str(e)}")

# Endpoint for executing SQL queries
@app.post("/execute-query")
async def execute_query(request: QueryRequest):
    logger.info(f"Received query request: {request.dict()}")
    uuid = request.uuid
    query = request.query

    if not uuid or not query:
        raise HTTPException(status_code=400, detail="Missing uuid or query")

    db_path = UPLOAD_DIR / f"{uuid}.sqlite"
    if not db_path.exists():
        raise HTTPException(status_code=404, detail="Database not found")

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    try:
        cursor.execute(query)
        rows = cursor.fetchall()
        # Get column names from cursor.description
        columns = [description[0] for description in cursor.description]
        results = [list(row) for row in rows]
        return {"results": results, "columns": columns}
    except sqlite3.Error as e:
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        conn.close()

# Endpoint for retrieving database schema
@app.get("/get-schema/{uuid}")
async def return_schema(uuid: str):
    if not uuid:
        raise HTTPException(status_code=400, detail="Missing uuid")

    db_path = UPLOAD_DIR / f"{uuid}.sqlite"
    if not db_path.exists():
        raise HTTPException(status_code=404, detail="Database not found")

    schema = get_schema(db_path)
    if not schema:
        logger.error(f"Schema not found for UUID {uuid}")
        raise HTTPException(status_code=404, detail="No schema found")
        
    else:
        logger.info(f"Retrieved schema for UUID {uuid}")
        return schema
    
@app.post("/run-sql-agent")
async def run_sql_agent(request: QueryRequest):
    question = request.query
    data_uuid = request.uuid
    if not question or not data_uuid:
        raise HTTPException(status_code=400, detail="Missing question or uuid")
    if not data_uuid:
        raise HTTPException(status_code=400, detail="Missing uuid")
    
    db_path = UPLOAD_DIR / f"{data_uuid}.sqlite"
    if not db_path.exists():
        raise HTTPException(status_code=404, detail="Database not found")
    try:
        # Run the SQL agent workflow
        result = agent.invoke({"question": question, "uuid": data_uuid})
        # logger.info(f"SQL agent result: {result}")
        return {
            "answer": result['answer'],
            "visualization": result['visualization'],
            "visualization_reason": result['visualization_reason'],
            "formatted_data_for_visualization": result['formatted_data_for_visualization']
            
        }
    except Exception as e:
        logger.error(f"Error running SQL agent: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error running SQL agent: {str(e)}")
    
    

# Background task to delete old files
def delete_old_files():
    current_time = time.time()
    for file_path in UPLOAD_DIR.iterdir():
        if file_path.name == "921c838c-541d-4361-8c96-70cb23abd9f5.sqlite":
            continue
        file_age = current_time - file_path.stat().st_mtime
        if file_age > 14400:  # 4 hours in seconds
            file_path.unlink()
            print(f"Deleted old file: {file_path}")

def run_delete_old_files():
    while True:
        delete_old_files()
        time.sleep(3600)  # Sleep for 1 hour

# Start the deletion thread
threading.Thread(target=run_delete_old_files, daemon=True).start()


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=3001)