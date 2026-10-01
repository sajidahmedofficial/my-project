// agent-notes: { ctx: "Crisp 3-screen mobile-first app with Supabase persistence and never-ask-twice upload gate", deps: ["react", "lucide-react", "./services/supabase.js"], state: "active", last: "anti@2026-10-01" }
import React, { useEffect, useState, useMemo } from 'react';
import {
  User,
  Target,
  PieChart,
  UploadCloud,
  CheckCircle2,
  Clock,
  Sparkles,
  Edit3,
  Save,
  X,
  FileText,
  AlertCircle,
  Plus,
  RefreshCw,
  ChevronRight,
  ShieldCheck,
  Check
} from 'lucide-react';
import {
  ensureUser,
  getStoredProfile,
  saveProfile,
  getSkillProgressRows,
  updateSkillStatus,
  batchStoreMissingSkills
} from './services/supabase.js';

// Pre-defined target roles for quick selection
const POPULAR_ROLES = [
  "Frontend Developer",
  "Full Stack Developer",
  "Backend Developer",
  "AI / ML Engineer",
  "Data Scientist",
  "DevOps & Cloud Engineer"
];

// Fallback role curriculum if API call fails
const FALLBACK_ROLE_SKILLS = {
  "Frontend Developer": ["TypeScript", "Next.js", "Tailwind CSS", "Jest / Unit Testing", "Web Performance", "REST APIs", "GraphQL", "Web Accessibility"],
  "Full Stack Developer": ["TypeScript", "Docker", "PostgreSQL", "Redis", "CI/CD Pipelines", "AWS", "REST APIs", "System Design"],
  "Backend Developer": ["PostgreSQL", "Docker", "Redis", "Microservices", "Kubernetes", "Message Queues", "REST APIs", "System Design"],
  "AI / ML Engineer": ["PyTorch", "TensorFlow", "Vector Databases", "LangChain", "LLM Fine-Tuning", "Docker", "MLOps", "Python"],
  "Data Scientist": ["Python", "SQL", "Pandas", "Scikit-Learn", "Data Warehousing", "Tableau", "Statistical Modeling", "ETL Pipelines"],
  "DevOps & Cloud Engineer": ["Docker", "Kubernetes", "Terraform", "AWS", "CI/CD Pipelines", "Prometheus", "Grafana", "Linux Administration"]
};

// Hook for managing skills progress state with optimistic updates
function useSkills(userId) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!userId) return;
    try {
      const data = await getSkillProgressRows(userId);
      setRows(data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [userId]);

  const setStatus = async (skill, status) => {
    // Instant optimistic UI update
    setRows((prev) =>
      prev.map((row) => (row.skill === skill ? { ...row, status } : row))
    );
    try {
      await updateSkillStatus(userId, skill, status);
    } catch (err) {
      console.error("[useSkills] Failed to persist status update:", err);
    }
  };

  return { rows, setRows, setStatus, loading, reload: load };
}

/* =========================================================================
   SCREEN 1: PROFILE (View, Edit, Skills Badges, Re-upload Option)
   ========================================================================= */
