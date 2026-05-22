from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from extractor import extract_text_from_pdf
from db import get_connection
import os

app = FastAPI()
class ResumeRequest(BaseModel):
    resume_id: int
    file_path: str
    
@app.post("/process-resume")
async def process_resume(data: ResumeRequest):
    try:
        
        raw_text = extract_text_from_pdf(data.file_path)
        
        if not raw_text:
            raise HTTPException(status_code=400, detail="Could not extract text from the PDF.")

        
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
        cursor.close()
        conn.close()
        
        return {
            "message": "Resume processed successfully.",
            "resume_id": data.resume_id,
            "status": "processed",
            "chars_extracted": len(raw_text)
        }
        
    except Exception as e:
        
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
        except:
            pass
        
        raise HTTPException(status_code=500, detail=f"An error occurred while processing the resume: {str(e)}")

@app.get("/health")
async def health_check():
    return {"status": "ok"}