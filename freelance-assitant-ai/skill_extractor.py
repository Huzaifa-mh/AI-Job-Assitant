import spacy
import re

nlp = spacy.load("en_core_web_md")

# Master skill list — matches what you seeded in SQL Server
KNOWN_SKILLS = [
    # Frontend
    "javascript", "react", "tailwind css", "html", "css",
    "typescript", "vue.js", "vue", "angular", "next.js", "svelte",
    # Backend
    "node.js", "node", "express.js", "express", "python", "fastapi",
    "django", "flask", "rest apis", "graphql", "php", "java", "c#",
    "ruby on rails", "spring boot",
    # Database
    "sql server", "postgresql", "mongodb", "mysql", "redis",
    "firebase", "sqlite", "oracle",
    # DevOps
    "docker", "git", "aws", "azure", "gcp", "ci/cd",
    "kubernetes", "jenkins", "linux", "nginx",
    # AI/ML
    "machine learning", "nlp", "openai api", "openai", "spacy",
    "tensorflow", "pytorch", "scikit-learn", "pandas", "numpy",
    "data analysis", "deep learning", "langchain", "huggingface",
    # General
    "figma", "rest", "api", "agile", "scrum", "jira",
]

def extract_skills(text: str) -> list[str]:
    text_lower = text.lower()
    found = set()

    # 1. Direct keyword match (handles multi-word skills like "machine learning")
    for skill in KNOWN_SKILLS:
        # Use word boundary matching so "css" doesn't match inside "access"
        pattern = r'\b' + re.escape(skill) + r'\b'
        if re.search(pattern, text_lower):
            found.add(skill)

    # 2. spaCy NLP pass — catches variations and context
    doc = nlp(text[:50000])  # limit to 50k chars for performance
    for token in doc:
        token_lower = token.text.lower()
        if token_lower in KNOWN_SKILLS and token.pos_ in ("NOUN", "PROPN"):
            found.add(token_lower)

    return sorted(list(found))