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

class FormFillRequest(BaseModel):
    user_id:   int
    resume_id: int
    fields:    list

@app.post("/map-form-fields")
async def map_form_fields(data: FormFillRequest):
    try:
        conn   = get_connection()
        cursor = conn.cursor()

        # 1. Get user profile
        cursor.execute(
            "SELECT full_name, email FROM Users WHERE user_id = %s",
            (data.user_id,)
        )
        user = cursor.fetchone()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        # 2. Get resume raw text
        cursor.execute(
            "SELECT raw_text FROM Resumes WHERE resume_id = %s AND user_id = %s",
            (data.resume_id, data.user_id)
        )
        resume_row = cursor.fetchone()
        cursor.close()
        conn.close()

        resume_text = resume_row["raw_text"] if resume_row else ""

        # 3. Parse useful info from resume using regex
        import re

        full_name  = user["full_name"] or ""
        name_parts = full_name.strip().split()
        first_name = name_parts[0]                          if len(name_parts) >= 1 else ""
        last_name  = name_parts[-1]                         if len(name_parts) >= 2 else ""
        middle_name= " ".join(name_parts[1:-1])             if len(name_parts) >= 3 else ""
        email      = user["email"] or ""

        # Extract phone from resume text
        phone_match = re.search(
            r'(\+?\d[\d\s\-().]{7,}\d)', resume_text
        )
        phone = phone_match.group(0).strip() if phone_match else ""

        # Extract LinkedIn URL from resume text
        linkedin_match = re.search(
            r'(https?://(?:www\.)?linkedin\.com/in/[^\s,)\]]+)', resume_text
        )
        linkedin_url = linkedin_match.group(0).strip() if linkedin_match else ""

        # Extract GitHub URL
        github_match = re.search(
            r'(https?://(?:www\.)?github\.com/[^\s,)\]]+)', resume_text
        )
        github_url = github_match.group(0).strip() if github_match else ""

        # 4. Rule-based field matching
        SALARY_KEYWORDS   = ["salary", "ctc", "compensation", "pay", "package"]
        SKIP_FIELD_NAMES  = ["g-recaptcha-response", "recaptcha", "captcha", "csrf"]
        SKIP_FIELD_TYPES  = ["file"]

        def match_field(field: dict) -> dict:
            label = field.get("label", "").lower()
            name  = field.get("name",  "").lower()
            ftype = field.get("type",  "text").lower()
            key   = label + " " + name

            # Always skip these
            if ftype in SKIP_FIELD_TYPES:
                return build_result(field, "", "skip", "File upload — user handles manually")

            for skip in SKIP_FIELD_NAMES:
                if skip in key:
                    return build_result(field, "", "skip", "System field — not fillable")

            # Salary fields — leave blank for user
            for s in SALARY_KEYWORDS:
                if s in key:
                    return build_result(field, "", "skip", "Salary — user fills this manually")

            # Name fields
            if any(k in key for k in ["first_name", "first name", "firstname", "given name"]):
                return build_result(field, first_name, "high", "First name from profile")

            if any(k in key for k in ["last_name", "last name", "lastname", "surname", "family name"]):
                return build_result(field, last_name, "high", "Last name from profile")

            if any(k in key for k in ["middle_name", "middle name", "middlename"]):
                return build_result(field, middle_name, "high", "Middle name from profile")

            if any(k in key for k in ["full_name", "full name", "fullname", "your name"]):
                return build_result(field, full_name, "high", "Full name from profile")

            # Contact fields
            if any(k in key for k in ["email", "e-mail", "email address"]):
                return build_result(field, email, "high", "Email from profile")

            if any(k in key for k in ["mobile", "cell", "phone", "contact", "telephone"]):
                return build_result(field, phone, "medium" if phone else "low", 
                                    "Phone extracted from resume" if phone else "Phone not found in resume")

            # Profile links
            if any(k in key for k in ["linkedin", "linkedin url", "linkedin profile"]):
                return build_result(field, linkedin_url, "high" if linkedin_url else "low",
                                    "LinkedIn URL from resume" if linkedin_url else "LinkedIn URL not found in resume")

            if any(k in key for k in ["github", "github url", "github profile"]):
                return build_result(field, github_url, "high" if github_url else "low",
                                    "GitHub URL from resume" if github_url else "GitHub URL not found in resume")

            if any(k in key for k in ["hyperlink", "profile link", "portfolio", "website", "url"]):
                val = linkedin_url or github_url or ""
                return build_result(field, val, "medium" if val else "low",
                                    "Profile link from resume" if val else "No profile link found in resume")

            # Cover letter / summary
            if any(k in key for k in ["cover letter", "cover_letter", "coverletter", "message", "why", "motivation"]):
                return build_result(field, "", "skip", "Cover letter — will be handled by proposal generator")

            # Default — cannot determine
            return build_result(field, "", "low", "Could not determine value from resume")

        def build_result(field, value, confidence, reason):
            return {
                "name":            field.get("name",  ""),
                "label":           field.get("label", ""),
                "type":            field.get("type",  "text"),
                "suggested_value": value,
                "confidence":      confidence,
                "reason":          reason,
            }

        # 5. Map all fields
        mapped_fields   = [match_field(f) for f in data.fields]

        high_confidence = [f for f in mapped_fields if f["confidence"] == "high"]
        needs_review    = [f for f in mapped_fields if f["confidence"] in ("medium", "low")]
        skipped         = [f for f in mapped_fields if f["confidence"] == "skip"]

        return {
            "success":       True,
            "total_fields":  len(mapped_fields),
            "auto_filled":   len(high_confidence),
            "needs_review":  len(needs_review),
            "skipped":       len(skipped),
            "mapped_fields": mapped_fields,
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))