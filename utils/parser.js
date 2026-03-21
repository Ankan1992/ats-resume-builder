const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const fs = require('fs');

async function parseResume(filePath, ext) {
  let rawText = '';

  if (ext === '.pdf') {
    const buffer = fs.readFileSync(filePath);
    const data = await pdfParse(buffer);
    rawText = data.text;
  } else if (ext === '.docx' || ext === '.doc') {
    const result = await mammoth.extractRawText({ path: filePath });
    rawText = result.value;
  } else {
    throw new Error('Unsupported file format');
  }

  return extractSections(rawText);
}

function extractSections(text) {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);

  const resume = {
    name: '',
    email: '',
    phone: '',
    location: '',
    linkedin: '',
    website: '',
    summary: '',
    experience: [],
    education: [],
    skills: [],
    certifications: [],
    projects: [],
    languages: [],
    additionalSections: []
  };

  // Extract contact info
  const emailRegex = /[\w.-]+@[\w.-]+\.\w+/;
  const phoneRegex = /(\+?\d[\d\s\-().]{7,}\d)/;
  const linkedinRegex = /linkedin\.com\/in\/[\w-]+/i;
  const websiteRegex = /(?:https?:\/\/)?(?:www\.)?[\w-]+\.[\w.]+(?:\/[\w-]*)?/i;

  // First line is usually the name
  if (lines.length > 0) {
    const firstLine = lines[0];
    if (!emailRegex.test(firstLine) && !phoneRegex.test(firstLine) && firstLine.length < 60) {
      resume.name = firstLine;
    }
  }

  // Scan first 8 lines for contact info
  const headerLines = lines.slice(0, 8).join(' ');
  const emailMatch = headerLines.match(emailRegex);
  if (emailMatch) resume.email = emailMatch[0];

  const phoneMatch = headerLines.match(phoneRegex);
  if (phoneMatch) resume.phone = phoneMatch[1].trim();

  const linkedinMatch = headerLines.match(linkedinRegex);
  if (linkedinMatch) resume.linkedin = linkedinMatch[0];

  // Section detection
  const sectionHeaders = {
    summary: /^(summary|profile|objective|about\s*me|professional\s*summary|career\s*summary|executive\s*summary)/i,
    experience: /^(experience|work\s*experience|employment|professional\s*experience|work\s*history|career\s*history)/i,
    education: /^(education|academic|qualifications|educational\s*background)/i,
    skills: /^(skills|technical\s*skills|core\s*competencies|competencies|key\s*skills|technologies|tools)/i,
    certifications: /^(certifications?|licenses?|credentials|professional\s*certifications?)/i,
    projects: /^(projects|personal\s*projects|key\s*projects|notable\s*projects)/i,
    languages: /^(languages|language\s*proficiency)/i
  };

  let currentSection = 'header';
  let currentEntry = null;

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    let sectionFound = false;

    // Check if this line is a section header
    for (const [section, regex] of Object.entries(sectionHeaders)) {
      if (regex.test(line)) {
        currentSection = section;
        currentEntry = null;
        sectionFound = true;
        break;
      }
    }

    if (sectionFound) continue;

    // Process content based on current section
    switch (currentSection) {
      case 'header':
        // Skip header lines already processed
        break;

      case 'summary':
        resume.summary += (resume.summary ? ' ' : '') + line;
        break;

      case 'experience': {
        // Heuristic: lines with dates are likely job titles/company
        const datePattern = /(\d{4}|present|current|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i;
        const hasDash = /[–—-]/.test(line);

        if (datePattern.test(line) && hasDash && line.length < 120) {
          // This looks like a job header line
          if (currentEntry) {
            resume.experience.push(currentEntry);
          }
          currentEntry = {
            title: '',
            company: '',
            duration: line,
            description: ''
          };

          // Try to split "Title | Company | Date" or "Title at Company, Date"
          const parts = line.split(/[|•·]/);
          if (parts.length >= 2) {
            currentEntry.title = parts[0].trim();
            currentEntry.company = parts.length >= 3 ? parts[1].trim() : '';
            currentEntry.duration = parts[parts.length - 1].trim();
          }
        } else if (currentEntry) {
          if (!currentEntry.title && line.length < 80) {
            currentEntry.title = line;
          } else {
            currentEntry.description += (currentEntry.description ? '\n' : '') + line;
          }
        } else {
          // First experience entry without date pattern
          currentEntry = { title: line, company: '', duration: '', description: '' };
        }
        break;
      }

      case 'education': {
        const datePattern = /(\d{4}|present|current)/i;
        if (datePattern.test(line) || (currentEntry === null && line.length < 120)) {
          if (currentEntry) {
            resume.education.push(currentEntry);
          }
          currentEntry = { degree: line, institution: '', year: '', details: '' };

          const yearMatch = line.match(/(\d{4})/);
          if (yearMatch) currentEntry.year = yearMatch[1];
        } else if (currentEntry) {
          if (!currentEntry.institution && line.length < 100) {
            currentEntry.institution = line;
          } else {
            currentEntry.details += (currentEntry.details ? '\n' : '') + line;
          }
        }
        break;
      }

      case 'skills': {
        // Skills are often comma/pipe separated or bullet points
        const skillItems = line.split(/[,;|•·▪►]/).map(s => s.trim()).filter(s => s.length > 0 && s.length < 60);
        resume.skills.push(...skillItems);
        break;
      }

      case 'certifications':
        resume.certifications.push(line);
        break;

      case 'projects': {
        if (!currentEntry || (line.length < 80 && !line.startsWith('-') && !line.startsWith('•'))) {
          if (currentEntry) resume.projects.push(currentEntry);
          currentEntry = { name: line, description: '' };
        } else {
          currentEntry.description += (currentEntry.description ? '\n' : '') + line;
        }
        break;
      }

      case 'languages':
        const langItems = line.split(/[,;|•·]/).map(s => s.trim()).filter(s => s.length > 0);
        resume.languages.push(...langItems);
        break;
    }
  }

  // Push last entry
  if (currentEntry) {
    if (currentSection === 'experience') resume.experience.push(currentEntry);
    else if (currentSection === 'education') resume.education.push(currentEntry);
    else if (currentSection === 'projects') resume.projects.push(currentEntry);
  }

  // Deduplicate skills
  resume.skills = [...new Set(resume.skills)];

  return resume;
}

module.exports = { parseResume };
