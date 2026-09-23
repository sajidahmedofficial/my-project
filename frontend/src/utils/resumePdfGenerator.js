// agent-notes: { ctx: "Professional ATS Resume PDF & Structured Text Generator strictly conforming to user template format", deps: [], state: "active", last: "anti@2026-09-23" }

/**
 * Generates plain text resume strictly following the user's template:
 *
 * [Full Name]
 * [City, State, Zip Code] | [Phone Number] | [Professional Email Address] | [LinkedIn Profile URL]
 *
 * Professional Summary
 * [3-4 sentence paragraph highlighting title, years of experience, core expertise, and a major career achievement.]
 *
 * Core Competencies & Skills
 * Technical Skills: [Extracted skills]
 *
 * Industry Knowledge: [Extracted skills]
 *
 * Soft Skills: [Extracted skills]
 *
 * Languages: [Extracted skills]
 *
 * Professional Experience
 * [Job Title]
 * [Company Name], [City, State] | [Month, Year] – [Month, Year]
 *
 * [Action + Metric + Impact bullet point]
 *
 * Education
 * [Degree Earned]
 * [University Name], [City, State] | [Graduation Month, Year]
 *
 * Certifications
 * [Certification Name], [Issuing Organization] – [Year]
 */
export function generateStructuredResumeText(data = {}) {
  const profile = data.profile || {};
  const candidate = data.candidate || {};

  const name = (profile.name || candidate.name || "Alex Morgan").trim();
  const location = profile.location || candidate.location || "City, State, Zip Code";
  const phone = profile.phone || candidate.phone || "+1 (555) 000-0000";
  const email = profile.email || candidate.email || "email@example.com";
  const linkedIn = profile.linkedin || profile.linkedIn || candidate.linkedIn || candidate.linkedin || "https://linkedin.com/in/profile";

  // Summary: concise 3-4 sentence paragraph
  const summary = (
    data.summary || 
    candidate.summary || 
    profile.summary || 
    "Experienced professional with demonstrated expertise in high-impact software engineering and full-stack system architecture. Proven capability in delivering reliable, scalable products and driving cross-functional alignment. Led critical technology modernization initiatives resulting in significant efficiency gains and elevated system performance."
  ).trim();

  // Core Competencies
  const comps = data.coreCompetencies || {};
  const techSkills = Array.isArray(comps.technicalSkills) && comps.technicalSkills.length > 0
    ? comps.technicalSkills.join(', ')
    : (Array.isArray(profile.skills) && profile.skills.length > 0 ? profile.skills.join(', ') : "JavaScript, React, Node.js, Express, SQL, Git, REST APIs");

  const industryKnowledge = Array.isArray(comps.industryKnowledge) && comps.industryKnowledge.length > 0
    ? comps.industryKnowledge.join(', ')
    : (profile.targetIndustry ? `${profile.targetIndustry}, Web Applications, System Architecture` : "SaaS & Cloud Computing, Web Platforms, Microservices");

  const softSkills = Array.isArray(comps.softSkills) && comps.softSkills.length > 0
    ? comps.softSkills.join(', ')
    : "Cross-functional Collaboration, Problem Solving, Agile / Scrum, Technical Mentorship";

  const languages = Array.isArray(comps.languages) && comps.languages.length > 0
    ? comps.languages.join(', ')
    : "English (Professional)";

  // Professional Experience
  const rawExperience = Array.isArray(data.experience) && data.experience.length > 0 
    ? data.experience 
    : (Array.isArray(profile.experience) && profile.experience.length > 0 ? profile.experience : []);

  let expSection = "";
  if (rawExperience.length > 0) {
    expSection = rawExperience.map(exp => {
      const title = exp.role || exp.title || exp.jobTitle || "Software Engineer";
      const company = exp.company || "Enterprise Solutions";
      const loc = exp.location || "City, State";
      const dates = exp.duration || (exp.startDate ? `${exp.startDate} – ${exp.endDate || 'Present'}` : "Month, Year – Present");
      
      const bulletsList = Array.isArray(exp.bullets) && exp.bullets.length > 0
        ? exp.bullets
        : (exp.description ? exp.description.split('\n').map(l => l.replace(/^[•\-\*]\s*/, '').trim()).filter(Boolean) : []);

      const formattedBullets = bulletsList.length > 0
        ? bulletsList.map(b => {
            const clean = b.replace(/^Action\s*\+\s*Metric\s*\+\s*Impact\s*:\s*/i, '').trim();
            return `• Action + Metric + Impact: ${clean}`;
          }).join('\n\n')
        : "• Action + Metric + Impact: Architected and executed high-performance features, boosting system reliability by 35% across 50k+ active users.";

      return `${title}\n${company}, ${loc} | ${dates}\n\n${formattedBullets}`;
    }).join('\n\n');
  } else {
    expSection = `Software Engineer\nTech Solutions, City, State | Jan 2023 – Present\n\n• Action + Metric + Impact: Designed and implemented core full-stack features, improving page render speeds by 30% and boosting user engagement.`;
  }

  // Education
  const rawEducation = Array.isArray(data.education) && data.education.length > 0
    ? data.education
    : (Array.isArray(profile.education) && profile.education.length > 0 ? profile.education : []);

  let eduSection = "";
  if (rawEducation.length > 0) {
    eduSection = rawEducation.map(edu => {
      const degree = edu.degree || "Bachelor of Science in Computer Science";
      const school = edu.school || edu.university || "University";
      const loc = edu.location || "City, State";
      const year = edu.year || edu.graduationDate || "Month, Year";
      return `${degree}\n${school}, ${loc} | ${year}`;
    }).join('\n\n');
  } else {
    eduSection = `Bachelor of Science in Computer Science\nUniversity, City, State | Month, Year`;
  }

  // Certifications
  const rawCertifications = Array.isArray(data.certifications) && data.certifications.length > 0
    ? data.certifications
    : (Array.isArray(data.certificates) && data.certificates.length > 0 
        ? data.certificates.map(c => ({ name: c.skillName || c.skill || "Certified Developer", issuer: "SkillBridge AI", year: "2024" }))
        : (Array.isArray(profile.certifications) && profile.certifications.length > 0 ? profile.certifications : []));

  let certSection = "";
  if (rawCertifications.length > 0) {
    certSection = rawCertifications.map(c => {
      const certName = typeof c === 'string' ? c : (c.name || c.title || "Professional Certification");
      const issuer = typeof c === 'object' && c.issuer ? c.issuer : "Issuing Organization";
      const yr = typeof c === 'object' && c.year ? c.year : "Year";
      return `${certName}, ${issuer} – ${yr}`;
    }).join('\n');
  } else {
    certSection = `SkillBridge Certified Full Stack Specialist, SkillBridge AI – 2024`;
  }

  return `${name}
${location} | ${phone} | ${email} | ${linkedIn}

Professional Summary
${summary}

Core Competencies & Skills
Technical Skills: ${techSkills}

Industry Knowledge: ${industryKnowledge}

Soft Skills: ${softSkills}

Languages: ${languages}

Professional Experience
${expSection}

Education
${eduSection}

Certifications
${certSection}
`;
}

