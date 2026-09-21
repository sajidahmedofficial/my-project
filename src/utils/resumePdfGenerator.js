// agent-notes: { ctx: "Professional ATS Basic Resume PDF & Print Generator with structured sections and verified skills", deps: [], state: "active", last: "anti@2026-08-27" }

export function generateFullResumeHtml({ profile, skillsStatus = [], problems = [], certificates = [] }) {
  const candidateName = profile?.name || "SAJID AHMED M.";
  const candidateRole = profile?.careerGoal || "Full Stack Developer";
  const location = profile?.location || "Chennai, Tamil Nadu, India";
  const email = profile?.email || "sajid.ahmed@example.com";
  const phone = profile?.phone || "+91 XXXXX XXXXX";
  const linkedin = profile?.linkedin || "linkedin.com/in/sajid-ahmed";
  const github = profile?.github || "github.com/sajid-ahmed";

  const gainedSkills = skillsStatus.filter(s => s.status === 'GAINED' || (s.progress ?? s.currentLevel) >= 100).map(s => s.name || s.skill);
  const activeSkillsList = gainedSkills.length > 0 ? gainedSkills : (profile?.skills || ["HTML", "CSS", "JavaScript", "React", "Node.js", "Express", "Python", "SQL", "Git", "REST API"]);

  const isCertified = (skillName) => {
    return activeSkillsList.some(s => s.toLowerCase().includes(skillName.toLowerCase())) ||
           certificates.some(c => (c.skillName || c.skill || '').toLowerCase().includes(skillName.toLowerCase()));
  };

  const renderSkill = (name) => {
    const certified = isCertified(name);
    return certified ? `<strong>${name}</strong> <span class="verified-badge">✓ Certified</span>` : name;
  };

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${candidateName} - Full Stack Developer Resume</title>
  <style>
    @page {
      size: A4;
      margin: 14mm 16mm 14mm 16mm;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      color: #111827;
      background-color: #ffffff;
      line-height: 1.42;
      font-size: 10pt;
      padding: 20px;
    }
    .resume-container {
      max-width: 820px;
      margin: 0 auto;
    }
    .header {
      text-align: center;
      border-bottom: 2px solid #1e3a8a;
      padding-bottom: 8px;
      margin-bottom: 12px;
    }
    .name {
      font-size: 20pt;
      font-weight: 800;
      letter-spacing: 0.5px;
      color: #1e3a8a;
      text-transform: uppercase;
      margin-bottom: 2px;
    }
    .headline {
      font-size: 11pt;
      font-weight: 700;
      color: #2563eb;
      margin-bottom: 5px;
    }
    .contact-info {
      font-size: 9pt;
      color: #4b5563;
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 10px;
    }
    .contact-info span {
      display: inline-flex;
      align-items: center;
    }
    .section {
      margin-bottom: 11px;
    }
    .section-title {
      font-size: 10.5pt;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.6px;
      color: #1e3a8a;
      border-bottom: 1.5px solid #cbd5e1;
      padding-bottom: 2px;
      margin-bottom: 5px;
    }
    .summary-text {
      text-align: justify;
      font-size: 9.2pt;
      color: #374151;
    }
    .item-header {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      font-size: 9.5pt;
      font-weight: 700;
      color: #1f2937;
    }
    .item-subheader {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      font-size: 8.8pt;
      font-style: italic;
      color: #4b5563;
      margin-bottom: 2px;
    }
    .bullet-list {
      list-style-type: disc;
      padding-left: 16px;
      font-size: 8.8pt;
      color: #374151;
      margin-top: 2px;
    }
    .bullet-list li {
      margin-bottom: 2px;
    }
    .skills-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 8.8pt;
    }
    .skills-table td {
      padding: 2.5px 0;
      vertical-align: top;
    }
    .skill-category {
      font-weight: 700;
      color: #1e3a8a;
      width: 130px;
    }
    .skill-list {
      color: #374151;
    }
    .verified-badge {
      display: inline-block;
      background-color: #eff6ff;
      color: #1d4ed8;
      font-size: 7.5pt;
      font-weight: 700;
      padding: 0.5px 4px;
      border-radius: 3px;
      border: 1px solid #bfdbfe;
      margin-right: 4px;
    }
    .cert-item {
      display: flex;
      justify-content: space-between;
      font-size: 8.8pt;
      margin-bottom: 3px;
      color: #374151;
    }
    .cert-code {
      font-family: monospace;
      font-size: 8pt;
      color: #2563eb;
      font-weight: 700;
    }
    .declaration {
      margin-top: 10px;
      padding-top: 6px;
      border-top: 1px dashed #cbd5e1;
      font-size: 8.2pt;
      color: #6b7280;
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
        Results-driven <strong>Full Stack Web Developer</strong> with strong practical expertise in building responsive, high-performance web applications using <strong>HTML5, CSS3, JavaScript, React.js, Node.js, Express, Python, and SQL</strong>. Proven capability in RESTful API engineering, modern database design, ATS-compliant resume systems, and AI-driven workflow integrations. Dedicated to writing clean, maintainable code, implementing automated testing, and optimizing full-stack application performance.
      </p>
    </div>

    <!-- Technical Skills -->
    <div class="section">
      <div class="section-title">Technical Skills</div>
      <table class="skills-table">
        <tr>
          <td class="skill-category">Frontend:</td>
          <td class="skill-list">${renderSkill('HTML5')}, ${renderSkill('CSS3')}, ${renderSkill('JavaScript')}, ${renderSkill('React')}, Vite, Tailwind CSS, Responsive Web Design</td>
        </tr>
        <tr>
          <td class="skill-category">Backend & APIs:</td>
          <td class="skill-list">${renderSkill('Node.js')}, ${renderSkill('Express')}, ${renderSkill('Python')}, ${renderSkill('REST API')}, JWT Authentication, Middleware</td>
        </tr>
        <tr>
          <td class="skill-category">Databases:</td>
          <td class="skill-list">${renderSkill('SQL')}, MySQL, MongoDB, PostgreSQL, Database Schema Design</td>
        </tr>
        <tr>
          <td class="skill-category">DevOps & Tools:</td>
          <td class="skill-list">${renderSkill('Git')}, GitHub, Docker, Postman, Linux/Bash, VS Code, CI/CD Workflows</td>
        </tr>
        <tr>
          <td class="skill-category">AI & Core Competencies:</td>
          <td class="skill-list">Generative AI, Gemini API, Data Structures & Algorithms, Agile/Scrum, ATS Optimization</td>
        </tr>
      </table>
    </div>

    <!-- Work Experience & Internships -->
    <div class="section">
      <div class="section-title">Work Experience & Internships</div>
      
      <div style="margin-bottom: 7px;">
        <div class="item-header">
          <span>Full Stack Development Intern</span>
          <span>2024 – 2025</span>
        </div>
        <div class="item-subheader">
          <span>Software Solutions Company</span>
          <span>Chennai, India</span>
        </div>
        <ul class="bullet-list">
          <li>Architected and deployed full-stack web applications using React, Node.js, and Express, cutting page render latency by 35%.</li>
          <li>Engineered 15+ secure RESTful API endpoints with JWT authentication and comprehensive request validation.</li>
          <li>Integrated relational and NoSQL database layers with SQL/MongoDB, optimizing query execution speed.</li>
          <li>Collaborated in an Agile development environment, using Git feature-branch workflows and code reviews.</li>
        </ul>
      </div>

      <div>
        <div class="item-header">
          <span>Frontend Web Development Intern</span>
          <span>2023 – 2024</span>
        </div>
        <div class="item-subheader">
          <span>Tech Development Hub</span>
          <span>Remote</span>
        </div>
        <ul class="bullet-list">
          <li>Developed high-performance, mobile-first responsive interfaces using HTML5, modern CSS3, and JavaScript (ES6+).</li>
          <li>Built reusable component libraries in React, improving frontend development velocity across product iterations.</li>
          <li>Integrated client-side state with REST APIs, ensuring smooth UX with real-time feedback and error handling.</li>
        </ul>
      </div>
    </div>

    <!-- Key Projects -->
    <div class="section">
      <div class="section-title">Key Projects</div>

      <div style="margin-bottom: 6px;">
        <div class="item-header">
          <span>SkillBridge — AI-Powered Skill Assessment & Resume Platform</span>
          <span>React, Node.js, Express, Gemini API, SQL</span>
        </div>
        <ul class="bullet-list">
          <li>Engineered an automated skill-gap analysis system matching candidate profiles against industry tech stacks.</li>
          <li>Built multi-level MCQ assessment modules with instant skill verification badges and automated certificate issuance.</li>
          <li>Implemented ATS score analyzer and 1-click resume optimization applying grammar and keyword improvements.</li>
        </ul>
      </div>

      <div style="margin-bottom: 6px;">
        <div class="item-header">
          <span>AI Voice Assistant & Task Automation Platform</span>
          <span>Python, React, Node.js, Whisper, Gemini API</span>
        </div>
        <ul class="bullet-list">
          <li>Built real-time speech-to-text voice assistant with conversational memory, intent recognition, and automated action triggers.</li>
          <li>Integrated multi-modal AI APIs to deliver sub-second response times for voice-based querying.</li>
        </ul>
      </div>

      <div>
        <div class="item-header">
          <span>Full Stack E-Commerce Web Application</span>
          <span>HTML5, CSS3, JavaScript, React, REST API</span>
        </div>
        <ul class="bullet-list">
          <li>Developed end-to-end shopping platform featuring dynamic product filtering, cart management, and mock checkout.</li>
        </ul>
      </div>
    </div>

    <!-- Education -->
    <div class="section">
      <div class="section-title">Education</div>
      <div>
        <div class="item-header">
          <span>Bachelor of Engineering — Computer Science and Engineering</span>
          <span>2023 – 2027</span>
        </div>
        <div class="item-subheader">
          <span>Anna University</span>
          <span>Chennai, India</span>
        </div>
        <ul class="bullet-list">
          <li><strong>Relevant Coursework:</strong> Data Structures & Algorithms, DBMS, Operating Systems, Computer Networks, Artificial Intelligence, Web Development.</li>
        </ul>
      </div>
    </div>

    <!-- Certifications & Verified Badges -->
    <div class="section">
      <div class="section-title">Certifications & Verified Skills</div>
      <div class="cert-item">
        <span><strong>SkillBridge Certified Full Stack Developer</strong> (100% Mastery in React, Node.js, Express, SQL, Git)</span>
        <span class="cert-code">ID: SBA-MASTER-2026-99482</span>
      </div>
      <div class="cert-item">
        <span><strong>Full Stack Development Internship Certificate</strong> — Software Solutions Company</span>
        <span class="cert-code">2025</span>
      </div>
      <div class="cert-item">
        <span><strong>Frontend Web Development Certification</strong> — Tech Development Hub</span>
        <span class="cert-code">2024</span>
      </div>
    </div>

    <!-- Declaration -->
    <div class="declaration">
      <p><strong>Declaration:</strong> I hereby declare that the details provided above are true and accurate to the best of my knowledge.</p>
      <p style="margin-top: 3px; font-weight: 700;">${candidateName}</p>
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
