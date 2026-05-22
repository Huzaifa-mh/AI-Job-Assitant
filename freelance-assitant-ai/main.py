from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from extractor import extract_text_from_pdf
from db import get_connection
import os
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

class ResumeRequest(BaseModel):
    resume_id: int
    file_path: str
    
@app.post("/process-resume")
async def process_resume(data: ResumeRequest):
    logger.info(f"Processing resume {data.resume_id} from path: {data.file_path}")
    try:
        # Check if file exists
        if not os.path.exists(data.file_path):
            logger.error(f"File not found: {data.file_path}")
            raise HTTPException(status_code=400, detail=f"File not found: {data.file_path}")
        
        raw_text = extract_text_from_pdf(data.file_path)
        
        if not raw_text:
            logger.warning(f"No text extracted from resume {data.resume_id}")
            raise HTTPException(status_code=400, detail="Could not extract text from the PDF.")

        logger.info(f"Successfully extracted {len(raw_text)} characters from resume {data.resume_id}")
        
        # database connection
        conn = get_connection()
        cursor = conn.cursor()
        
        cursor.execute(
            """
            UPDATE Resumes
            SET raw_text = %s,
            status = %s
            WHERE resume_id = %s
            """,
            (raw_text, "processed", data.resume_id)
            
        )
        
        conn.commit()
        logger.info(f"Database updated successfully for resume {data.resume_id}")
        cursor.close()
        conn.close()
        
        return {
            "message": "Resume processed successfully.",
            "resume_id": data.resume_id,
            "status": "processed",
            "chars_extracted": len(raw_text)
        }
        
    except Exception as e:
        logger.error(f"Error processing resume {data.resume_id}: {str(e)}", exc_info=True)
        
        try:
            conn = get_connection()
            cursor = conn.cursor()
            cursor.execute(
                """
                UPDATE Resumes
                SET status = %s
                WHERE resume_id = %s
                """,
                ("failed", data.resume_id)
            )
            conn.commit()
            cursor.close()
            conn.close()
            logger.info(f"Marked resume {data.resume_id} as failed")
        except Exception as db_error:
            logger.error(f"Failed to update resume status in database: {str(db_error)}")
        
        raise HTTPException(status_code=500, detail=f"An error occurred while processing the resume: {str(e)}")

@app.get("/health")
async def health_check():
    return {"status": "ok"}