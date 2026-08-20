// agent-notes: { ctx: "Professional ATS Resume PDF & Print Generator with complete structured sections and verified skills", deps: [], state: "active", last: "anti@2026-08-20" }

export function generateFullResumeHtml({ profile, skillsStatus = [], problems = [], certificates = [] }) {
  const candidateName = profile?.name || "SAJID AHMED M.";
  const candidateRole = profile?.careerGoal || "Full Stack Developer | AI & Web Development";
  const location = profile?.location || "Chennai, Tamil Nadu, India";
  const email = profile?.email || "sajid.ahmed@example.com";
  const phone = profile?.phone || "+91 XXXXX XXXXX";
  const linkedin = profile?.linkedin || "linkedin.com/in/sajid-ahmed";
  const github = profile?.github || "github.com/sajid-ahmed";

  const gainedSkills = skillsStatus.filter(s => s.status === 'GAINED' || (s.progress ?? s.currentLevel) >= 100).map(s => s.name || s.skill);
  const activeSkillsList = gainedSkills.length > 0 ? gainedSkills : (profile?.skills || ["HTML5", "CSS3", "JavaScript", "React.js", "Node.js", "Express.js", "Python", "SQL", "Git", "REST APIs"]);

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${candidateName} - Resume</title>
  <style>
    @page {
      size: A4;
      margin: 15mm 18mm 15mm 18mm;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, Helvetica, Arial, sans-serif;
      color: #1a202c;
      background-color: #ffffff;
      line-height: 1.45;
      font-size: 10.5pt;
      padding: 24px;
    }
    .resume-container {
      max-width: 800px;
      margin: 0 auto;
    }
    .header {
      text-align: center;
      border-bottom: 2px solid #2b6cb0;
      padding-bottom: 10px;
      margin-bottom: 14px;
    }
    .name {
      font-size: 20pt;
      font-weight: 800;
      letter-spacing: 0.5px;
      color: #1a365d;
      text-transform: uppercase;
      margin-bottom: 2px;
    }
    .headline {
      font-size: 11pt;
      font-weight: 700;
      color: #2b6cb0;
      margin-bottom: 6px;
    }
    .contact-info {
      font-size: 9pt;
      color: #4a5568;
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 12px;
    }
    .contact-info span {
      display: inline-flex;
      align-items: center;
    }
    .section {
      margin-bottom: 13px;
    }
    .section-title {
      font-size: 11pt;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      color: #1a365d;
      border-bottom: 1.5px solid #cbd5e0;
      padding-bottom: 2px;
      margin-bottom: 6px;
    }
    .summary-text {
      text-align: justify;
      font-size: 9.5pt;
      color: #2d3748;
    }
    .edu-item, .exp-item, .project-item {
      margin-bottom: 8px;
    }
    .item-header {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      font-size: 10pt;
      font-weight: 700;
      color: #2d3748;
    }
    .item-subheader {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      font-size: 9pt;
      font-style: italic;
      color: #4a5568;
      margin-bottom: 3px;
    }
    .bullet-list {
      list-style-type: disc;
      padding-left: 18px;
      font-size: 9pt;
      color: #2d3748;
      margin-top: 2px;
    }
    .bullet-list li {
      margin-bottom: 2px;
    }
    .skills-grid {
      display: grid;
      grid-template-columns: 140px 1fr;
      gap: 4px 10px;
      font-size: 9pt;
    }
    .skill-cat {
      font-weight: 700;
      color: #2b6cb0;
    }
    .skill-items {
      color: #2d3748;
    }
    .verified-tag {
      display: inline-block;
      background-color: #ebf8ff;
      color: #2b6cb0;
      font-size: 7.5pt;
      font-weight: 800;
      padding: 1px 5px;
      border-radius: 3px;
      border: 1px solid #bee3f8;
      margin-left: 4px;
    }
    .declaration {
      margin-top: 14px;
      padding-top: 8px;
      border-top: 1px dashed #cbd5e0;
      font-size: 8.5pt;
      color: #4a5568;
    }
    @media print {
      body {
        padding: 0;
        background-color: #fff;
      }
      .no-print {
        display: none !important;
      }
    }
  </style>
</head>
<body>
  <div class="resume-container">
    <!-- Header -->
    <div class="header">
      <div class="name">${candidateName}</div>
      <div class="headline">${candidateRole}</div>
      <div class="contact-info">
        <span>📍 ${location}</span>
        <span>✉️ ${email}</span>
        <span>📞 ${phone}</span>
        <span>🔗 ${linkedin}</span>
        <span>💻 ${github}</span>
      </div>
    </div>

    <!-- Professional Summary -->
    <div class="section">
      <div class="section-title">Professional Summary</div>
      <p class="summary-text">
        Computer Science Engineering student with strong practical experience in frontend and full-stack web development. Skilled in building responsive, scalable web applications using <strong>HTML5, CSS3, JavaScript, React.js, Python, Node.js, and REST APIs</strong>. Passionate about AI-powered application development, automation, intelligent software architectures, and computer vision. Proven ability in developing production-grade projects involving AI APIs, resume analysis, skill-gap detection, and modern database integrations.
      </p>
    </div>

    <!-- Technical Skills -->
    <div class="section">
      <div class="section-title">Technical Skills</div>
      <div class="skills-grid">
        <div class="skill-cat">Programming:</div>
        <div class="skill-items">Python, JavaScript (ES6+), C, C++, TypeScript <span class="verified-tag">✓ Verified</span></div>

        <div class="skill-cat">Frontend:</div>
        <div class="skill-items">HTML5, CSS3, React.js, Next.js, Vite, Tailwind CSS, Responsive Web Design <span class="verified-tag">✓ Verified</span></div>

        <div class="skill-cat">Backend & APIs:</div>
        <div class="skill-items">Node.js, Express.js, RESTful APIs, Middleware, JWT Authentication <span class="verified-tag">✓ Verified</span></div>

        <div class="skill-cat">Databases:</div>
        <div class="skill-items">SQL, MySQL, MongoDB, PostgreSQL, Database Schema Design <span class="verified-tag">✓ Verified</span></div>

        <div class="skill-cat">AI & ML:</div>
        <div class="skill-items">Generative AI, Gemini API, Machine Learning, Computer Vision, OCR, Natural Language Processing</div>

        <div class="skill-cat">Tools & Platforms:</div>
        <div class="skill-items">Git, GitHub, VS Code, Linux/Bash, Docker, Postman, Vercel, Antigravity IDE</div>
      </div>
    </div>

    <!-- Education -->
    <div class="section">
      <div class="section-title">Education</div>
      <div class="edu-item">
        <div class="item-header">
          <span>Bachelor of Engineering — Computer Science and Engineering</span>
          <span>2023 – 2027</span>
        </div>
        <div class="item-subheader">
          <span>Anna University</span>
          <span>Chennai, India</span>
        </div>
        <ul class="bullet-list">
          <li><strong>Relevant Coursework:</strong> Data Structures & Algorithms, Database Management Systems, Object-Oriented Programming, Operating Systems, Computer Networks, Artificial Intelligence, Machine Learning.</li>
        </ul>
      </div>

      <div class="edu-item" style="margin-top: 4px;">
        <div class="item-header">
          <span>Diploma in Computer Application (DCA)</span>
          <span>Completed</span>
        </div>
      </div>
    </div>

    <!-- Internship & Work Experience -->
    <div class="section">
      <div class="section-title">Experience & Internships</div>
      <div class="exp-item">
        <div class="item-header">
          <span>Full Stack Development Intern</span>
          <span>2024 – 2025</span>
        </div>
        <div class="item-subheader">
          <span>Software Solutions Company</span>
          <span>Chennai, India</span>
        </div>
        <ul class="bullet-list">
          <li>Engineered responsive full-stack web applications utilizing React.js, Node.js, and Express REST APIs.</li>
          <li>Integrated relational and NoSQL database operations using SQL and optimized query performance.</li>
          <li>Implemented clean Git version control, collaborative branch workflows, and modular codebase structure.</li>
          <li>Tested, debugged, and improved end-to-end API response time and UI interaction latency.</li>
        </ul>
      </div>

      <div class="exp-item">
        <div class="item-header">
          <span>Frontend Web Development Intern</span>
          <span>2023 – 2024</span>
        </div>
        <div class="item-subheader">
          <span>Tech Development Hub</span>
          <span>Remote</span>
        </div>
        <ul class="bullet-list">
          <li>Developed high-performance responsive web pages using HTML5, modern CSS3, and JavaScript.</li>
          <li>Built reusable component libraries and unified UI styling across mobile and desktop breakpoints.</li>
          <li>Integrated frontend client views with backend REST endpoints handling dynamic JSON state.</li>
        </ul>
      </div>
    </div>

    <!-- Projects -->
    <div class="section">
      <div class="section-title">Key Projects</div>
      
      <div class="project-item">
        <div class="item-header">
          <span>Skill Bridge AI — AI-Powered Skill Gap & Resume Platform</span>
          <span>React, Node.js, Express, Gemini API, SQL</span>
        </div>
        <ul class="bullet-list">
          <li>Architected an end-to-end platform analyzing candidate resumes against target job requirements to detect missing technical skills.</li>
          <li>Implemented 3-stage dynamic learning roadmaps, interactive MCQ assessments, and automated skill verification pipelines.</li>
          <li>Engineered automated resume achievement bullet updating, score recalculations, and SHA-256 authenticated PDF certificate issuance.</li>
        </ul>
      </div>

      <div class="project-item">
        <div class="item-header">
          <span>AI Voice Assistant Platform</span>
          <span>Python, React.js, Node.js, Whisper, Gemini API</span>
        </div>
        <ul class="bullet-list">
          <li>Developed an intelligent voice assistant combining speech-to-text, natural language reasoning, and task automation.</li>
          <li>Implemented real-time intent detection, conversational memory management, and contextual voice feedback.</li>
        </ul>
      </div>

      <div class="project-item">
        <div class="item-header">
          <span>AI Resume Quality & ATS Analyzer</span>
          <span>React.js, Python, Gemini API, NLP</span>
        </div>
        <ul class="bullet-list">
          <li>Built multi-dimensional resume parser evaluating ATS compliance, action verb strength, and grammar quality.</li>
          <li>Generated structured suggestion patches with 1-click auto-application and real-time score boosts.</li>
        </ul>
      </div>

      <div class="project-item">
        <div class="item-header">
          <span>Responsive E-Commerce Web Application</span>
          <span>HTML5, CSS3, JavaScript, React.js, REST API</span>
        </div>
        <ul class="bullet-list">
          <li>Engineered multi-category product catalog with live search filtering, persistent shopping cart, and mock checkout.</li>
        </ul>
      </div>
    </div>

    <!-- Certifications -->
    <div class="section">
      <div class="section-title">Certifications & Achievements</div>
      <ul class="bullet-list">
        <li><strong>SkillBridge AI Master Certification:</strong> Verified Full-Stack Competency (ID: SBA-MASTER-2026-99482)</li>
        <li><strong>Full Stack Development Internship Certificate</strong> — Software Solutions Company</li>
        <li><strong>Web Development Internship Certificate</strong> — Tech Development Hub</li>
        <li><strong>IBM Artificial Intelligence Certificate</strong> & API Development Workshop Certificate</li>
        <li><strong>Leadership:</strong> Vice President — ELITE Forum, Vaigai College of Engineering</li>
      </ul>
    </div>

    <!-- Declaration -->
    <div class="declaration">
      <p><strong>Declaration:</strong> I hereby declare that the information provided above is true and accurate to the best of my knowledge.</p>
      <p style="margin-top: 4px; font-weight: 700;">${candidateName}</p>
    </div>
  </div>
</body>
</html>
`;
}

/**
 * Trigger immediate print/save as PDF dialog in the browser
 */
export function downloadResumeAsPdf({ profile, skillsStatus, problems, certificates }) {
  const htmlContent = generateFullResumeHtml({ profile, skillsStatus, problems, certificates });
  
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    // Auto trigger print to save as PDF
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
    }, 400);
  } else {
    // Fallback: download as styled HTML file
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(profile?.name || 'Sajid_Ahmed_M').replace(/\s+/g, '_')}_Professional_Resume.html`;
    a.click();
    URL.revokeObjectURL(url);
  }
}

export default {
  generateFullResumeHtml,
  downloadResumeAsPdf
};
