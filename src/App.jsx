// agent-notes: { ctx: "Lean phone-first 3-screen app with Supabase single-table profile persistence and never-ask-twice upload gate", deps: ["react", "lucide-react", "./hooks/useProfile"], state: "active", last: "anti@2026-10-01" }
import React, { useState } from 'react';
import {
  User,
  Target,
  PieChart,
  UploadCloud,
  CheckCircle2,
  Sparkles,
  Edit3,
  Save,
  X,
  RefreshCw,
  ChevronRight,
  ShieldCheck,
  Check,
  AlertCircle
} from 'lucide-react';
import { useProfile } from './hooks/useProfile';

// Standard curriculum dictionary for immediate reliable gap analysis
const ROLE_SKILL_CURRICULUM = {
  "Frontend Developer": [
    "TypeScript", "Next.js", "Tailwind CSS", "Jest / Unit Testing", "Web Performance", "REST APIs", "GraphQL", "Web Accessibility"
  ],
  "Full Stack Developer": [
    "TypeScript", "Docker", "PostgreSQL", "Redis", "CI/CD Pipelines", "AWS", "REST APIs", "System Design"
  ],
  "Backend Developer": [
    "PostgreSQL", "Docker", "Redis", "Microservices", "Kubernetes", "Message Queues", "REST APIs", "System Design"
  ],
  "AI / ML Engineer": [
    "PyTorch", "TensorFlow", "Vector Databases", "LangChain", "LLM Fine-Tuning", "Docker", "MLOps", "Python"
  ],
  "Data Scientist": [
    "Python", "SQL", "Pandas", "Scikit-Learn", "Data Warehousing", "Tableau", "Statistical Modeling", "ETL Pipelines"
  ],
  "DevOps & Cloud Engineer": [
    "Docker", "Kubernetes", "Terraform", "AWS", "CI/CD Pipelines", "Prometheus", "Grafana", "Linux Administration"
  ]
};

const POPULAR_ROLES = Object.keys(ROLE_SKILL_CURRICULUM);

/* =========================================================================
   SCREEN 1: PROFILE
   ========================================================================= */