/**
 * Generates styled HTML resume matching the visual layout and structure of the user's PDF template.
 */
export function generateFullResumeHtml(data = {}) {
  const profile = data.profile || {};
  const candidate = data.candidate || {};

  const name = (profile.name || candidate.name || "FIRST NAME LAST NAME").trim();
  const location = profile.location || candidate.location || "City, State, Zip Code";
  const phone = profile.phone || candidate.phone || "+1 (Phone Number)";
  const email = profile.email || candidate.email || "email@example.com";
  const linkedIn = profile.linkedin || profile.linkedIn || candidate.linkedIn || candidate.linkedin || "LinkedIn Profile URL";
  const portfolio = profile.portfolio || profile.github || candidate.portfolio || candidate.github || "";

  // Summary
  const summary = (
    data.summary || 
    candidate.summary || 
    profile.summary || 
    "A concise, 3-4 sentence paragraph that highlights your professional title, years of experience, core expertise, and a major career achievement. This section serves as an elevator pitch tailored to the specific role you are targeting. Focus on the value you can bring to the prospective employer."
  ).trim();

  // Core Competencies
  const comps = data.coreCompetencies || {};
  const gainedSkills = (data.skillsStatus || [])
    .filter(s => s.status === 'GAINED' || (s.progress ?? s.currentLevel) >= 100)
    .map(s => s.name || s.skill);

  const techSkills = Array.isArray(comps.technicalSkills) && comps.technicalSkills.length > 0
    ? comps.technicalSkills
    : (gainedSkills.length > 0 ? gainedSkills : (profile.skills || ["HTML5", "CSS3", "JavaScript", "React", "Node.js", "Express", "Python", "SQL", "Git", "REST API"]));

  const industryKnowledge = Array.isArray(comps.industryKnowledge) && comps.industryKnowledge.length > 0
    ? comps.industryKnowledge
    : (profile.targetIndustry ? [profile.targetIndustry, "SaaS & Cloud Computing", "Web Architectures"] : ["SaaS & Cloud Platforms", "Modern Web Engineering", "Microservices"]);

  const softSkills = Array.isArray(comps.softSkills) && comps.softSkills.length > 0
    ? comps.softSkills
    : ["Technical Leadership", "Agile / Scrum", "Cross-Functional Collaboration", "Problem Solving"];

  const languagesOrTools = Array.isArray(comps.languages) && comps.languages.length > 0
    ? comps.languages
    : (Array.isArray(comps.toolsPlatforms) && comps.toolsPlatforms.length > 0 ? comps.toolsPlatforms : ["English (Professional)", "Git & GitHub", "Docker", "Postman"]);

  // Work Experience
  const rawExperience = Array.isArray(data.experience) && data.experience.length > 0 
    ? data.experience 
    : (Array.isArray(profile.experience) && profile.experience.length > 0 ? profile.experience : []);

  // Education
  const rawEducation = Array.isArray(data.education) && data.education.length > 0
    ? data.education
    : (Array.isArray(profile.education) && profile.education.length > 0 ? profile.education : []);

  // Certifications
  const rawCertifications = Array.isArray(data.certifications) && data.certifications.length > 0
    ? data.certifications
    : (Array.isArray(data.certificates) && data.certificates.length > 0 
        ? data.certificates.map(c => ({ name: c.skillName || c.skill || "Certified Developer", issuer: "SkillBridge AI", year: "2024" }))
        : (Array.isArray(profile.certifications) && profile.certifications.length > 0 ? profile.certifications : []));

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${name} - Resume</title>
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
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      color: #1e293b;
      background-color: #ffffff;
      line-height: 1.45;
      font-size: 10pt;
      padding: 18px 24px;
    }
    .resume-sheet {
      max-width: 820px;
      margin: 0 auto;
      position: relative;
      min-height: 960px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .header {
      text-align: center;
      margin-bottom: 14px;
    }
    .name-title {
      font-size: 24pt;
      font-weight: 800;
      letter-spacing: 0.8px;
      color: #1a365d;
      text-transform: uppercase;
      margin-bottom: 6px;
    }
    .contact-row {
      font-size: 9pt;
      color: #475569;
      margin-bottom: 3px;
    }
    .contact-row span {
      margin: 0 4px;
    }
    .section {
      margin-bottom: 14px;
    }
    .section-title {
      font-size: 11pt;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #1a365d;
      border-bottom: 1.5px solid #1a365d;
      padding-bottom: 2px;
      margin-bottom: 7px;
    }
    .summary-text {
      text-align: justify;
      font-size: 9.2pt;
      color: #334155;
      line-height: 1.5;
    }
    .competencies-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      column-gap: 24px;
      row-gap: 8px;
      font-size: 9pt;
    }
    .comp-block strong {
      display: block;
      color: #1a365d;
      font-size: 9pt;
      margin-bottom: 2px;
    }
    .comp-block span {
      color: #334155;
      line-height: 1.4;
    }
    .exp-item {
      margin-bottom: 11px;
    }
    .exp-header {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      font-size: 9.5pt;
      font-weight: 700;
      color: #0f172a;
    }
    .exp-subheader {
      font-size: 8.8pt;
      font-style: italic;
      color: #475569;
      margin-bottom: 4px;
    }
    .bullet-list {
      list-style-type: disc;
      padding-left: 18px;
      font-size: 8.8pt;
      color: #334155;
    }
    .bullet-list li {
      margin-bottom: 3px;
      line-height: 1.4;
    }
    .bullet-list li strong {
      color: #1a365d;
    }
    .edu-item {
      margin-bottom: 7px;
    }
    .edu-header {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      font-size: 9.5pt;
      font-weight: 700;
      color: #0f172a;
    }
    .edu-school {
      font-size: 8.8pt;
      font-style: italic;
      color: #475569;
    }
    .cert-item {
      font-size: 9pt;
      color: #334155;
      margin-bottom: 3px;
    }
    .cert-item strong {
      color: #1a365d;
    }
    .page-footer {
      border-top: 1px solid #cbd5e1;
      padding-top: 8px;
      margin-top: 18px;
      display: flex;
      justify-content: space-between;
      font-size: 8pt;
      color: #64748b;
    }
    @media print {
      body {
        padding: 0;
        background: #fff;
      }
      .no-print {
        display: none !important;
      }
    }
  </style>