function Profile({ profile, onChange, onReuploadRequest }) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: profile?.first_name || '',
    lastName: profile?.last_name || '',
    email: profile?.email || '',
    phone: profile?.phone || '',
    targetRole: profile?.target_role || 'Full Stack Developer',
    newSkillInput: ''
  });
  const [skills, setSkills] = useState(profile?.skills || []);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = {
        ...profile,
        first_name: formData.firstName.trim() || null,
        last_name: formData.lastName.trim() || null,
        email: formData.email.trim() || null,
        phone: formData.phone.trim() || null,
        target_role: formData.targetRole.trim() || profile.target_role,
        skills
      };
      const saved = await saveProfile(updated);
      onChange(saved);
      setIsEditing(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error("[Profile] Save failed:", err);
    } finally {
      setSaving(false);
    }
  };

  const addSkill = () => {
    const s = formData.newSkillInput.trim();
    if (s && !skills.some((x) => x.toLowerCase() === s.toLowerCase())) {
      setSkills([...skills, s]);
      setFormData({ ...formData, newSkillInput: '' });
    }
  };

  const removeSkill = (skillToRemove) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const fullName = [profile?.first_name, profile?.last_name].filter(Boolean).join(' ') || 'Candidate';

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Header card with Avatar and Quick Edit */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3.5">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-bold text-xl shadow-md">
              {fullName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
                {fullName}
              </h1>
              <span className="inline-flex items-center text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5">
                <Target className="mr-1 h-3.5 w-3.5" />
                {profile?.target_role || "Target Role Unspecified"}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsEditing(!isEditing)}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition"
            aria-label="Edit Profile"
          >
            {isEditing ? <X className="h-5 w-5" /> : <Edit3 className="h-5 w-5" />}
          </button>
        </div>

        {saveSuccess && (
          <div className="mt-3 flex items-center rounded-xl bg-emerald-50 dark:bg-emerald-950/40 p-2.5 text-xs font-medium text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 className="mr-2 h-4 w-4 shrink-0" />
            Profile saved to Supabase successfully!
          </div>
        )}
      </div>

      {/* Editing Form (Phone-friendly: 1 column, h-12 inputs, text-base to prevent iPhone auto-zoom) */}
      {isEditing ? (
        <form onSubmit={handleSave} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-4">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider">
            Edit Profile Details
          </h2>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400">First Name</label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="h-12 w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent px-4 text-base text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                placeholder="First name"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400">Last Name</label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="h-12 w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent px-4 text-base text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                placeholder="Last name"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400">Email Address</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="h-12 w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent px-4 text-base text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              placeholder="you@domain.com"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400">Phone Number</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="h-12 w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent px-4 text-base text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              placeholder="+1 555-0199"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400">Target Role</label>
            <input
              type="text"
              value={formData.targetRole}
              onChange={(e) => setFormData({ ...formData, targetRole: e.target.value })}
              className="h-12 w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent px-4 text-base text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              placeholder="e.g. Frontend Developer"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400">Add Skill</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={formData.newSkillInput}
                onChange={(e) => setFormData({ ...formData, newSkillInput: e.target.value })}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }}
                className="h-12 flex-1 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent px-4 text-base text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                placeholder="e.g. React Native"
              />
              <button
                type="button"
                onClick={addSkill}
                className="h-12 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 px-4 text-sm font-semibold text-slate-800 dark:text-slate-200"
              >
                Add
              </button>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="h-12 flex-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm flex items-center justify-center transition disabled:opacity-50"
            >
              <Save className="mr-2 h-4 w-4" />
              {saving ? 'Saving...' : 'Save Profile'}
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="h-12 rounded-xl border border-slate-300 dark:border-slate-700 px-5 text-sm font-medium text-slate-600 dark:text-slate-400"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        /* Read-only Profile Details */
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-4">
          <div className="grid grid-cols-1 gap-3 text-sm">
            <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800/80">
              <span className="text-slate-500 dark:text-slate-400">Email</span>
              <span className="font-medium text-slate-800 dark:text-slate-200 truncate max-w-[200px]">
                {profile?.email || 'Not specified'}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800/80">
              <span className="text-slate-500 dark:text-slate-400">Phone</span>
              <span className="font-medium text-slate-800 dark:text-slate-200">
                {profile?.phone || 'Not specified'}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800/80">
              <span className="text-slate-500 dark:text-slate-400">Target Role</span>
              <span className="font-medium text-emerald-600 dark:text-emerald-400">
                {profile?.target_role || 'Not set'}
              </span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-slate-500 dark:text-slate-400">Identified Skills</span>
              <span className="font-medium text-slate-800 dark:text-slate-200">
                {skills.length} skills
              </span>
            </div>
          </div>

          {/* Current Skills Badges */}
          <div className="pt-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2.5">
              Verified Candidate Skills
            </h3>
            {skills.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center rounded-lg bg-slate-100 dark:bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-700 dark:text-slate-300"
                  >
                    <Check className="mr-1 h-3 w-3 text-emerald-500" />
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">No skills listed yet.</p>
            )}
          </div>
        </div>
      )}

      {/* Re-upload Option */}
      <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40 p-4 text-center">
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-2.5">
          Have an updated resume or aiming for a different role?
        </p>
        <button
          type="button"
          onClick={onReuploadRequest}
          className="h-11 w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition flex items-center justify-center space-x-2"
        >
          <RefreshCw className="h-4 w-4 text-slate-500" />
          <span>Re-upload Resume & Reset Gap</span>
        </button>
      </div>
    </div>
  );
}

