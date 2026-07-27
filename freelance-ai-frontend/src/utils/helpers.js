// Format date to readable string
export const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
};

// Get initials from full name
export const getInitials = (name = '') => {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

// Score to color mapping
export const scoreColor = (score) => {
  if (score >= 70) return '#10B981';
  if (score >= 50) return '#F59E0B';
  return '#EF4444';
};

// Score to label
export const scoreLabel = (score) => {
  if (score >= 70) return 'Strong Match';
  if (score >= 50) return 'Moderate Match';
  return 'Weak Match';
};

// Parse missing skills safely (handles both string and array)
export const parseMissingSkills = (skills) => {
  if (!skills) return [];
  if (Array.isArray(skills)) return skills;
  try { return JSON.parse(skills); }
  catch { return []; }
};

// Truncate long text
export const truncate = (str, len = 120) => {
  if (!str) return '';
  return str.length > len ? str.slice(0, len) + '...' : str;
};

// Match score -> AI recommendation tier (badge label, color, filter bucket)
export const matchTier = (score) => {
  if (score == null) return null;
  if (score >= 90) return { key: 'highly',   label: 'Highly Recommended', stars: '⭐⭐⭐', color: 'purple'  };
  if (score >= 75) return { key: 'good',     label: 'Good Match',         stars: '🟢',    color: 'success' };
  if (score >= 60) return { key: 'moderate', label: 'Moderate Match',     stars: '🟡',    color: 'warning' };
  return                    { key: 'needs',    label: 'Needs Improvement',  stars: '🔴',    color: 'danger'  };
};

// Build a short human-readable reason for a match, from matched/missing skills
export const buildMatchReason = (matchedSkills = [], missingSkills = [], score) => {
  const matched = (matchedSkills || []).slice(0, 3).join(', ');
  const missing = (missingSkills || []).slice(0, 2).join(', ');

  if (score >= 90) {
    return matched ? `Excellent ${matched} alignment.` : 'Excellent overall alignment with job requirements.';
  }
  if (score >= 75) {
    const base = matched ? `Strong ${matched} experience.` : 'Strong experience alignment.';
    return missing ? `${base} ${missing} knowledge would improve compatibility.` : base;
  }
  if (score >= 60) {
    const base = matched ? `Partial match on ${matched}.` : 'Partial match with job requirements.';
    return missing ? `${base} Missing ${missing}.` : base;
  }
  return missing ? `Limited overlap with requirements. Missing ${missing}.` : 'Limited overlap with job requirements.';
};

// Normalize employment/workplace type into filterable tags (Full Time, Remote, etc.)
export const getEmploymentTags = (job) => {
  const tags = [];
  const raw  = (job.employment_type || '').toUpperCase();

  if (raw.includes('FULL'))      tags.push('Full Time');
  if (raw.includes('PART'))      tags.push('Part Time');
  if (raw.includes('CONTRACT'))  tags.push('Contract');
  if (raw.includes('INTERN'))    tags.push('Internship');
  if (raw.includes('FREELANCE')) tags.push('Freelance');

  const text = `${job.location || ''} ${job.employment_type || ''}`.toLowerCase();
  if (text.includes('remote'))                            tags.push('Remote');
  if (text.includes('hybrid'))                            tags.push('Hybrid');
  if (text.includes('on-site') || text.includes('onsite') || text.includes('on site')) tags.push('On-site');

  return tags;
};

// Parse a numeric value (upper bound) out of a free-text salary string
export const parseSalaryValue = (salaryStr) => {
  if (!salaryStr) return null;
  const nums = String(salaryStr).match(/[\d,]+/g);
  if (!nums) return null;
  const values = nums.map(n => parseInt(n.replace(/,/g, ''), 10)).filter(n => !isNaN(n));
  return values.length ? Math.max(...values) : null;
};

// Bucket a parsed salary value into a filter tier
export const salaryTier = (value) => {
  if (value == null) return null;
  if (value >= 100000) return 'high';
  if (value >= 40000)  return 'medium';
  return 'entry';
};

// Get file name from path
export const getFileName = (path = '') => {
  return path.split(/[/\\]/).pop() || 'file';
};

// Time ago
export const timeAgo = (dateStr) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins  < 1)  return 'just now';
  if (mins  < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
};