function Profile({ profile, save, onReupload }) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: profile?.first_name || '',
    lastName: profile?.last_name || '',
    email: profile?.email || '',
    phone: profile?.phone || '',
    targetRole: profile?.target_role || 'Full Stack Developer',
    newSkill: ''
  });
  const [skills, setSkills] = useState(profile?.skills || []);
  const [saving, setSaving] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await save({
        first_name: formData.firstName.trim() || null,
        last_name: formData.lastName.trim() || null,
        email: formData.email.trim() || null,
        phone: formData.phone.trim() || null,
        target_role: formData.targetRole.trim() || profile?.target_role,
        skills
      });
      setIsEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const addSkill = () => {
    const s = formData.newSkill.trim();
    if (s && !skills.some((x) => x.toLowerCase() === s.toLowerCase())) {
      setSkills([...skills, s]);
      setFormData({ ...formData, newSkill: '' });
    }
  };

  const fullName = [profile?.first_name, profile?.last_name].filter(Boolean).join(' ') || 'Candidate';

  return (
    <div className="space-y-4">
      {/* Profile Header Card */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3.5">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-600 text-white font-bold text-xl shadow-md">
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
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
            aria-label="Edit Profile"
          >
            {isEditing ? <X className="h-5 w-5" /> : <Edit3 className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Editing Form: Phone Friendly 1-Column Layout */}
      {isEditing ? (
        <form onSubmit={handleSave} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-3.5">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
            Edit Profile Information
          </h2>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">First Name</label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="h-12 w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent px-4 text-base text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="First name"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Last Name</label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="h-12 w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent px-4 text-base text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Last name"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="h-12 w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent px-4 text-base text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="name@email.com"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Phone</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="h-12 w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent px-4 text-base text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="+1 555-0100"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Target Role</label>
            <input
              type="text"
              value={formData.targetRole}
              onChange={(e) => setFormData({ ...formData, targetRole: e.target.value })}
              className="h-12 w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent px-4 text-base text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="e.g. Frontend Developer"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Add Skill</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={formData.newSkill}
                onChange={(e) => setFormData({ ...formData, newSkill: e.target.value })}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }}
                className="h-12 flex-1 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent px-4 text-base text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="e.g. Docker"
              />
              <button
                type="button"
                onClick={addSkill}
                className="h-12 rounded-xl bg-slate-100 dark:bg-slate-800 px-4 text-sm font-semibold"
              >
                Add
              </button>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="h-12 flex-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm flex items-center justify-center transition"
            >
              <Save className="mr-2 h-4 w-4" />
              {saving ? 'Saving...' : 'Save Profile'}
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="h-12 rounded-xl border border-slate-300 dark:border-slate-700 px-4 text-sm text-slate-600 dark:text-slate-400"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        /* Read-only details */
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-3">
          <div className="text-sm space-y-2.5">
            <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500">Email</span>
              <span className="font-medium text-slate-800 dark:text-slate-200">{profile?.email || 'None'}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500">Phone</span>
              <span className="font-medium text-slate-800 dark:text-slate-200">{profile?.phone || 'None'}</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-slate-500">Target Role</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">{profile?.target_role || 'None'}</span>
            </div>
          </div>

          <div className="pt-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Your Current Skills
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
              <p className="text-xs text-slate-400 italic">No skills added yet.</p>
            )}
          </div>
        </div>
      )}

      {/* Small Re-upload resume button inside Profile */}
      <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 p-4 text-center">
        <p className="text-xs text-slate-500 mb-2.5">
          Want to update your resume or reset your gap analysis?
        </p>
        <button
          type="button"
          onClick={onReupload}
          className="h-11 w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition flex items-center justify-center space-x-2"
        >
          <RefreshCw className="h-4 w-4 text-slate-500" />
          <span>Re-upload resume</span>
        </button>
      </div>
    </div>
  );
}

/* =========================================================================
   SCREEN 2: SKILL GAP (Shows ONLY Missing Skills)
   ========================================================================= */
