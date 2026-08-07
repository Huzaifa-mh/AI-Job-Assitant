// Mirrors the skill vocabulary used by the Python AI service's skill_extractor.py,
// so skills shown on the profile match what job-matching considers a "skill".
const KNOWN_SKILLS = [
  'javascript', 'react', 'tailwind css', 'html', 'css',
  'typescript', 'vue.js', 'vue', 'angular', 'next.js', 'svelte',
  'node.js', 'node', 'express.js', 'express', 'python', 'fastapi',
  'django', 'flask', 'rest apis', 'graphql', 'php', 'java', 'c#', '.net',
  'ruby on rails', 'spring boot', 'nodejs',
  'sql server', 'postgresql', 'mongodb', 'mysql', 'redis',
  'firebase', 'sqlite', 'oracle',
  'docker', 'git', 'aws', 'azure', 'gcp', 'ci/cd',
  'kubernetes', 'jenkins', 'linux', 'nginx',
  'machine learning', 'nlp', 'openai api', 'openai', 'spacy',
  'tensorflow', 'pytorch', 'scikit-learn', 'pandas', 'numpy',
  'data analysis', 'deep learning', 'langchain', 'huggingface',
  'figma', 'rest', 'api', 'agile', 'scrum', 'jira',
  'winforms', 'vb.net', 'react native', 'react.js', 'reactjs', 'flutter',
  'dart', 'swift', 'kotlin', 'android development', 'ios development',
  'mobile development', 'cross-platform development', 'xamarin', 'ionic',
  'cloud computing', 'serverless architecture', 'microservices', 'restful api',
];

const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Direct keyword match against the known-skills vocabulary, case-insensitive with
// word boundaries (so "css" doesn't match inside "access").
const extractSkills = (text = '') => {
  const lower = text.toLowerCase();
  const found = new Set();
  for (const skill of KNOWN_SKILLS) {
    const pattern = new RegExp(`\\b${escapeRegExp(skill)}\\b`, 'i');
    if (pattern.test(lower)) found.add(skill);
  }
  return [...found].sort();
};

const EXPERIENCE_KEYWORDS = /engineer|developer|designer|analyst|manager|intern|lead|consultant|architect/i;
const DURATION_PATTERN = /((?:19|20)\d{2})\s*(?:-|–|—|to)\s*((?:19|20)\d{2}|present)/i;

// Best-effort line-based parse of work experience entries from raw resume text.
// There is no structured "Experience" data source anywhere in the app — this heuristic
// is the only material available (Resumes.raw_text).
const extractExperience = (text = '') => {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

  return lines
    .filter(l => EXPERIENCE_KEYWORDS.test(l) && l.length > 10 && l.length < 140)
    .slice(0, 6)
    .map(line => {
      const durationMatch = line.match(DURATION_PATTERN);
      const duration = durationMatch ? `${durationMatch[1]} - ${durationMatch[2]}` : null;

      // Strip the duration substring before splitting role/company so it doesn't leak into either
      const withoutDuration = durationMatch ? line.replace(durationMatch[0], '').trim() : line;
      const parts = withoutDuration.split(/\s+(?:at|@|-|–|\|)\s+/).map(p => p.trim()).filter(Boolean);

      return {
        role:        parts[0] || withoutDuration || null,
        company:     parts[1] || null,
        duration,
        description: null,
      };
    });
};

const EDUCATION_KEYWORDS = /university|college|bachelor|master|bsc|msc|b\.s\.|m\.s\.|phd|degree|institute/i;
const YEAR_PATTERN = /\b((?:19|20)\d{2})\b/;

// Best-effort line-based parse of education entries from raw resume text.
const extractEducation = (text = '') => {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

  return lines
    .filter(l => EDUCATION_KEYWORDS.test(l) && l.length > 5 && l.length < 140)
    .slice(0, 4)
    .map(line => {
      const yearMatch = line.match(YEAR_PATTERN);
      const year = yearMatch ? yearMatch[1] : null;

      const withoutYear = yearMatch ? line.replace(yearMatch[0], '').trim() : line;
      const parts = withoutYear.split(/\s*(?:,|-|–|\|)\s*/).map(p => p.trim()).filter(Boolean);

      return {
        degree:      parts[0] || withoutYear || null,
        institution: parts[1] || null,
        year,
      };
    });
};

module.exports = { extractSkills, extractExperience, extractEducation };
