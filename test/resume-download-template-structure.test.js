// agent-notes: { ctx: "TDD test for resume download template structure and extraction rules", deps: ["../src/utils/resumePdfGenerator.js", "../backend/services/resumeAnalyzer.service.js"], state: "active", last: "anti@2026-09-23" }
import assert from 'node:assert';
import { 
  generateStructuredResumeText, 
  generateFullResumeHtml 
} from '../src/utils/resumePdfGenerator.js';
import { analyzeResume } from '../backend/services/resumeAnalyzer.service.js';

async function runTests() {
  console.log('🧪 Starting Resume Download Template Structure TDD Tests...\n');

  // Test 1: Verify generateStructuredResumeText produces the exact template structure
  console.log('Test 1: Validating generateStructuredResumeText output structure...');
  
  const sampleCandidateData = {
    profile: {
      name: "Alex Morgan",
      location: "San Francisco, CA 94105",
      phone: "+1 (555) 234-5678",
      email: "alex.morgan@example.com",
      linkedin: "https://linkedin.com/in/alexmorgan",
      portfolio: "https://alexmorgan.dev"
    },
    summary: "Senior Full Stack Engineer with over 6 years of experience building high-traffic cloud platforms and AI-driven web systems. Expert in JavaScript, React, Node.js, and modern distributed architectures. Led the development of an enterprise analytics suite that increased customer retention by 28% and accelerated system throughput by 45%.",
    coreCompetencies: {
      technicalSkills: ["React", "Node.js", "TypeScript", "Python", "SQL", "Docker", "AWS"],
      industryKnowledge: ["SaaS & Cloud Computing", "Fintech & Banking", "Microservices Architecture", "Agile/Scrum"],
      softSkills: ["Cross-functional Leadership", "Mentorship", "Problem Solving", "Strategic Planning"],
      languages: ["English (Fluent)", "Spanish (Professional)", "German (Basic)"]
    },
    experience: [
      {
        role: "Senior Software Engineer",
        company: "CloudScale Technologies",
        location: "San Francisco, CA",
        startDate: "Jan 2022",
        endDate: "Present",
        duration: "Jan 2022 – Present",
        bullets: [
          "Action + Metric + Impact: Architected and deployed microservices infrastructure using Node.js and Docker, reducing API response times by 35% and saving $120K annually.",
          "Action + Metric + Impact: Managed a cross-functional team of 8 engineers to ship real-time analytics dashboard 3 weeks ahead of schedule.",
          "Action + Metric + Impact: Reduced operational downtime by 40% by standardizing CI/CD pipelines and automated integration testing."
        ]
      },
      {
        role: "Full Stack Developer",
        company: "Innovatech Solutions",
        location: "San Jose, CA",
        startDate: "Jun 2019",
        endDate: "Dec 2021",
        duration: "Jun 2019 – Dec 2021",
        bullets: [
          "Action + Metric + Impact: Developed customer-facing React components that increased daily active engagement by 22% across 150K users.",
          "Action + Metric + Impact: Automated batch invoice processing with Python and SQL, eliminating 15 hours of manual data entry weekly."
        ]
      }
    ],
    education: [
      {
        degree: "Bachelor of Science in Computer Science",
        school: "University of California, Berkeley",
        location: "Berkeley, CA",
        year: "May 2019",
        honors: "Summa Cum Laude",
        coursework: ["Distributed Systems", "Algorithms", "Database Engineering"]
      }
    ],
    certifications: [
      {
        name: "AWS Certified Solutions Architect",
        issuer: "Amazon Web Services",
        year: "2023"
      },
      {
        name: "SkillBridge Verified Full Stack Specialist",
        issuer: "SkillBridge AI",
        year: "2024"
      }
    ]
  };

  const textOutput = generateStructuredResumeText(sampleCandidateData);

  assert(typeof textOutput === 'string' && textOutput.length > 0, 'Output must be a non-empty string');
  
  // Check Contact Info format
  assert(textOutput.includes('Alex Morgan'), 'Must include Full Name');
  assert(textOutput.includes('San Francisco, CA 94105 | +1 (555) 234-5678 | alex.morgan@example.com | https://linkedin.com/in/alexmorgan'), 
    'Must include exact contact info line formatted with pipes');

  // Check Professional Summary
  assert(textOutput.includes('Professional Summary\n'), 'Must contain exact section header "Professional Summary"');
  assert(textOutput.includes('Senior Full Stack Engineer with over 6 years of experience'), 'Must contain the professional summary paragraph');

  // Check Core Competencies & Skills
  assert(textOutput.includes('Core Competencies & Skills\n'), 'Must contain exact section header "Core Competencies & Skills"');
  assert(textOutput.includes('Technical Skills: React, Node.js, TypeScript, Python, SQL, Docker, AWS'), 'Must contain formatted Technical Skills');
  assert(textOutput.includes('Industry Knowledge: SaaS & Cloud Computing, Fintech & Banking, Microservices Architecture, Agile/Scrum'), 'Must contain formatted Industry Knowledge');
  assert(textOutput.includes('Soft Skills: Cross-functional Leadership, Mentorship, Problem Solving, Strategic Planning'), 'Must contain formatted Soft Skills');
  assert(textOutput.includes('Languages: English (Fluent), Spanish (Professional), German (Basic)'), 'Must contain formatted Languages');

  // Check Professional Experience
  assert(textOutput.includes('Professional Experience\n'), 'Must contain exact section header "Professional Experience"');
  assert(textOutput.includes('Senior Software Engineer'), 'Must contain Job Title');
  assert(textOutput.includes('CloudScale Technologies, San Francisco, CA | Jan 2022 – Present'), 'Must contain Company, Location | Dates line');
  assert(textOutput.includes('Action + Metric + Impact:'), 'Must follow Action + Metric + Impact format');

  // Check Education
  assert(textOutput.includes('Education\n'), 'Must contain exact section header "Education"');
  assert(textOutput.includes('Bachelor of Science in Computer Science'), 'Must contain Degree Earned');
  assert(textOutput.includes('University of California, Berkeley, Berkeley, CA | May 2019'), 'Must contain University, Location | Graduation Date');

  // Check Certifications
  assert(textOutput.includes('Certifications\n'), 'Must contain exact section header "Certifications"');
  assert(textOutput.includes('AWS Certified Solutions Architect, Amazon Web Services – 2023'), 'Must contain Certification Name, Issuing Organization – Year');

  console.log('✅ Test 1 Passed: Plain text structure strictly adheres to the requested template.\n');

  // Test 2: Verify generateFullResumeHtml produces the visual layout matching the template & PDF
  console.log('Test 2: Validating generateFullResumeHtml template layout and headers...');
  const htmlOutput = generateFullResumeHtml(sampleCandidateData);

  assert(htmlOutput.includes('PROFESSIONAL SUMMARY') || htmlOutput.includes('Professional Summary'), 'HTML must include Professional Summary header');
  assert(htmlOutput.includes('CORE COMPETENCIES & SKILLS') || htmlOutput.includes('Core Competencies & Skills'), 'HTML must include Core Competencies & Skills header');
  assert(htmlOutput.includes('PROFESSIONAL EXPERIENCE') || htmlOutput.includes('Professional Experience'), 'HTML must include Professional Experience header');
  assert(htmlOutput.includes('EDUCATION') || htmlOutput.includes('Education'), 'HTML must include Education header');
  assert(htmlOutput.includes('CERTIFICATIONS') || htmlOutput.includes('Certifications'), 'HTML must include Certifications header');
  assert(htmlOutput.includes('Technical Skills') || htmlOutput.includes('Technical / Hard Skills'), 'HTML must include Technical Skills category');
  assert(htmlOutput.includes('Industry Knowledge'), 'HTML must include Industry Knowledge category');
  assert(htmlOutput.includes('Soft Skills'), 'HTML must include Soft Skills category');
  assert(htmlOutput.includes('Languages') || htmlOutput.includes('Tools & Platforms'), 'HTML must include Languages/Tools category');
  assert(htmlOutput.includes('Action + Metric + Impact:'), 'HTML bullet points must follow Action + Metric + Impact framework');

  console.log('✅ Test 2 Passed: HTML output strictly includes all required template sections and styles.\n');

  // Test 3: Validate analyzeResume extracts core competencies categories and Action + Metric + Impact
  console.log('Test 3: Validating backend analyzeResume extraction into the template structure...');
  const rawResumeText = `
Alex Morgan
San Francisco, CA 94105 | (555) 234-5678 | alex.morgan@example.com | https://linkedin.com/in/alexmorgan

Professional Summary
Senior Full Stack Engineer with over 6 years of experience building high-traffic cloud platforms and AI-driven web systems. Proven track record of architecting scalable distributed backends in Node.js and interactive frontends in React. Built high-scale applications serving 500k+ monthly active users.

Core Competencies & Skills
Technical Skills: React, Node.js, Express, JavaScript, Python, SQL, Docker, Git, REST API
Industry Knowledge: SaaS & Cloud Computing, E-Commerce, Microservices
Soft Skills: Team Leadership, Agile/Scrum, Problem Solving
Languages: English, Spanish

Professional Experience
Full Stack Software Engineer
TechFlow Systems, San Francisco, CA | Jan 2022 – Present
• Architected RESTful microservices with Node.js and Express, cutting latency by 35% for 200k active users.
• Spearheaded frontend migration to React, improving Core Web Vitals score by 25 points.
• Automated deployment workflows with Docker and CI/CD pipelines, saving 10 engineering hours weekly.

Education
Bachelor of Science in Computer Science
San Francisco State University, San Francisco, CA | May 2021

Certifications
AWS Certified Developer, Amazon Web Services – 2023
Full Stack Web Specialist, SkillBridge – 2024
`;

  const analysis = await analyzeResume(rawResumeText, "Full Stack Developer");

  assert(analysis.candidate, 'Must have candidate object');
  assert.strictEqual(analysis.candidate.name, 'Alex Morgan', 'Must extract candidate name');
  assert(analysis.candidate.location.includes('San Francisco'), 'Must extract candidate location');
  assert(analysis.candidate.phone.includes('234-5678'), 'Must extract candidate phone');
  assert(analysis.candidate.email.includes('alex.morgan@example.com'), 'Must extract candidate email');
  assert(analysis.candidate.linkedIn.includes('linkedin.com/in/alexmorgan'), 'Must extract LinkedIn URL');

  assert(analysis.coreCompetencies, 'Must have coreCompetencies object');
  assert(Array.isArray(analysis.coreCompetencies.technicalSkills) && analysis.coreCompetencies.technicalSkills.length > 0, 
    'Must extract technicalSkills array');
  assert(Array.isArray(analysis.coreCompetencies.industryKnowledge), 'Must extract industryKnowledge array');
  assert(Array.isArray(analysis.coreCompetencies.softSkills), 'Must extract softSkills array');
  assert(Array.isArray(analysis.coreCompetencies.languages), 'Must extract languages array');

  assert(Array.isArray(analysis.experience) && analysis.experience.length > 0, 'Must extract experience');
  assert(analysis.experience[0].role.includes('Engineer'), 'Must extract role');
  assert(analysis.experience[0].bullets && analysis.experience[0].bullets.length > 0, 'Must extract experience bullets');
  assert(analysis.experience[0].bullets.some(b => b.includes('Action + Metric + Impact:')), 
    'Experience bullets must follow Action + Metric + Impact format');

  assert(Array.isArray(analysis.education) && analysis.education.length > 0, 'Must extract education');
  assert(Array.isArray(analysis.certifications) && analysis.certifications.length > 0, 'Must extract certifications');
  assert(analysis.certifications[0].name && analysis.certifications[0].issuer, 'Certifications must have name and issuer');

  assert(typeof analysis.structuredResumeText === 'string' && analysis.structuredResumeText.length > 0, 
    'Must include ready-to-download structuredResumeText');

  console.log('✅ Test 3 Passed: AI and fallback extractor correctly populate all required fields and structured text.\n');
  console.log('🎉 ALL TDD TESTS COMPLETED SUCCESSFULLY!');
}

runTests().catch(err => {
  console.error('\n❌ TDD Test Failed:', err);
  process.exit(1);
});
