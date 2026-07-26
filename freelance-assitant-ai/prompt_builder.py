def _shared_context(resume_text: str, job: dict, match: dict) -> str:
    matched_skills = ", ".join(match.get("matched_skills") or []) or "none listed"
    missing_skills = ", ".join(match.get("missing_skills") or []) or "none"

    return f"""
Job Title: {job.get('title')}
Company: {job.get('company')}
Employment Type: {job.get('employment_type') or 'Not specified'}
Job Description:
{job.get('description')}

Candidate Match Score: {match.get('match_score')}%
Candidate's Matching Skills: {matched_skills}
Candidate's Missing Skills: {missing_skills}

Candidate Resume:
{resume_text}
"""


def build_cover_letter_prompt(resume_text: str, job: dict, match: dict) -> str:
    return f"""You are an expert career coach writing a professional, HR-ready cover letter for a full-time job application.
Use the candidate's real resume and the job details below to write a tailored cover letter.
Address the candidate's matching skills confidently, and briefly and positively address any missing skills as growth areas.
Keep it concise (3-4 paragraphs), professional, and ready to send as-is.
{_shared_context(resume_text, job, match)}

Write only the cover letter text, with no extra commentary."""


def build_proposal_prompt(resume_text: str, job: dict, match: dict) -> str:
    return f"""You are an expert freelancer writing a winning Upwork/Freelancer-style proposal for the job below.
Use the candidate's real resume and the job details to write a tailored freelance proposal.
Open with a strong hook relevant to the client's need, highlight the candidate's matching skills and relevant experience,
briefly acknowledge any missing skills as something you can quickly ramp up on, and close with a clear call to action.
Keep it concise, persuasive, and free of generic filler.
{_shared_context(resume_text, job, match)}

Write only the proposal text, with no extra commentary."""


# content_type -> builder. Add new AI modules (resume feedback, negotiation, career advisor, ...) here.
PROMPT_BUILDERS = {
    "cover_letter": build_cover_letter_prompt,
    "proposal":     build_proposal_prompt,
}


def build_prompt(content_type: str, resume_text: str, job: dict, match: dict) -> str:
    builder = PROMPT_BUILDERS.get(content_type)
    if not builder:
        raise ValueError(f"Unknown content_type '{content_type}'")
    return builder(resume_text, job, match)
