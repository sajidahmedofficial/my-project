// agent-notes: { ctx: "Robust profile sanitizer ensuring all profile fields are clean primitive types (strings, numbers, string arrays) and never raw objects", deps: [], state: "active", last: "anti@2026-08-27" }

/**
 * Safely extracts a string from any value (primitive, object, number, null, undefined).
 */
export function extractString(val, fallback = '') {
  if (val === null || val === undefined) return fallback;
  if (typeof val === 'string') return val.trim();
  if (typeof val === 'number') return String(val);
  if (typeof val === 'object') {
    // Check common nested object keys
    if (val.college && typeof val.college === 'string') return val.college.trim();
    if (val.name && typeof val.name === 'string') return val.name.trim();
    if (val.title && typeof val.title === 'string') return val.title.trim();
    if (val.value && typeof val.value === 'string') return val.value.trim();
    if (val.label && typeof val.label === 'string') return val.label.trim();
    return fallback;
  }
  return String(val);
}

/**
 * Safely extracts an array of strings from any value.
 */
export function extractStringArray(val, fallback = []) {
  if (!Array.isArray(val)) return fallback;
  return val
    .map(item => extractString(item))
    .filter(str => str.length > 0);
}

/**
 * Safely normalizes an entire user profile object to ensure all fields are primitives.
 */
export function sanitizeUserProfile(user, fallback = {}) {
  if (!user || typeof user !== 'object') {
    return {
      id: '',
      email: '',
      name: '',
      college: 'Stanford University',
      degree: 'B.Tech / B.S.',
      department: 'Computer Science & Engineering',
      graduationYear: 2027,
      careerGoal: 'Full Stack AI Engineer',
      experienceLevel: 'Intermediate',
      skills: ['React', 'JavaScript', 'HTML/CSS', 'Git'],
      interests: ['Web Development', 'Artificial Intelligence'],
      ...fallback
    };
  }

  const rawGradYear = user.graduationYear ?? fallback.graduationYear;
  const parsedGradYear = typeof rawGradYear === 'number' ? rawGradYear : parseInt(extractString(rawGradYear, '2027'), 10) || 2027;

  return {
    ...user,
    id: extractString(user.id || user._id, fallback.id || ''),
    email: extractString(user.email, fallback.email || ''),
    name: extractString(user.name, fallback.name || (user.email ? user.email.split('@')[0] : 'Student')),
    college: extractString(user.college, fallback.college || 'Stanford University'),
    degree: extractString(user.degree, fallback.degree || 'B.Tech / B.S.'),
    department: extractString(user.department, fallback.department || 'Computer Science & Engineering'),
    graduationYear: parsedGradYear,
    careerGoal: extractString(user.careerGoal || user.targetRole, fallback.careerGoal || 'Full Stack AI Engineer'),
    experienceLevel: extractString(user.experienceLevel, fallback.experienceLevel || 'Intermediate'),
    skills: extractStringArray(user.skills, fallback.skills || ['React', 'JavaScript', 'HTML/CSS', 'Git']),
    interests: extractStringArray(user.interests, fallback.interests || ['Web Development', 'Artificial Intelligence']),
    scores: user.scores || fallback.scores || {
      skillScore: 78,
      resumeScore: 84,
      interviewReadiness: 72,
      placementReadiness: 81,
      weeklyGoalProgress: 40
    }
  };
}
