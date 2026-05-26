from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from extractor import extract_text_from_pdf
from skill_extractor import extract_skills
from matcher import calculate_match
from db import get_connection
import os
import logging
import json

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



class MatchRequest(BaseModel):
    user_id: int
    resume_id: int
    job_id: int

@app.post("/match-job")
async def match_job(data: MatchRequest):
    try:
        conn = get_connection()
        cursor = conn.cursor()
        
        cursor.execute(
            "SELECT raw_text FROM Resumes WHERE resume_id = %s AND user_id = %s",
            (data.resume_id, data.user_id)
        )
        
        resume_row = cursor.fetchone()
        if not resume_row:
            raise HTTPException(status_code=404, detail="Resume not found.")
        
        cursor.execute(
            "SELECT description FROM Jobs WHERE job_id = %s",
            (data.job_id,)
        )
        job_row = cursor.fetchone()
        if not job_row:
            raise HTTPException(status_code=404, detail="Job not found.")
        
        resume_text = resume_row["raw_text"]
        if not resume_text:
            raise HTTPException(
            status_code=400,
            detail="Resume text is empty. Process resume first."
        )
        job_desc = job_row["description"]
        
        if not job_desc:
            raise HTTPException(
            status_code=400,
            detail="Job description is empty."
        )
        
        result = calculate_match(resume_text, job_desc)
        
        missing_json = json.dumps(result["missing_skills"])

        cursor.execute(
          """
            IF EXISTS (
                SELECT 1 FROM Job_Matches
                WHERE user_id = %s AND job_id = %s
            )
                UPDATE Job_Matches
                SET match_score    = %s,
                    missing_skills = %s,
                    matched_at     = GETDATE()
                WHERE user_id = %s AND job_id = %s
            ELSE
                INSERT INTO Job_Matches (user_id, job_id, match_score, missing_skills)
                VALUES (%s, %s, %s, %s)
            """,
            (
                data.user_id, data.job_id,
                result["match_score"], missing_json,
                data.user_id, data.job_id,
                data.user_id, data.job_id,
                result["match_score"], missing_json
            )
            
        )
        conn.commit()
        cursor.close()
        conn.close()
        
        return {
            "match_score":    result["match_score"],
            "matched_skills": result["matched_skills"],
            "missing_skills": result["missing_skills"],
            "resume_skills":  result["resume_skills"],
            "job_skills":     result["job_skills"],
            "method":         result["method"],
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Match job error: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))
    
class BulkMatchRequest(BaseModel):
    user_id: int
    resume_id: int

@app.post("/match-all-jobs")
async def match_all_jobs(data: BulkMatchRequest):
    try:
        conn = get_connection()
        cursor = conn.cursor()
        
        cursor.execute(
            "SELECT raw_text FROM Resumes WHERE resume_id = %s AND user_id = %s",
            (data.resume_id, data.user_id)
        )
        resume_row = cursor.fetchone()
        if not resume_row:
            raise HTTPException(status_code=404, detail="Resume not found.")
        
        resume_text = resume_row["raw_text"]
        
        cursor.execute("SELECT job_id, description FROM Jobs")
        jobs = cursor.fetchall()
        
        if not jobs:
            raise HTTPException(status_code=404, detail="No jobs in database.")
        
        results = []
        
        for job in jobs:
            job_id = job["job_id"]
            job_desc = job["description"] or ""
            
            result = calculate_match(resume_text, job_desc)
            missing_json = json.dumps(result["missing_skills"])
            
            cursor.execute(
                """
                IF EXISTS (
                    SELECT 1 FROM Job_Matches WHERE user_id = %s AND job_id = %s
                )
                    UPDATE Job_Matches
                    SET match_score = %s, missing_skills = %s, matched_at = GETDATE()
                    WHERE user_id = %s AND job_id = %s
                ELSE
                    INSERT INTO Job_Matches (user_id, job_id, match_score, missing_skills)
                    VALUES (%s, %s, %s, %s)
                """,
                (
                    data.user_id, job_id,
                    result["match_score"], missing_json,
                    data.user_id, job_id,
                    data.user_id, job_id,
                    result["match_score"], missing_json,
                )
            )
            
            results.append({
                "job_id": job_id,
                "match_score": result["match_score"],
                "matched_skills": result["matched_skills"],
                "missing_skills": result["missing_skills"],
            })
            
        conn.commit()
        cursor.close()
        conn.close()
        
        results.sort(key=lambda x: x["match_score"], reverse=True)
        
        return {
            "total_jobs_matched": len(results),
            "matches": results
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@app.get("/health")
async def health_check():
    return {"status": "ok"}