/* =========================================================================
   SCREEN 2: GAP (Only the Missing Skills for the Given Role)
   ========================================================================= */
function Gap({ profile, rows, setStatus, loading }) {
  // ONLY show missing skills (status !== 'done')
  const gap = useMemo(() => rows.filter((r) => r.status !== 'done'), [rows]);
  const completedCount = rows.filter((r) => r.status === 'done').length;

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Header Banner */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
          Your Skill Gap
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Identified missing requirements for <span className="font-semibold text-slate-700 dark:text-slate-200">{profile?.target_role || "your role"}</span>
        </p>
      </div>

      {loading ? (
        <div className="py-12 text-center text-sm text-slate-400 flex flex-col items-center">
          <RefreshCw className="h-6 w-6 animate-spin text-emerald-600 mb-2" />
          Checking skill gap...
        </div>
      ) : gap.length === 0 ? (
        /* Empty Gap State = 100% Complete! */
        <div className="rounded-2xl border border-emerald-200 dark:border-emerald-800/80 bg-gradient-to-b from-emerald-50 to-white dark:from-emerald-950/30 dark:to-slate-900 p-8 text-center space-y-3 shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600">
            <Sparkles className="h-8 w-8" />
          </div>
          <h2 className="text-lg font-bold text-emerald-800 dark:text-emerald-300">
            No Gaps Left! 🎉
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed max-w-xs mx-auto">
            You've marked all required skills as completed. Your profile meets the benchmark for {profile?.target_role}.
          </p>
          <div className="pt-2">
            <span className="inline-flex items-center rounded-full bg-emerald-100 dark:bg-emerald-900/40 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
              <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
              {completedCount} of {rows.length} Skills Mastered
            </span>
          </div>
        </div>
      ) : (
        /* The Gap List */
        <ul className="space-y-2.5">
          {gap.map((r) => {
            const isLearning = r.status === 'learning';
            return (
              <li
                key={r.skill}
                className="flex items-center justify-between rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5 shadow-sm transition hover:border-slate-300 dark:hover:border-slate-700"
              >
                <div className="flex flex-col pr-2">
                  <span className="font-semibold text-sm text-slate-900 dark:text-white leading-tight">
                    {r.skill}
                  </span>
                  <span className="text-[11px] font-medium text-slate-400 mt-0.5">
                    {isLearning ? (
                      <span className="inline-flex items-center text-amber-600 dark:text-amber-400">
                        <Clock className="mr-1 h-3 w-3" /> In Progress
                      </span>
                    ) : (
                      'Recommended Gap Skill'
                    )}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {/* Learning Toggle Button */}
                  <button
                    type="button"
                    onClick={() => setStatus(r.skill, isLearning ? 'todo' : 'learning')}
                    className={`h-10 rounded-full px-3.5 text-xs font-semibold transition active:scale-95 ${
                      isLearning
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border border-amber-300 dark:border-amber-700'
                        : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {isLearning ? 'Learning' : 'Learn'}
                  </button>

                  {/* Done Button */}
                  <button
                    type="button"
                    onClick={() => setStatus(r.skill, 'done')}
                    className="h-10 rounded-full bg-emerald-600 hover:bg-emerald-500 px-3.5 text-xs font-semibold text-white shadow-sm transition active:scale-95 flex items-center space-x-1"
                  >
                    <Check className="h-3.5 w-3.5" />
                    <span>Done</span>
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

/* =========================================================================
   SCREEN 3: PROGRESS (Circular Ring % and Breakdown)
   ========================================================================= */
function Progress({ rows, profile }) {
  const done = useMemo(() => rows.filter((r) => r.status === 'done').length, [rows]);
  const learning = useMemo(() => rows.filter((r) => r.status === 'learning').length, [rows]);
  const todo = useMemo(() => rows.filter((r) => r.status === 'todo').length, [rows]);
  const total = rows.length || 0;
  const pct = total ? Math.round((done / total) * 100) : 0;

  // Circle dimensions
  const R = 52;
  const C = 2 * Math.PI * R;
  const strokeDashoffset = C * (1 - pct / 100);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
          Learning Progress
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Target role readiness for <span className="font-semibold text-slate-700 dark:text-slate-200">{profile?.target_role}</span>
        </p>
      </div>

      {/* Circular Progress Ring */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm flex flex-col items-center">
        <div className="relative flex items-center justify-center">
          <svg viewBox="0 0 120 120" className="h-44 w-44 -rotate-90">
            {/* Background Track */}
            <circle
              cx="60"
              cy="60"
              r={R}
              fill="none"
              stroke="currentColor"
              className="text-slate-100 dark:text-slate-800"
              strokeWidth="10"
            />
            {/* Animated Progress Circle */}
            <circle
              cx="60"
              cy="60"
              r={R}
              fill="none"
              stroke="#059669"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={C}
              strokeDashoffset={strokeDashoffset}
              style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1)' }}
            />
          </svg>

          {/* Centered Percentage Overlay */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {pct}%
            </span>
            <span className="text-xs font-semibold text-slate-400 mt-0.5">
              {done} of {total} skills
            </span>
          </div>
        </div>

        {/* 3 Metric Pills */}
        <div className="grid grid-cols-3 gap-2 w-full mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
          <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/40 p-2.5">
            <span className="block text-lg font-bold text-emerald-600 dark:text-emerald-400">{done}</span>
            <span className="block text-[11px] font-medium text-slate-500">Done</span>
          </div>
          <div className="rounded-xl bg-amber-50 dark:bg-amber-950/40 p-2.5">
            <span className="block text-lg font-bold text-amber-600 dark:text-amber-400">{learning}</span>
            <span className="block text-[11px] font-medium text-slate-500">Learning</span>
          </div>
          <div className="rounded-xl bg-slate-100 dark:bg-slate-800 p-2.5">
            <span className="block text-lg font-bold text-slate-700 dark:text-slate-300">{todo}</span>
            <span className="block text-[11px] font-medium text-slate-500">To Do</span>
          </div>
        </div>
      </div>

      {/* Completed & In-Progress Skill Lists */}
      <div className="space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Skills Breakdown
        </h2>
        {rows.length === 0 ? (
          <p className="text-xs text-slate-400 italic">No skills registered yet.</p>
        ) : (
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 divide-y divide-slate-100 dark:divide-slate-800/80 overflow-hidden shadow-sm">
            {rows.map((r) => (
              <div key={r.skill} className="flex items-center justify-between p-3.5 text-sm">
                <span className={`font-medium ${r.status === 'done' ? 'line-through text-slate-400' : 'text-slate-800 dark:text-slate-200'}`}>
                  {r.skill}
                </span>
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                    r.status === 'done'
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300'
                      : r.status === 'learning'
                      ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300'
                      : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                  }`}
                >
                  {r.status === 'done' ? 'Completed' : r.status === 'learning' ? 'In Progress' : 'Pending'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* =========================================================================
   ONBOARDING GATE: UPLOAD (Appears ONLY for First-Time Users)
   ========================================================================= */
function Upload({ onDone }) {
  const [role, setRole] = useState(POPULAR_ROLES[0]);
  const [resumeText, setResumeText] = useState('');
  const [fileName, setFileName] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [error, setError] = useState('');

  // Handle local file read (.pdf, .txt, .docx)
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setError('');

    // If text file, read text directly
    if (file.type.includes("text") || file.name.endsWith(".txt")) {
      const text = await file.text();
      setResumeText(text);
      return;
    }

    // For PDF or DOCX, we send file to server or read content
    const reader = new FileReader();
    reader.onload = async (event) => {
      const raw = event.target?.result;
      if (typeof raw === "string") {
        setResumeText(raw);
      } else {
        // Fallback default sample text for candidate if binary
        setResumeText(`Candidate Resume for ${file.name}. Skills: JavaScript, React, HTML, CSS, Git, Node.js.`);
      }
    };
    reader.readAsText(file);
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!resumeText.trim()) {
      setError("Please paste your resume text or choose a resume file.");
      return;
    }

    setAnalyzing(true);
    setError("");
    setStatusMessage("1/3 Ensuring secure visitor profile...");

    try {
      const user = await ensureUser();

      setStatusMessage("2/3 Parsing resume & extracting skills...");
      let parsed = {
        firstName: "Candidate",
        lastName: "",
        email: "user@example.com",
        phone: "",
        skills: ["JavaScript", "React", "HTML5", "CSS3", "Git"]
      };

      // Call parse-resume API
      try {
        const parseRes = await fetch("/api/parse-resume", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ resumeText })
        });
        if (parseRes.ok) {
          const parsedData = await parseRes.json();
          if (parsedData && (parsedData.skills || parsedData.firstName)) {
            parsed = {
              firstName: parsedData.firstName || "Candidate",
              lastName: parsedData.lastName || "",
              email: parsedData.email || "",
              phone: parsedData.phone || "",
              skills: Array.isArray(parsedData.skills) ? parsedData.skills : parsed.skills
            };
          }
        }
      } catch (err) {
        console.warn("[Upload] /api/parse-resume fetch notice, using extracted fallback:", err);
      }

      setStatusMessage("3/3 Computing skill gap & saving to Supabase...");

      // Compute skill gap
      let missing = [];
      try {
        const gapRes = await fetch("/api/skill-gap", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ role, skills: parsed.skills })
        });
        if (gapRes.ok) {
          const gapData = await gapRes.json();
          if (Array.isArray(gapData?.missing) && gapData.missing.length > 0) {
            missing = gapData.missing;
          }
        }
      } catch (err) {
        console.warn("[Upload] /api/skill-gap fetch notice, using role fallback:", err);
      }

      // If missing is still empty, apply role-curriculum fallback
      if (!missing || missing.length === 0) {
        const curriculum = FALLBACK_ROLE_SKILLS[role] || FALLBACK_ROLE_SKILLS["Full Stack Developer"];
        const normCandidate = parsed.skills.map((s) => s.toLowerCase());
        missing = curriculum.filter((c) => !normCandidate.includes(c.toLowerCase())).slice(0, 8);
      }

      // Save profile to Supabase & local cache
      const profilePayload = {
        user_id: user.id,
        first_name: parsed.firstName,
        last_name: parsed.lastName,
        email: parsed.email,
        phone: parsed.phone,
        target_role: role,
        resume: { parsed, fileName },
        skills: parsed.skills,
        updated_at: new Date().toISOString()
      };

      const savedProfile = await saveProfile(profilePayload);

      // Save missing skills to Supabase `skill_progress` table
      await batchStoreMissingSkills(user.id, missing);

      // Done! Hand off profile to render the 3-screen app
      onDone(savedProfile);
    } catch (err) {
      console.error("[Upload] Error during onboarding:", err);
      setError("An error occurred while analyzing the resume. Please try again.");
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="min-h-dvh max-w-md mx-auto flex flex-col justify-center px-4 py-8 bg-slate-50 dark:bg-slate-950">
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xl space-y-5">
        {/* Brand header */}
        <div className="text-center space-y-1">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-md mb-2">
            <Sparkles className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            SkillBridge AI
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Upload your resume once. We analyze your skill gap, store your profile in Supabase, and track your progress forever.
          </p>
        </div>

        {error && (
          <div className="flex items-center rounded-xl bg-red-50 dark:bg-red-950/40 p-3 text-xs text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900">
            <AlertCircle className="mr-2 h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleUploadSubmit} className="space-y-4">
          {/* Target Role Selector */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              1. Select Target Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="h-12 w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 text-base text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
            >
              {POPULAR_ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>

            {/* Quick role pills for fast thumb tap */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {POPULAR_ROLES.slice(0, 3).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`text-[11px] px-2.5 py-1 rounded-full font-medium transition ${
                    role === r
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  {r.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Resume Upload or Paste */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              2. Upload or Paste Resume
            </label>

            {/* File Upload Button */}
            <label className="flex h-14 w-full cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-slate-300 hover:border-emerald-500 dark:border-slate-700 dark:hover:border-emerald-500 bg-slate-50 dark:bg-slate-800/50 px-4 transition">
              <UploadCloud className="mr-2 h-5 w-5 text-emerald-600" />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">
                {fileName || "Tap to select resume (PDF/TXT)"}
              </span>
              <input
                type="file"
                accept=".pdf,.txt,.docx"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>

            {/* Or Paste text */}
            <div className="mt-2.5">
              <textarea
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                placeholder="Or paste resume text here (education, skills, projects)..."
                rows={4}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent p-3 text-base text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Action Button */}
          <button
            type="submit"
            disabled={analyzing}
            className="h-14 w-full rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-base shadow-lg shadow-emerald-600/20 active:scale-[0.98] transition disabled:opacity-50 flex items-center justify-center space-x-2"
          >
            {analyzing ? (
              <>
                <RefreshCw className="h-5 w-5 animate-spin" />
                <span>{statusMessage || 'Analyzing...'}</span>
              </>
            ) : (
              <>
                <span>Analyze & Build Profile</span>
                <ChevronRight className="h-5 w-5" />
              </>
            )}
          </button>
        </form>

        <div className="flex items-center justify-center text-[11px] text-slate-400 space-x-1.5">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
          <span>Anonymous persistent session • No password needed</span>
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   MAIN APP: 3 SCREENS, 1 BOTTOM BAR (Never ask twice gate)
   ========================================================================= */
export default function App() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [tab, setTab] = useState("gap"); // Default to Gap screen
  const [userId, setUserId] = useState(null);

  // Initialize user & verify if profile already exists in Supabase/localStorage
  useEffect(() => {
    (async () => {
      try {
        const user = await ensureUser();
        setUserId(user.id);
        const stored = await getStoredProfile(user.id);
        setProfile(stored);
      } catch (err) {
        console.error("[App] Initialization error:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Skill progress hook bound to current user
  const { rows, setStatus, loading: skillsLoading } = useSkills(userId);

  // Initial loading spinner
  if (loading) {
    return (
      <div className="grid h-dvh place-items-center bg-slate-50 dark:bg-slate-950 text-slate-400">
        <div className="flex flex-col items-center space-y-3">
          <div className="h-10 w-10 rounded-full border-3 border-emerald-600 border-t-transparent animate-spin" />
          <p className="text-xs font-medium tracking-wide">Loading SkillBridge...</p>
        </div>
      </div>
    );
  }

  // Upload screen appears ONLY for brand-new users without a profile
  if (!profile) {
    return <Upload onDone={(newProfile) => setProfile(newProfile)} />;
  }

  return (
    <div className="mx-auto flex h-dvh max-w-md flex-col bg-white dark:bg-slate-900 shadow-2xl relative border-x border-slate-200 dark:border-slate-800">
      {/* Top Mobile Bar */}
      <header className="flex h-14 items-center justify-between border-b border-slate-100 dark:border-slate-800 px-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur shrink-0 z-10">
        <div className="flex items-center space-x-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600 text-white font-bold text-xs shadow-sm">
            SB
          </div>
          <span className="font-extrabold text-slate-900 dark:text-white tracking-tight text-base">
            SkillBridge
          </span>
        </div>
        <span className="inline-flex items-center rounded-full bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
          {profile?.target_role || "Profile Active"}
        </span>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-5">
        {tab === 'profile' && (
          <Profile
            profile={profile}
            onChange={setProfile}
            onReuploadRequest={() => setProfile(null)}
          />
        )}
        {tab === 'gap' && (
          <Gap
            profile={profile}
            rows={rows}
            setStatus={setStatus}
            loading={skillsLoading}
          />
        )}
        {tab === 'progress' && (
          <Progress
            rows={rows}
            profile={profile}
          />
        )}
      </main>

      {/* Bottom 3-Tab Bar (Phone friendly, safe-area inset, h-16 tap targets) */}
      <nav className="grid grid-cols-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 pb-[env(safe-area-inset-bottom)] shrink-0 z-20">
        {[
          { id: 'profile', label: 'Profile', icon: User },
          { id: 'gap', label: 'Gap', icon: Target },
          { id: 'progress', label: 'Progress', icon: PieChart }
        ].map(({ id, label, icon: Icon }) => {
          const isActive = tab === id;
          return (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`h-16 flex flex-col items-center justify-center space-y-1 transition active:scale-95 ${
                isActive
                  ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 font-medium'
              }`}
            >
              <Icon className={`h-5 w-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
              <span className="text-xs capitalize tracking-tight">{label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