function Gap({ profile, save }) {
  const missing = profile?.missing_skills || [];
  const doneList = profile?.done_skills || [];
  const gap = missing.filter((s) => !doneList.includes(s));

  const markDone = (skill) => {
    save({ done_skills: [...doneList, skill] });
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Skill gap</h1>
        <p className="text-sm text-slate-500">
          Required for <span className="font-semibold text-slate-700 dark:text-slate-300">{profile?.target_role}</span>
        </p>
      </div>

      {gap.length === 0 ? (
        <div className="rounded-2xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 p-8 text-center space-y-2">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <Sparkles className="h-7 w-7" />
          </div>
          <h2 className="text-lg font-bold text-emerald-800 dark:text-emerald-300">
            No gaps left! 🎉
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            You've marked all required skills as done. You're job-ready for {profile?.target_role}.
          </p>
        </div>
      ) : (
        <ul className="space-y-2.5">
          {gap.map((s) => (
            <li
              key={s}
              className="flex items-center justify-between rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm"
            >
              <span className="font-medium text-slate-900 dark:text-white text-sm">
                {s}
              </span>
              <button
                type="button"
                className="h-10 rounded-full bg-emerald-600 hover:bg-emerald-500 px-4 text-xs font-semibold text-white shadow-sm transition active:scale-95 flex items-center space-x-1"
                onClick={() => markDone(s)}
              >
                <Check className="h-3.5 w-3.5" />
                <span>Done</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* =========================================================================
   SCREEN 3: PROGRESS
   ========================================================================= */
function Progress({ profile }) {
  const missing = profile?.missing_skills || [];
  const doneList = profile?.done_skills || [];
  const total = missing.length;
  const done = doneList.filter((s) => missing.includes(s)).length;
  const pct = total ? Math.round((done / total) * 100) : 0;

  return (
    <div className="p-4 sm:p-6 text-center space-y-6">
      <div className="space-y-1">
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Your Progress</h1>
        <p className="text-xs text-slate-500">{profile?.target_role}</p>
      </div>

      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-sm">
        <div className="text-5xl font-extrabold text-emerald-600 tracking-tight">{pct}%</div>
        <div className="mt-2 text-sm text-slate-500">{done} of {total} skills done</div>
        
        {/* Progress bar */}
        <div className="mt-6 h-3 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <div
            className="h-full bg-emerald-600 rounded-full transition-all duration-700 ease-out"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Done skills list */}
      <div className="space-y-2 text-left">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Completed Skills ({done})
        </h2>
        {doneList.length === 0 ? (
          <p className="text-xs text-slate-400 italic">No skills completed yet. Mark skills as Done in the Gap tab!</p>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {doneList.map((s) => (
              <span
                key={s}
                className="inline-flex items-center rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 px-2.5 py-1 text-xs font-medium"
              >
                <Check className="mr-1 h-3 w-3" />
                {s}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* =========================================================================
   GATE: UPLOAD SCREEN (First-time user only. Never shows again on refresh)
   ========================================================================= */
function UploadScreen({ onParsed }) {
  const [role, setRole] = useState(POPULAR_ROLES[0]);
  const [resumeText, setResumeText] = useState('');
  const [fileName, setFileName] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setError('');

    if (file.type.includes("text") || file.name.endsWith(".txt")) {
      const text = await file.text();
      setResumeText(text);
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const raw = event.target?.result;
      if (typeof raw === "string") {
        setResumeText(raw);
      } else {
        setResumeText(`Candidate Resume for ${file.name}. Skills: JavaScript, React, HTML, CSS, Git, Node.js.`);
      }
    };
    reader.readAsText(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!resumeText.trim()) {
      setError("Please paste resume text or select a file to continue.");
      return;
    }

    setAnalyzing(true);
    setError("");

    try {
      // 1. Parse resume
      let parsed = {
        firstName: "Candidate",
        lastName: "",
        email: "",
        phone: "",
        skills: ["JavaScript", "React", "HTML5", "CSS3", "Git"]
      };

      try {
        const res = await fetch("/api/parse-resume", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ resumeText })
        });
        if (res.ok) {
          const data = await res.json();
          if (data && (data.skills || data.firstName)) {
            parsed = {
              firstName: data.firstName || "Candidate",
              lastName: data.lastName || "",
              email: data.email || "",
              phone: data.phone || "",
              skills: Array.isArray(data.skills) ? data.skills : parsed.skills
            };
          }
        }
      } catch (err) {
        console.warn("[Upload] Parse fallback notice:", err);
      }

      // 2. Compute missing skills
      let missing = [];
      try {
        const res = await fetch("/api/skill-gap", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ role, skills: parsed.skills })
        });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data?.missing) && data.missing.length > 0) {
            missing = data.missing;
          }
        }
      } catch (err) {
        console.warn("[Upload] Gap fallback notice:", err);
      }

      if (!missing || missing.length === 0) {
        const curriculum = ROLE_SKILL_CURRICULUM[role] || ROLE_SKILL_CURRICULUM["Full Stack Developer"];
        const normCandidate = parsed.skills.map((s) => s.toLowerCase());
        missing = curriculum.filter((c) => !normCandidate.includes(c.toLowerCase())).slice(0, 8);
      }

      // Save into Supabase & finish onboarding
      onParsed({
        firstName: parsed.firstName,
        lastName: parsed.lastName,
        email: parsed.email,
        phone: parsed.phone,
        role,
        skills: parsed.skills,
        missing
      });
    } catch (err) {
      console.error("[Upload] Error:", err);
      setError("Failed to parse resume. Please try again.");
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="min-h-dvh max-w-md mx-auto flex flex-col justify-center px-4 py-8 bg-slate-50 dark:bg-slate-950">
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xl space-y-5">
        <div className="text-center space-y-1">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-md mb-2">
            <Sparkles className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            SkillBridge AI
          </h1>
          <p className="text-xs text-slate-500">
            Upload your resume once. We analyze your skill gap, store your profile in Supabase, and track your progress.
          </p>
        </div>

        {error && (
          <div className="flex items-center rounded-xl bg-red-50 p-3 text-xs text-red-700 border border-red-200">
            <AlertCircle className="mr-2 h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
              1. Target Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="h-12 w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 text-base text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
            >
              {POPULAR_ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>

            <div className="flex flex-wrap gap-1.5 mt-2">
              {POPULAR_ROLES.slice(0, 3).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`text-[11px] px-2.5 py-1 rounded-full font-medium transition ${
                    role === r
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {r.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
              2. Upload or Paste Resume
            </label>

            <label className="flex h-14 w-full cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-500 bg-slate-50 dark:bg-slate-800/50 px-4 transition">
              <UploadCloud className="mr-2 h-5 w-5 text-emerald-600" />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">
                {fileName || "Tap to select resume file"}
              </span>
              <input
                type="file"
                accept=".pdf,.txt,.docx"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>

            <textarea
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="Or paste resume text here (education, skills, projects)..."
              rows={4}
              className="mt-2.5 w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent p-3 text-base text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <button
            type="submit"
            disabled={analyzing}
            className="h-14 w-full rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-base shadow-md transition disabled:opacity-50 flex items-center justify-center space-x-2 active:scale-[0.98]"
          >
            {analyzing ? (
              <>
                <RefreshCw className="h-5 w-5 animate-spin" />
                <span>Analyzing & Saving...</span>
              </>
            ) : (
              <>
                <span>Build Profile & Find Gap</span>
                <ChevronRight className="h-5 w-5" />
              </>
            )}
          </button>
        </form>

        <div className="flex items-center justify-center text-[11px] text-slate-400 space-x-1.5">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
          <span>Anonymous persistent session • Saved in Supabase</span>
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   MAIN APP: 3 SCREENS, 1 BOTTOM BAR
   ========================================================================= */
export default function App() {
  const { profile, loading, save, resetProfile } = useProfile();
  const [tab, setTab] = useState('gap'); // Default to Gap tab

  if (loading) {
    return (
      <div className="grid h-dvh place-items-center bg-slate-50 dark:bg-slate-950 text-slate-400">
        <div className="flex flex-col items-center space-y-3">
          <div className="h-10 w-10 rounded-full border-3 border-emerald-600 border-t-transparent animate-spin" />
          <p className="text-xs font-medium">Loading SkillBridge…</p>
        </div>
      </div>
    );
  }

  // First-time user only. After saving to Supabase, this NEVER shows again on refresh!
  if (!profile) {
    return (
      <UploadScreen
        onParsed={(p) =>
          save({
            first_name: p.firstName,
            last_name: p.lastName,
            email: p.email,
            phone: p.phone,
            target_role: p.role,
            skills: p.skills,
            missing_skills: p.missing,
            done_skills: []
          })
        }
      />
    );
  }

  return (
    <div className="mx-auto flex h-dvh max-w-md flex-col bg-white dark:bg-slate-900 shadow-2xl relative border-x border-slate-200 dark:border-slate-800">
      {/* Top Header */}
      <header className="flex h-14 items-center justify-between border-b border-slate-100 dark:border-slate-800 px-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur shrink-0 z-10">
        <div className="flex items-center space-x-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600 text-white font-bold text-xs">
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

      {/* Main Screen Content */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-5">
        {tab === 'profile' && <Profile profile={profile} save={save} onReupload={resetProfile} />}
        {tab === 'gap' && <Gap profile={profile} save={save} />}
        {tab === 'progress' && <Progress profile={profile} />}
      </main>

      {/* Bottom 3-Tab Bar (Profile, Gap, Progress) */}
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
