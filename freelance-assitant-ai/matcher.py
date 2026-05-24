from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from skill_extractor import extract_skills

def calculate_match(resume_text: str, job_description: str) -> dict:
    
    #extract skills from resume and job description
    resume_skills = extract_skills(resume_text)
    job_skills = extract_skills(job_description)
    
    if not job_skills:
        
        score = tfidf_similarity(resume_text, job_description)
        return {
            "match_score": round(score * 100, 2),
            "resume_skills": resume_skills,
            "job_skills": [],
            "matched_skills": [],
            "missing_skills": [],
            "method": "tfidf_fallback",
        }
    
    #skill overlap matching
    resume_set = set(resume_skills)
    job_set = set(job_skills)
    matched =  resume_set.intersection(job_set)
    missing = job_set.difference(resume_set)
    
    #score = matched skills / total job skills *100
    skill_score = (len(matched) / len(job_skills)) * 100 if job_set else 0
    
    tfidf_score = tfidf_similarity(resume_text, job_description) * 100
    
    #final score: 70% skill match + 30% tfidf similarity
    final_score = (skill_score * 0.70) + (tfidf_score * 0.30)
    
    return {
        "match_score": round(final_score, 2),
        "resume_skills": resume_skills,
        "job_skills": job_skills,
        "matched_skills": sorted(list(matched)),
        "missing_skills": sorted(list(missing)),
        "method": "skill_overlap + tfidf",
    }
    
def tfidf_similarity(text1: str, text2: str) -> float:
    try:
        vectorizer = TfidfVectorizer(stop_words='english')
        matrix = vectorizer.fit_transform([text1, text2])
        score = cosine_similarity(matrix[0], matrix[1])[0][0]
        return float(score)
    except Exception :
        return 0.0
    