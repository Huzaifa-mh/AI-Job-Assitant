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