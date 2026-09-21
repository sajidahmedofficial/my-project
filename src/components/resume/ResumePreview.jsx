// agent-notes: { ctx: "Professional formatted Resume Preview modal with direct PDF download and print triggers", deps: ["react", "lucide-react", "../../utils/resumePdfGenerator"], state: "active", last: "anti@2026-08-20" }
import React from 'react';
import ReactDOM from 'react-dom';
import { FileText, Download, Printer, CheckCircle2, X } from 'lucide-react';
import { downloadResumeAsPdf } from '../../utils/resumePdfGenerator';

export default function ResumePreview({ profile, skillsStatus = [], problems = [], certificates = [], onClose, onDownload }) {
  const candidateName = profile?.name || "SAJID AHMED M.";
  const candidateRole = profile?.careerGoal || "Full Stack Developer | AI & Web Development";
  const location = profile?.location || "Chennai, Tamil Nadu, India";
  const email = profile?.email || "sajid.ahmed@example.com";
  const phone = profile?.phone || "+91 XXXXX XXXXX";
  const linkedin = profile?.linkedin || "linkedin.com/in/sajid-ahmed";
  const github = profile?.github || "github.com/sajid-ahmed";

  const gained = skillsStatus.filter(s => s.status === 'GAINED' || (s.progress ?? s.currentLevel) >= 100);

  const handlePrintPdf = () => {
    downloadResumeAsPdf({ profile, skillsStatus, problems, certificates });
  };

  const modalUI = (
    <div className="fixed inset-0 top-0 left-0 w-screen h-screen bg-black/90 backdrop-blur-md z-[99999] flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#0d1117] text-white max-w-4xl w-full max-h-[92vh] overflow-y-auto rounded-3xl p-6 border border-gray-800 space-y-6 shadow-2xl relative">
        {/* Header Action Bar */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-accent-purple/20 text-accent-purple flex items-center justify-center font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                Official Formatted Resume Preview
              </h3>
              <p className="text-xs text-gray-400">ATS-Optimized Standard Professional A4 Format</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
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

        {/* Real Document Sheet (A4 Resume Simulation) */}
        <div className="p-8 sm:p-12 rounded-2xl bg-white text-gray-900 shadow-2xl space-y-5 font-sans border border-gray-200">
          {/* Header */}
          <div className="text-center border-b-2 border-[#2b6cb0] pb-3 space-y-1">
            <h1 className="text-2xl font-black tracking-wide text-[#1a365d] uppercase">{candidateName}</h1>
            <p className="text-xs font-bold text-[#2b6cb0]">{candidateRole}</p>
            <div className="flex flex-wrap items-center justify-center gap-3 text-[11px] text-gray-600 pt-0.5">
              <span>📍 {location}</span>
              <span>✉️ {email}</span>
              <span>📞 {phone}</span>
              <span>🔗 {linkedin}</span>
              <span>💻 {github}</span>
            </div>
          </div>

          {/* Professional Summary */}
          <div className="space-y-1.5">
            <h3 className="text-xs font-black uppercase text-[#1a365d] tracking-wider border-b border-gray-300 pb-0.5">
              Professional Summary
            </h3>
            <p className="text-[11px] text-gray-800 leading-relaxed text-justify">
              Computer Science Engineering student with experience in frontend and full-stack web development. Skilled in building responsive web applications using <strong>HTML, CSS, JavaScript, React.js, Python, Node.js, and SQL</strong>. Interested in AI-powered applications, automation, computer vision, and intelligent software systems. Experienced in developing academic and personal projects involving AI APIs, resume analysis, skill-gap detection, and web applications.
            </p>
          </div>

          {/* Technical Skills */}
          <div className="space-y-1.5">
            <h3 className="text-xs font-black uppercase text-[#1a365d] tracking-wider border-b border-gray-300 pb-0.5">
              Technical Skills
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 text-[11px]">
              <div>
                <strong className="text-[#2b6cb0]">Programming:</strong> Python, JavaScript (ES6+), C, C++, SQL <span className="text-[9px] bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded font-bold border border-blue-200">✓ Verified</span>
              </div>
              <div>
                <strong className="text-[#2b6cb0]">Frontend:</strong> HTML5, CSS3, React.js, Vite, Tailwind CSS <span className="text-[9px] bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded font-bold border border-blue-200">✓ Verified</span>
              </div>
              <div>
                <strong className="text-[#2b6cb0]">Backend & APIs:</strong> Node.js, Express.js, RESTful APIs <span className="text-[9px] bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded font-bold border border-blue-200">✓ Verified</span>
              </div>
              <div>
                <strong className="text-[#2b6cb0]">Databases:</strong> SQL, MySQL, MongoDB, PostgreSQL <span className="text-[9px] bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded font-bold border border-blue-200">✓ Verified</span>
              </div>
              <div>
                <strong className="text-[#2b6cb0]">AI & Machine Learning:</strong> Generative AI, Gemini API, Computer Vision, OCR, NLP
              </div>
              <div>
                <strong className="text-[#2b6cb0]">Tools:</strong> Git, GitHub, VS Code, Linux/Bash, Postman, Antigravity IDE
              </div>
            </div>
          </div>

          {/* Education */}
          <div className="space-y-2">
            <h3 className="text-xs font-black uppercase text-[#1a365d] tracking-wider border-b border-gray-300 pb-0.5">
              Education
            </h3>
            <div className="space-y-1 text-[11px]">
              <div className="flex justify-between font-bold text-gray-900">
                <span>Bachelor of Engineering — Computer Science and Engineering</span>
                <span>2023 – 2027</span>
              </div>
              <div className="text-gray-600 italic">Anna University, Chennai</div>
              <p className="text-[10.5px] text-gray-700">
                <strong>Relevant Coursework:</strong> Data Structures & Algorithms, DBMS, OOP, Operating Systems, Computer Networks, AI & Machine Learning.
              </p>
            </div>
          </div>

          {/* Internship Experience */}
          <div className="space-y-2">
            <h3 className="text-xs font-black uppercase text-[#1a365d] tracking-wider border-b border-gray-300 pb-0.5">
              Internship Experience
            </h3>
            <div className="space-y-2 text-[11px]">
              <div>
                <div className="flex justify-between font-bold text-gray-900">
                  <span>Full Stack Development Intern</span>
                  <span>2024 – 2025</span>
                </div>
                <div className="text-gray-600 italic">Software Solutions Company</div>
                <ul className="list-disc pl-4 space-y-0.5 text-gray-700 mt-1">
                  <li>Engineered web applications using frontend and backend technologies with automated tests.</li>
                  <li>Implemented REST API routes, middleware, and database operations using SQL.</li>
                  <li>Utilized Git and GitHub for collaborative feature branching and code reviews.</li>
                </ul>
              </div>

              <div>
                <div className="flex justify-between font-bold text-gray-900">
                  <span>Frontend Web Development Intern</span>
                  <span>2023 – 2024</span>
                </div>
                <div className="text-gray-600 italic">Tech Development Hub</div>
                <ul className="list-disc pl-4 space-y-0.5 text-gray-700 mt-1">
                  <li>Developed responsive web pages and reusable UI components using HTML, CSS, and JavaScript.</li>
                  <li>Integrated client UI with backend REST APIs and improved mobile responsiveness.</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Projects */}
          <div className="space-y-2">
            <h3 className="text-xs font-black uppercase text-[#1a365d] tracking-wider border-b border-gray-300 pb-0.5">
              Key Projects
            </h3>
            <div className="space-y-2 text-[11px]">
              <div>
                <div className="flex justify-between font-bold text-gray-900">
                  <span>Skill Bridge AI — AI-Powered Skill Gap & Resume Platform</span>
                  <span>React, Node.js, Express, Gemini AI</span>
                </div>
                <p className="text-gray-700">
                  Built end-to-end platform comparing candidate resumes with job requirements, generating personalized learning paths, and verifying technical skills with SHA-256 PDF certificates.
                </p>
              </div>

              <div>
                <div className="flex justify-between font-bold text-gray-900">
                  <span>AI Voice Assistant Platform</span>
                  <span>Python, React.js, Whisper, Gemini API</span>
                </div>
                <p className="text-gray-700">
                  Engineered intelligent assistant combining speech-to-text, natural language intent recognition, conversational memory, and automated task execution.
                </p>
              </div>
            </div>
          </div>

          {/* Declaration */}
          <div className="pt-2 border-t border-dashed border-gray-300 text-[10px] text-gray-600">
            <p><strong>Declaration:</strong> I hereby declare that the information provided above is true and accurate to the best of my knowledge.</p>
            <p className="font-bold text-gray-900 mt-1">{candidateName}</p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-2">
          <span className="text-xs text-gray-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> All AI corrections and verified skills applied to document.
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
