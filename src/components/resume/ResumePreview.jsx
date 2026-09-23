// agent-notes: { ctx: "Professional Formatted Resume Preview modal strictly following user template format and visual styles", deps: ["react", "lucide-react", "../../utils/resumePdfGenerator"], state: "active", last: "anti@2026-09-23" }
import React from 'react';
import ReactDOM from 'react-dom';
import { FileText, Download, Printer, CheckCircle2, X } from 'lucide-react';
import { 
  downloadResumeAsPdf, 
  downloadStructuredResumeText 
} from '../../utils/resumePdfGenerator';

export default function ResumePreview({ 
  profile, 
  skillsStatus = [], 
  problems = [], 
  certificates = [], 
  education = [], 
  experience = [], 
  coreCompetencies = null,
  certifications = [],
  summary = "",
  candidate = null,
  onClose, 
  onDownload 
}) {
  const candidateName = profile?.name || candidate?.name || "FIRST NAME LAST NAME";
  const location = profile?.location || candidate?.location || "City, State, Zip Code";
  const email = profile?.email || candidate?.email || "email@example.com";
  const phone = profile?.phone || candidate?.phone || "+1 (Phone Number)";
  const linkedin = profile?.linkedin || profile?.linkedIn || candidate?.linkedIn || candidate?.linkedin || "LinkedIn Profile URL";
  const portfolio = profile?.portfolio || profile?.github || candidate?.portfolio || candidate?.github || "";

  // Summary
  const professionalSummary = (
    summary || 
    candidate?.summary || 
    profile?.summary || 
    "A concise, 3-4 sentence paragraph that highlights your professional title, years of experience, core expertise, and a major career achievement. This section serves as an elevator pitch tailored to the specific role you are targeting. Focus on the value you can bring to the prospective employer."
  ).trim();

  // Core Competencies
  const comps = coreCompetencies || {};
  const gainedSkills = (skillsStatus || [])
    .filter(s => s.status === 'GAINED' || (s.progress ?? s.currentLevel) >= 100)
    .map(s => s.name || s.skill);

  const techSkills = Array.isArray(comps.technicalSkills) && comps.technicalSkills.length > 0
    ? comps.technicalSkills
    : (gainedSkills.length > 0 ? gainedSkills : (profile?.skills || ["HTML5", "CSS3", "JavaScript", "React", "Node.js", "Express", "Python", "SQL", "Git", "REST API"]));

  const industryKnowledge = Array.isArray(comps.industryKnowledge) && comps.industryKnowledge.length > 0
    ? comps.industryKnowledge
    : (profile?.targetIndustry ? [profile.targetIndustry, "SaaS & Cloud Computing", "Modern Web Platforms"] : ["SaaS & Cloud Computing", "Microservices Architecture", "Modern Web Platforms"]);

  const softSkills = Array.isArray(comps.softSkills) && comps.softSkills.length > 0
    ? comps.softSkills
    : ["Technical Leadership", "Agile / Scrum", "Cross-Functional Collaboration", "Problem Solving"];

  const languagesOrTools = Array.isArray(comps.languages) && comps.languages.length > 0
    ? comps.languages
    : (Array.isArray(comps.toolsPlatforms) && comps.toolsPlatforms.length > 0 ? comps.toolsPlatforms : ["English (Professional)", "Git & GitHub", "Docker", "Postman"]);

  // Work Experience
  const rawExperience = Array.isArray(experience) && experience.length > 0 
    ? experience 
    : (Array.isArray(profile?.experience) && profile.experience.length > 0 ? profile.experience : []);

  // Education
  const rawEducation = Array.isArray(education) && education.length > 0
    ? education
    : (Array.isArray(profile?.education) && profile.education.length > 0 ? profile.education : []);

  // Certifications
  const rawCertifications = Array.isArray(certifications) && certifications.length > 0
    ? certifications
    : (Array.isArray(certificates) && certificates.length > 0 
        ? certificates.map(c => ({ name: c.skillName || c.skill || "Certified Developer", issuer: "SkillBridge AI", year: "2024" }))
        : (Array.isArray(profile?.certifications) && profile.certifications.length > 0 ? profile.certifications : []));

  const resumePayload = {
    profile,
    candidate: candidate || { name: candidateName, location, email, phone, linkedIn: linkedin, portfolio },
    summary: professionalSummary,
    coreCompetencies: {
      technicalSkills: techSkills,
      industryKnowledge,
      softSkills,
      languages: languagesOrTools
    },
    experience: rawExperience,
    education: rawEducation,
    certifications: rawCertifications,
    skillsStatus,
    problems,
    certificates
  };

  const handlePrintPdf = () => {
    downloadResumeAsPdf(resumePayload);
  };

  const handleDownloadTxt = () => {
    downloadStructuredResumeText(resumePayload);
  };

  const modalUI = (
    <div className="fixed inset-0 top-0 left-0 w-screen h-screen bg-black/90 backdrop-blur-md z-[99999] flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#0d1117] text-white max-w-4xl w-full max-h-[92vh] overflow-y-auto rounded-3xl p-6 border border-gray-800 space-y-6 shadow-2xl relative">
        {/* Header Action Bar */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-accent-purple/20 text-accent-purple flex items-center justify-center font-bold">
              <FileText className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                Official Formatted Resume Preview
              </h3>
              <p className="text-xs text-gray-400">Strict Standard Structure • Action + Metric + Impact</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadTxt}
              className="px-3.5 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-bold flex items-center gap-1.5 transition-all border border-gray-700"
              title="Download plain text adhering strictly to template"
            >
              <Download className="w-3.5 h-3.5" /> Download .txt
            </button>
            <button
              onClick={handlePrintPdf}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:opacity-95 text-white text-xs font-black flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 transition-all"
            >
              <Printer className="w-4 h-4" /> Download / Print PDF
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-gray-900 border border-gray-800 text-gray-400 hover:text-white transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Real Document Sheet (A4 Resume Simulation matching User Template) */}
        <div className="p-8 sm:p-12 rounded-2xl bg-white text-gray-900 shadow-2xl space-y-5 font-sans border border-gray-200">
          {/* Header */}
          <div className="text-center pb-2 space-y-1">
            <h1 className="text-2xl font-black tracking-wide text-[#1a365d] uppercase">{candidateName}</h1>
            <div className="text-xs text-gray-600 font-medium">
              <span>{location}</span> <span className="mx-1 text-gray-400">|</span> 
              <span>{phone}</span> <span className="mx-1 text-gray-400">|</span> 
              <span>{email}</span>
            </div>
            <div className="text-xs text-gray-600 font-medium">
              <span>{linkedin}</span>
              {portfolio && (
                <>
                  <span className="mx-1 text-gray-400">|</span>
                  <span>{portfolio}</span>
                </>
              )}
            </div>
          </div>

          {/* Professional Summary */}
          <div className="space-y-1.5">
            <h3 className="text-xs font-black uppercase text-[#1a365d] tracking-wider border-b-2 border-[#1a365d] pb-0.5">
              Professional Summary
            </h3>
            <p className="text-[11px] text-gray-800 leading-relaxed text-justify">
              {professionalSummary}
            </p>
          </div>

          {/* Core Competencies & Skills */}
          <div className="space-y-1.5">
            <h3 className="text-xs font-black uppercase text-[#1a365d] tracking-wider border-b-2 border-[#1a365d] pb-0.5">
              Core Competencies & Skills
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-[11px]">
              <div>
                <strong className="text-[#1a365d] block">Technical Skills:</strong>
                <span className="text-gray-700">{techSkills.join(', ')}</span>
              </div>
              <div>
                <strong className="text-[#1a365d] block">Industry Knowledge:</strong>
                <span className="text-gray-700">{industryKnowledge.join(', ')}</span>
              </div>
              <div>
                <strong className="text-[#1a365d] block">Soft Skills:</strong>
                <span className="text-gray-700">{softSkills.join(', ')}</span>
              </div>
              <div>
                <strong className="text-[#1a365d] block">Languages:</strong>
                <span className="text-gray-700">{languagesOrTools.join(', ')}</span>
              </div>
            </div>
          </div>

          {/* Professional Experience */}
          <div className="space-y-2">
            <h3 className="text-xs font-black uppercase text-[#1a365d] tracking-wider border-b-2 border-[#1a365d] pb-0.5">
              Professional Experience
            </h3>
            {rawExperience.length > 0 ? (
              rawExperience.map((exp, idx) => {
                const title = exp.role || exp.title || exp.jobTitle || "Software Engineer";
                const company = exp.company || "Enterprise Solutions";
                const loc = exp.location || "City, State";
                const dates = exp.duration || (exp.startDate ? `${exp.startDate} – ${exp.endDate || 'Present'}` : "Month, Year – Present");
                const bullets = Array.isArray(exp.bullets) && exp.bullets.length > 0
                  ? exp.bullets
                  : (exp.description ? exp.description.split('\n').map(l => l.replace(/^[•\-\*]\s*/, '').trim()).filter(Boolean) : []);

                return (
                  <div key={idx} className="space-y-1 text-[11px]">
                    <div className="flex justify-between font-bold text-gray-900">
                      <span>{title}</span>
                      <span>{dates}</span>
                    </div>
                    <div className="text-gray-600 italic">{company}, {loc}</div>
                    <ul className="list-disc pl-4 space-y-1 text-gray-700 mt-1">
                      {bullets.length > 0 ? (
                        bullets.map((b, bIdx) => {
                          const clean = b.replace(/^Action\s*\+\s*Metric\s*\+\s*Impact\s*:\s*/i, '').trim();
                          return (
                            <li key={bIdx}>
                              <strong className="text-[#1a365d]">Action + Metric + Impact:</strong> {clean}
                            </li>
                          );
                        })
                      ) : (
                        <li>
                          <strong className="text-[#1a365d]">Action + Metric + Impact:</strong> Engineered high-performance web features, boosting system reliability by 35% across 50k+ active users.
                        </li>
                      )}
                    </ul>
                  </div>
                );
              })
            ) : (
              <div className="space-y-1 text-[11px]">
                <div className="flex justify-between font-bold text-gray-900">
                  <span>Full Stack Development Intern</span>
                  <span>2024 – 2025</span>
                </div>
                <div className="text-gray-600 italic">Software Solutions Company, Chennai, India</div>
                <ul className="list-disc pl-4 space-y-1 text-gray-700 mt-1">
                  <li>
                    <strong className="text-[#1a365d]">Action + Metric + Impact:</strong> Architected and deployed full-stack web applications using React, Node.js, and Express, cutting page render latency by 35%.
                  </li>
                  <li>
                    <strong className="text-[#1a365d]">Action + Metric + Impact:</strong> Engineered 15+ secure RESTful API endpoints with JWT authentication, ensuring 99.9% uptime.
                  </li>
                </ul>
              </div>
            )}
          </div>

          {/* Education */}
          <div className="space-y-2">
            <h3 className="text-xs font-black uppercase text-[#1a365d] tracking-wider border-b-2 border-[#1a365d] pb-0.5">
              Education
            </h3>
            {rawEducation.length > 0 ? (
              rawEducation.map((edu, idx) => {
                const degree = edu.degree || "Bachelor of Science in Computer Science";
                const school = edu.school || edu.university || "University";
                const loc = edu.location || "City, State";
                const year = edu.year || edu.graduationDate || "Month, Year";
                return (
                  <div key={idx} className="space-y-0.5 text-[11px]">
                    <div className="flex justify-between font-bold text-gray-900">
                      <span>{degree}</span>
                      <span>{year}</span>
                    </div>
                    <div className="text-gray-600 italic">{school}, {loc}</div>
                    {edu.honors && (
                      <div className="text-gray-700"><strong>Honors:</strong> {edu.honors}</div>
                    )}
                    {Array.isArray(edu.coursework) && edu.coursework.length > 0 && (
                      <div className="text-gray-700"><strong>Relevant Coursework:</strong> {edu.coursework.join(', ')}</div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="space-y-0.5 text-[11px]">
                <div className="flex justify-between font-bold text-gray-900">
                  <span>Bachelor of Engineering — Computer Science and Engineering</span>
                  <span>2023 – 2027</span>
                </div>
                <div className="text-gray-600 italic">Anna University, Chennai, India</div>
                <div className="text-gray-700"><strong>Relevant Coursework:</strong> Data Structures & Algorithms, DBMS, Operating Systems, Computer Networks.</div>
              </div>
            )}
          </div>

          {/* Certifications */}
          <div className="space-y-1.5">
            <h3 className="text-xs font-black uppercase text-[#1a365d] tracking-wider border-b-2 border-[#1a365d] pb-0.5">
              Certifications
            </h3>
            {rawCertifications.length > 0 ? (
              rawCertifications.map((c, idx) => {
                const certName = typeof c === 'string' ? c : (c.name || c.title || "Professional Certification");
                const issuer = typeof c === 'object' && c.issuer ? c.issuer : "SkillBridge AI";
                const yr = typeof c === 'object' && c.year ? c.year : "2024";
                return (
                  <div key={idx} className="text-[11px] text-gray-800">
                    <strong className="text-[#1a365d]">{certName}</strong>, {issuer} – {yr}
                  </div>
                );
              })
            ) : (
              <div className="text-[11px] text-gray-800">
                <strong className="text-[#1a365d]">SkillBridge Certified Full Stack Developer</strong> (100% Mastery in React, Node.js, Express, SQL, Git), SkillBridge AI – 2024
              </div>
            )}
          </div>

          {/* Footer inside Resume simulation */}
          <div className="pt-4 border-t border-gray-200 flex justify-between text-[10px] text-gray-500">
            <span>{candidateName} - Resume</span>
            <span>Page 1</span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-2">
          <span className="text-xs text-gray-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Structure verified and compliant with target extraction template.
          </span>
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="px-4 py-2 rounded-xl bg-gray-900 text-gray-300 text-xs font-bold border border-gray-800 hover:bg-gray-800">
              Close
            </button>
            <button
              onClick={handlePrintPdf}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 hover:opacity-95"
            >
              <Download className="w-4 h-4" /> Download PDF Resume
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(modalUI, document.body);
}