</head>
<body>
  <div class="resume-sheet">
    <div>
      <!-- Header -->
      <div class="header">
        <h1 class="name-title">${name}</h1>
        <div class="contact-row">
          ${location} <span>|</span> ${phone} <span>|</span> ${email}
        </div>
        <div class="contact-row">
          ${linkedIn}${portfolio ? ` <span>|</span> ${portfolio}` : ''}
        </div>
      </div>

      <!-- Professional Summary -->
      <div class="section">
        <div class="section-title">Professional Summary</div>
        <p class="summary-text">${summary}</p>
      </div>

      <!-- Core Competencies & Skills -->
      <div class="section">
        <div class="section-title">Core Competencies & Skills</div>
        <div class="competencies-grid">
          <div class="comp-block">
            <strong>Technical Skills:</strong>
            <span>${techSkills.join(', ')}</span>
          </div>
          <div class="comp-block">
            <strong>Industry Knowledge:</strong>
            <span>${industryKnowledge.join(', ')}</span>
          </div>
          <div class="comp-block">
            <strong>Soft Skills:</strong>
            <span>${softSkills.join(', ')}</span>
          </div>
          <div class="comp-block">
            <strong>Languages:</strong>
            <span>${languagesOrTools.join(', ')}</span>
          </div>
        </div>
      </div>

      <!-- Professional Experience -->
      <div class="section">
        <div class="section-title">Professional Experience</div>
        ${rawExperience.length > 0 ? rawExperience.map(exp => {
          const title = exp.role || exp.title || exp.jobTitle || "Software Engineer";
          const company = exp.company || "Enterprise Solutions";
          const loc = exp.location || "City, State";
          const dates = exp.duration || (exp.startDate ? `${exp.startDate} – ${exp.endDate || 'Present'}` : "Month, Year – Present");
          const bullets = Array.isArray(exp.bullets) && exp.bullets.length > 0
            ? exp.bullets
            : (exp.description ? exp.description.split('\n').map(l => l.replace(/^[•\-\*]\s*/, '').trim()).filter(Boolean) : []);

          return `
          <div class="exp-item">
            <div class="exp-header">
              <span>${title}</span>
              <span>${dates}</span>
            </div>
            <div class="exp-subheader">${company}, ${loc}</div>
            <ul class="bullet-list">
              ${bullets.length > 0 ? bullets.map(b => {
                const clean = b.replace(/^Action\s*\+\s*Metric\s*\+\s*Impact\s*:\s*/i, '').trim();
                return `<li><strong>Action + Metric + Impact:</strong> ${clean}</li>`;
              }).join('') : `<li><strong>Action + Metric + Impact:</strong> Engineered high-performance features, reducing latency by 35% and boosting reliability.</li>`}
            </ul>
          </div>`;
        }).join('') : `
          <div class="exp-item">
            <div class="exp-header">
              <span>Full Stack Development Intern</span>
              <span>2024 – 2025</span>
            </div>
            <div class="exp-subheader">Software Solutions Company, Chennai, India</div>
            <ul class="bullet-list">
              <li><strong>Action + Metric + Impact:</strong> Architected and deployed full-stack web applications using React, Node.js, and Express, cutting page render latency by 35%.</li>
              <li><strong>Action + Metric + Impact:</strong> Engineered 15+ secure RESTful API endpoints with JWT authentication, ensuring 99.9% uptime.</li>
              <li><strong>Action + Metric + Impact:</strong> Optimized database query performance by 40% through indexing and schema optimization in SQL.</li>
            </ul>
          </div>
        `}
      </div>

      <!-- Education -->
      <div class="section">
        <div class="section-title">Education</div>
        ${rawEducation.length > 0 ? rawEducation.map(edu => {
          const degree = edu.degree || "Bachelor of Science in Computer Science";
          const school = edu.school || edu.university || "University";
          const loc = edu.location || "City, State";
          const year = edu.year || edu.graduationDate || "Graduation Month, Year";
          return `
          <div class="edu-item">
            <div class="edu-header">
              <span>${degree}</span>
              <span>${year}</span>
            </div>
            <div class="edu-school">${school}, ${loc}</div>
            ${edu.honors ? `<ul class="bullet-list" style="margin-top:2px;"><li><strong>Honors:</strong> ${edu.honors}</li></ul>` : ''}
            ${Array.isArray(edu.coursework) && edu.coursework.length > 0 ? `<ul class="bullet-list" style="margin-top:2px;"><li><strong>Relevant Coursework:</strong> ${edu.coursework.join(', ')}</li></ul>` : ''}
          </div>`;
        }).join('') : `
          <div class="edu-item">
            <div class="edu-header">
              <span>Bachelor of Engineering — Computer Science and Engineering</span>
              <span>2023 – 2027</span>
            </div>
            <div class="edu-school">Anna University, Chennai, India</div>
            <ul class="bullet-list" style="margin-top:2px;">
              <li><strong>Relevant Coursework:</strong> Data Structures & Algorithms, DBMS, Operating Systems, Computer Networks, Artificial Intelligence.</li>
            </ul>
          </div>
        `}
      </div>

      <!-- Certifications -->
      <div class="section">
        <div class="section-title">Certifications</div>
        ${rawCertifications.length > 0 ? rawCertifications.map(c => {
          const certName = typeof c === 'string' ? c : (c.name || c.title || "Professional Certification");
          const issuer = typeof c === 'object' && c.issuer ? c.issuer : "SkillBridge AI";
          const yr = typeof c === 'object' && c.year ? c.year : "2024";
          return `
          <div class="cert-item">
            <strong>${certName}</strong>, ${issuer} – ${yr}
          </div>`;
        }).join('') : `
          <div class="cert-item">
            <strong>SkillBridge Certified Full Stack Developer</strong> (100% Mastery in React, Node.js, Express, SQL, Git), SkillBridge AI – 2024
          </div>
        `}
      </div>
    </div>

    <!-- Page Footer matching template -->
    <div class="page-footer">
      <span>${name} - Resume</span>
      <span>Page 1</span>
    </div>
  </div>
</body>
</html>`;
}

/**
 * Downloads plain text structured resume directly matching the requested template format.
 */
export function downloadStructuredResumeText(data = {}) {
  const textContent = generateStructuredResumeText(data);
  const candidateName = data.profile?.name || data.candidate?.name || "Professional";
  const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${candidateName.replace(/\s+/g, '_')}_Resume_Structure.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Trigger immediate print/save as PDF dialog in the browser using the strict template layout.
 */
export function downloadResumeAsPdf(data = {}) {
  const htmlContent = generateFullResumeHtml(data);
  const candidateName = data.profile?.name || data.candidate?.name || "Professional";

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
    a.download = `${candidateName.replace(/\s+/g, '_')}_Professional_Resume.html`;
    a.click();
    URL.revokeObjectURL(url);
  }
}

export default {
  generateStructuredResumeText,
  generateFullResumeHtml,
  downloadStructuredResumeText,
  downloadResumeAsPdf
};
