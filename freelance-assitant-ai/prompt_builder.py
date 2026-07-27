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


def _section(title: str, body: str) -> str:
    return f"\n### {title}\n{body.strip()}\n" if body and body.strip() else f"\n### {title}\nNot available.\n"


def build_athena_system_prompt(context: dict) -> str:
    """
    System prompt for Athena, the app's global AI Career Assistant.
    `context` is whatever retrieved (RAG) data the Node backend could gather
    for the current user — profile, resume, skills, job matches, proposals.
    Any missing piece is rendered as "Not available." so the model states
    that explicitly instead of inventing it.
    """
    context = context or {}

    profile = context.get("profile") or {}
    profile_block = (
        f"Name: {profile.get('full_name', 'Unknown')}\nEmail: {profile.get('email', 'Unknown')}"
        if profile else ""
    )

    resume = context.get("resume") or {}
    if resume.get("status") == "processed" and resume.get("raw_text"):
        resume_block = resume["raw_text"]
    elif resume.get("status"):
        resume_block = f"Resume status is '{resume['status']}' — full text is not yet available."
    else:
        resume_block = ""

    skills = context.get("skills") or []
    skills_block = ", ".join(s.get("skill_name", "") for s in skills if s.get("skill_name"))

    matches = context.get("top_matches") or []
    if matches:
        matches_block = "\n".join(
            f"- {m.get('title')} at {m.get('company')}: {m.get('match_score')}% match "
            f"(matched: {', '.join(m.get('matched_skills') or []) or 'none'}; "
            f"missing: {', '.join(m.get('missing_skills') or []) or 'none'})"
            for m in matches
        )
    else:
        matches_block = ""

    proposals = context.get("recent_proposals") or []
    if proposals:
        proposals_block = "\n".join(
            f"- {p.get('proposal_type')} for {p.get('job_title')} at {p.get('company')} ({p.get('status')})"
            for p in proposals
        )
    else:
        proposals_block = ""

    return f"""You are Athena, the AI Career Assistant built into this application.

You help users with resume review, job matching, skill gap analysis, proposal writing,
cover letters, career advice, interview preparation, negotiation guidance, resume
improvements, and application questions.

STRICT RULES — never break these:
- Never invent resume information, work experience, skills, education, or companies.
- Never invent or guess job match scores or job details that are not provided to you.
- If information you need is not present in the data below, clearly tell the user it is
  unavailable rather than guessing or fabricating it.
- Answer professionally, concisely, and directly. Only go into detail when the user asks for it.

RESPONSE PRIORITY — use the highest-priority source that has the answer:
1. The user's retrieved project data below (profile, skills, matches, proposals).
2. The user's retrieved resume information below.
3. The current job/match information below, if the question is about a specific job.
4. Only if none of the above answer the question, use your general knowledge — and make
   clear when you are doing so.

═══ RETRIEVED USER DATA ═══
{_section("User Profile", profile_block)}{_section("Resume", resume_block)}{_section("Extracted Skills", skills_block)}{_section("Top Job Matches", matches_block)}{_section("Recent Proposals / Cover Letters", proposals_block)}
═══ END RETRIEVED USER DATA ═══

Use the conversation history for context and do not ask the user to repeat information
already given above or earlier in the conversation."""
