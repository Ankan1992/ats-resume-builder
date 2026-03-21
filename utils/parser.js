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

// ===== Helper patterns =====
const MONTHS = 'jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?';
const DATE_RANGE_REGEX = new RegExp(
  `((?:${MONTHS})\\s*[''']?\\d{2,4}|\\d{4})\\s*[–—\\-~to]+\\s*((?:${MONTHS})\\s*[''']?\\d{2,4}|\\d{4}|present|current|till\\s*date|ongoing|now)`,
  'i'
);
const SINGLE_YEAR_REGEX = /\b(19|20)\d{2}\b/;
const DATE_LINE_REGEX = new RegExp(`(${MONTHS})[\\s.]*[''']?(\\d{2,4})`, 'i');
const PERCENTAGE_REGEX = /(\d{1,3}(?:\.\d+)?)\s*(?:%|percent|marks|cgpa|sgpa|gpa|cpi)/i;
const GPA_REGEX = /(?:cgpa|sgpa|gpa|cpi)\s*[:=]?\s*(\d+(?:\.\d+)?)\s*(?:\/\s*(\d+))?/i;
const RANK_REGEX = /(?:rank|percentile|topper|gold\s*medal|silver\s*medal|distinction|first\s*class|second\s*class|honours|honors|merit|dean'?s?\s*list|valedictorian|summa\s*cum\s*laude|magna\s*cum\s*laude|cum\s*laude)/i;

// Known degree patterns
const DEGREE_PATTERNS = /\b(B\.?\s*Tech|M\.?\s*Tech|B\.?\s*E|M\.?\s*E|B\.?\s*Sc|M\.?\s*Sc|B\.?\s*A|M\.?\s*A|B\.?\s*Com|M\.?\s*Com|BBA|MBA|BCA|MCA|Ph\.?\s*D|B\.?\s*Arch|M\.?\s*Arch|LLB|LLM|MBBS|MD|MS|B\.?\s*Des|M\.?\s*Des|Diploma|Higher\s*Secondary|Secondary|HSC|SSC|ICSE|ISC|CBSE|Class\s*(?:X|XII|10|12)|(?:10|12)(?:th|st|nd|rd)\s*(?:grade|class|standard)?|Bachelor|Master|Doctor|Post\s*Graduate|Under\s*Graduate|Intermediate)\b/i;

// Known institution indicators
const INSTITUTION_INDICATORS = /\b(university|institute|college|school|academy|iit|iim|nit|bits|iisc|iiit|isb|xlri|fms|jbims|nmims|symbiosis|amity|vit|srm|manipal|jadavpur|calcutta|delhi|mumbai|chennai|bangalore|bengaluru|hyderabad|pune|kolkata|board|council|cbse|icse)\b/i;

// Common company suffixes/indicators
const COMPANY_INDICATORS = /\b(technologies|technology|tech|pvt|ltd|limited|private|inc|corp|corporation|llc|llp|solutions|services|consulting|consultancy|group|enterprises|systems|software|labs|ventures|capital|partners|industries|global|india|analytics|digital|networks|infosys|tcs|wipro|hcl|cognizant|accenture|deloitte|kpmg|ey|pwc|mckinsey|bain|bcg|goldman|morgan|jpmorgan|amazon|google|microsoft|meta|facebook|apple|flipkart|swiggy|zomato|paytm|razorpay|juspay|zestmoney|cred|phonepe|bharatpe|groww|zerodha|byju|unacademy)\b/i;

// Job title patterns
const JOB_TITLE_PATTERNS = /\b(engineer|developer|manager|director|vp|vice\s*president|head|lead|senior|junior|analyst|consultant|architect|designer|associate|executive|officer|specialist|coordinator|intern|trainee|founder|co-founder|ceo|cto|cfo|coo|cmo|cpo|chief|president|partner|principal|product\s*manager|program\s*manager|project\s*manager|business\s*analyst|data\s*scientist|data\s*analyst|data\s*engineer|software\s*engineer|full\s*stack|frontend|backend|devops|sre|qa|tester|testing|scrum\s*master|agile\s*coach|strategy|operations|marketing|sales|finance|hr|human\s*resources|growth|content|editorial|research|professor|lecturer|teaching\s*assistant|fellow)\b/i;


function extractSections(text) {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);

  const resume = {
    name: '', email: '', phone: '', location: '', linkedin: '', website: '',
    summary: '',
    experience: [],
    education: [],
    skills: [],
    certifications: [],
    projects: [],
    languages: [],
    additionalSections: []
  };

  // === Extract contact info from first ~10 lines ===
  const emailRegex = /[\w.+-]+@[\w.-]+\.\w+/;
  const phoneRegex = /(\+?\d[\d\s\-().]{7,}\d)/;
  const linkedinRegex = /linkedin\.com\/in\/[\w-]+/i;

  // First non-contact line is likely the name
  if (lines.length > 0) {
    const firstLine = lines[0];
    if (!emailRegex.test(firstLine) && !phoneRegex.test(firstLine) &&
        !linkedinRegex.test(firstLine) && firstLine.length < 60) {
      resume.name = firstLine;
    }
  }

  // Scan first 10 lines for contact info
  const headerText = lines.slice(0, 10).join(' ');
  const emailMatch = headerText.match(emailRegex);
  if (emailMatch) resume.email = emailMatch[0];

  const phoneMatch = headerText.match(phoneRegex);
  if (phoneMatch) resume.phone = phoneMatch[1].trim();

  const linkedinMatch = headerText.match(linkedinRegex);
  if (linkedinMatch) resume.linkedin = linkedinMatch[0];

  // Try to extract location from header
  const locationPatterns = [
    /\b(Mumbai|Delhi|Bangalore|Bengaluru|Hyderabad|Chennai|Kolkata|Pune|Ahmedabad|Jaipur|Lucknow|Noida|Gurgaon|Gurugram|Chandigarh|Indore|Bhopal|Patna|Kochi|Thiruvananthapuram|Coimbatore|Nagpur|Visakhapatnam|Surat|Vadodara|New\s*Delhi|NCR|Goa)(?:\s*,\s*(?:India|IN))?\b/i,
    /\b(New\s*York|San\s*Francisco|London|Singapore|Dubai|Toronto|Sydney|Berlin|Tokyo|Seattle|Austin|Boston|Chicago|Los\s*Angeles)\b/i
  ];
  for (const locRegex of locationPatterns) {
    const locMatch = headerText.match(locRegex);
    if (locMatch) {
      resume.location = locMatch[0];
      break;
    }
  }

  // === Section detection ===
  const sectionHeaders = {
    summary: /^(summary|profile|objective|about\s*me|professional\s*summary|career\s*summary|executive\s*summary|career\s*objective)[\s:]*$/i,
    experience: /^(experience|work\s*experience|employment|professional\s*experience|work\s*history|career\s*history|employment\s*history)[\s:]*$/i,
    education: /^(education|academic|qualifications?|educational\s*(?:background|qualifications?)|academic\s*(?:background|qualifications?))[\s:]*$/i,
    skills: /^(skills|technical\s*skills|core\s*competencies|competencies|key\s*skills|technologies|tools|areas?\s*of\s*expertise|skill\s*set)[\s:]*$/i,
    certifications: /^(certifications?|licenses?|credentials|professional\s*certifications?|courses?\s*(?:&|and)\s*certifications?|training\s*(?:&|and)\s*certifications?)[\s:]*$/i,
    projects: /^(projects|personal\s*projects|key\s*projects|notable\s*projects|academic\s*projects|side\s*projects)[\s:]*$/i,
    languages: /^(languages|language\s*proficiency|language\s*skills)[\s:]*$/i
  };

  let currentSection = 'header';
  let sectionLines = { header: [], summary: [], experience: [], education: [], skills: [], certifications: [], projects: [], languages: [] };

  // First pass: identify sections and collect lines
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    let sectionFound = false;

    for (const [section, regex] of Object.entries(sectionHeaders)) {
      if (regex.test(line)) {
        currentSection = section;
        sectionFound = true;
        break;
      }
    }

    if (!sectionFound) {
      if (!sectionLines[currentSection]) sectionLines[currentSection] = [];
      sectionLines[currentSection].push(line);
    }
  }

  // === Process Summary ===
  resume.summary = sectionLines.summary.join(' ').trim();

  // === Process Experience ===
  resume.experience = parseExperience(sectionLines.experience);

  // === Process Education ===
  resume.education = parseEducation(sectionLines.education);

  // === Process Skills ===
  for (const line of sectionLines.skills) {
    const skillItems = line.split(/[,;|•·▪►★✓✔→\-]/)
      .map(s => s.replace(/^\s*[-•·]\s*/, '').trim())
      .filter(s => s.length > 0 && s.length < 80);
    resume.skills.push(...skillItems);
  }
  resume.skills = [...new Set(resume.skills)].filter(s => s.length > 1);

  // === Process Certifications ===
  for (const line of sectionLines.certifications) {
    const cleaned = line.replace(/^[-•·▪►★✓✔→]\s*/, '').trim();
    if (cleaned.length > 0) resume.certifications.push(cleaned);
  }

  // === Process Projects ===
  resume.projects = parseProjects(sectionLines.projects);

  // === Process Languages ===
  for (const line of (sectionLines.languages || [])) {
    const langItems = line.split(/[,;|•·▪]/).map(s => s.trim()).filter(s => s.length > 0 && s.length < 40);
    resume.languages.push(...langItems);
  }
  resume.languages = [...new Set(resume.languages)];

  return resume;
}


// ===== Experience Parser =====
function parseExperience(lines) {
  if (!lines || lines.length === 0) return [];

  const entries = [];
  let current = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const nextLine = i + 1 < lines.length ? lines[i + 1] : '';

    // Check if this line contains a date range (strong indicator of new entry)
    const dateRangeMatch = line.match(DATE_RANGE_REGEX);
    const hasJobTitle = JOB_TITLE_PATTERNS.test(line);
    const hasCompany = COMPANY_INDICATORS.test(line);
    const isBullet = /^[-•▪►★✓✔→●◆■]/.test(line);

    if (dateRangeMatch) {
      // This line has a date range — it's a job header or contains one
      if (current) entries.push(current);

      const duration = dateRangeMatch[0];
      const beforeDate = line.substring(0, line.indexOf(dateRangeMatch[0])).trim().replace(/[|,–—\-]\s*$/, '').trim();
      const afterDate = line.substring(line.indexOf(dateRangeMatch[0]) + dateRangeMatch[0].length).trim().replace(/^[|,–—\-]\s*/, '').trim();

      current = { title: '', company: '', duration: duration, description: '' };

      // Parse the non-date part of the line
      const textPart = beforeDate || afterDate;
      if (textPart) {
        parseJobTitleCompany(textPart, current);
      }

      // If we still don't have title or company, check if previous line was title/company
      // or if next line is title/company (date on its own line)
      if (!current.title && !current.company) {
        // Look at the previous non-bullet line
        if (i > 0 && !entries.length || (entries.length && entries[entries.length - 1] !== current)) {
          const prevLine = lines[i - 1];
          if (prevLine && !DATE_RANGE_REGEX.test(prevLine) && !/^[-•▪►★✓✔→●◆■]/.test(prevLine)) {
            parseJobTitleCompany(prevLine, current);
          }
        }
      }
    } else if (!isBullet && !current && (hasJobTitle || hasCompany)) {
      // Line with job title or company but no date — might be first line of an entry
      // Check if next line has the date
      if (current) entries.push(current);
      current = { title: '', company: '', duration: '', description: '' };
      parseJobTitleCompany(line, current);

      // Peek at next line for date
      if (nextLine && DATE_RANGE_REGEX.test(nextLine)) {
        // Date will be picked up on next iteration
      }
    } else if (!isBullet && current && !current.title && line.length < 100) {
      // We have an entry started (likely from date line) but no title yet
      parseJobTitleCompany(line, current);
    } else if (!isBullet && current && !current.company && hasCompany && line.length < 100) {
      // We have title but company was on separate line
      current.company = line.replace(/[|,•·]\s*/g, '').trim();
    } else if (current) {
      // Description / bullet point
      const cleanLine = line.replace(/^[-•▪►★✓✔→●◆■]\s*/, '').trim();
      if (cleanLine) {
        current.description += (current.description ? '\n' : '') + cleanLine;
      }
    } else {
      // No current entry, line without date — might be a title/company line
      if (hasJobTitle || hasCompany || line.length < 80) {
        current = { title: '', company: '', duration: '', description: '' };
        parseJobTitleCompany(line, current);
      }
    }
  }

  if (current) entries.push(current);

  // Post-process: if title is empty but company has a job-title-like word, try to fix
  for (const entry of entries) {
    if (!entry.title && entry.company) {
      // Swap if company looks like a title
      if (JOB_TITLE_PATTERNS.test(entry.company) && !COMPANY_INDICATORS.test(entry.company)) {
        entry.title = entry.company;
        entry.company = '';
      }
    }
    // Clean up
    entry.title = entry.title.replace(/[|,–—\-]\s*$/, '').trim();
    entry.company = entry.company.replace(/^[|,–—\-]\s*/, '').replace(/[|,–—\-]\s*$/, '').trim();
    entry.duration = entry.duration.trim();
  }

  return entries;
}

function parseJobTitleCompany(text, entry) {
  if (!text) return;

  // Remove trailing/leading separators
  text = text.replace(/^[|,–—\-]\s*/, '').replace(/[|,–—\-]\s*$/, '').trim();

  // Try splitting by common separators: |, "at", "–", ","
  const separators = [
    /\s*\|\s*/,
    /\s+at\s+/i,
    /\s*[–—]\s*/,
    /\s*,\s+/
  ];

  for (const sep of separators) {
    const parts = text.split(sep).map(p => p.trim()).filter(p => p.length > 0);
    if (parts.length >= 2) {
      // Determine which part is title and which is company
      const firstIsTitle = JOB_TITLE_PATTERNS.test(parts[0]);
      const secondIsTitle = JOB_TITLE_PATTERNS.test(parts[1]);
      const firstIsCompany = COMPANY_INDICATORS.test(parts[0]);
      const secondIsCompany = COMPANY_INDICATORS.test(parts[1]);

      if (firstIsTitle && secondIsCompany) {
        entry.title = parts[0];
        entry.company = parts[1];
        return;
      } else if (firstIsCompany && secondIsTitle) {
        entry.company = parts[0];
        entry.title = parts[1];
        return;
      } else if (firstIsTitle && !secondIsTitle) {
        entry.title = parts[0];
        entry.company = parts[1];
        return;
      } else if (secondIsTitle && !firstIsTitle) {
        entry.title = parts[1];
        entry.company = parts[0];
        return;
      } else if (firstIsCompany) {
        entry.company = parts[0];
        entry.title = parts.slice(1).join(' ');
        return;
      } else if (secondIsCompany) {
        entry.title = parts[0];
        entry.company = parts[1];
        return;
      } else {
        // Default: first part is title, second is company
        entry.title = parts[0];
        entry.company = parts[1];
        return;
      }
    }
  }

  // No separator found — check if it looks like a title or company
  if (JOB_TITLE_PATTERNS.test(text)) {
    entry.title = text;
  } else if (COMPANY_INDICATORS.test(text)) {
    entry.company = text;
  } else {
    // Default to title if nothing else matches and entry has no title
    if (!entry.title) entry.title = text;
    else if (!entry.company) entry.company = text;
  }
}


// ===== Education Parser =====
function parseEducation(lines) {
  if (!lines || lines.length === 0) return [];

  const entries = [];
  let current = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const isBullet = /^[-•▪►★✓✔→●◆■]/.test(line);
    const hasDegree = DEGREE_PATTERNS.test(line);
    const hasInstitution = INSTITUTION_INDICATORS.test(line);
    const hasYear = SINGLE_YEAR_REGEX.test(line);
    const hasPercentage = PERCENTAGE_REGEX.test(line) || GPA_REGEX.test(line);
    const hasRank = RANK_REGEX.test(line);
    const hasDateRange = DATE_RANGE_REGEX.test(line);

    // Is this a new education entry?
    const isNewEntry = hasDegree || (hasInstitution && !isBullet && (!current || current.institution));

    if (isNewEntry && !isBullet) {
      if (current) entries.push(current);
      current = { degree: '', institution: '', year: '', details: '' };

      // Parse this line
      parseEducationLine(line, current);

      // Check if next lines are continuation (institution, year, details)
      continue;
    }

    if (current) {
      if (!isBullet && hasInstitution && !current.institution) {
        // This line is the institution
        const cleaned = line.replace(DATE_RANGE_REGEX, '').replace(SINGLE_YEAR_REGEX, '').trim().replace(/[|,–—\-]\s*$/, '').trim();
        current.institution = cleaned || line;

        // Extract year from this line if present
        extractYear(line, current);
      } else if (!isBullet && hasYear && !current.year) {
        // Date/year line
        extractYear(line, current);
        // Rest might be details
        const withoutYear = line.replace(DATE_RANGE_REGEX, '').replace(/\b(19|20)\d{2}\b/g, '').trim().replace(/^[|,–—\-]\s*/, '').replace(/[|,–—\-]\s*$/, '').trim();
        if (withoutYear.length > 2) {
          addEducationDetails(withoutYear, current);
        }
      } else if (hasPercentage || hasRank || isBullet) {
        // This is a details line (marks, GPA, rank, honors)
        const cleaned = line.replace(/^[-•▪►★✓✔→●◆■]\s*/, '').trim();
        addEducationDetails(cleaned, current);
      } else if (!current.institution && line.length < 120 && !isBullet) {
        // Might be institution on its own line
        current.institution = line.replace(/[|,–—\-]\s*$/, '').trim();
        extractYear(line, current);
      } else {
        // Additional details
        const cleaned = line.replace(/^[-•▪►★✓✔→●◆■]\s*/, '').trim();
        if (cleaned) addEducationDetails(cleaned, current);
      }
    } else {
      // No current entry yet — start one
      current = { degree: '', institution: '', year: '', details: '' };
      parseEducationLine(line, current);
    }
  }

  if (current) entries.push(current);

  // Post-process education entries
  for (const entry of entries) {
    // If degree still contains year, extract it
    if (entry.degree && !entry.year) {
      extractYear(entry.degree, entry);
    }
    // Clean year out of degree field
    if (entry.year && entry.degree) {
      entry.degree = entry.degree.replace(new RegExp(`\\b${entry.year}\\b`), '').trim();
      entry.degree = entry.degree.replace(/[|,–—\-]\s*$/, '').replace(/^\s*[|,–—\-]/, '').trim();
    }

    // If percentage/GPA is in degree field, move to details
    const pctInDegree = entry.degree.match(PERCENTAGE_REGEX) || entry.degree.match(GPA_REGEX);
    if (pctInDegree) {
      const pctStr = pctInDegree[0];
      entry.degree = entry.degree.replace(pctStr, '').trim().replace(/[|,–—\-]\s*$/, '').trim();
      if (!entry.details.includes(pctStr)) {
        entry.details = (entry.details ? entry.details + '\n' : '') + pctStr;
      }
    }

    // Clean empty details
    entry.degree = entry.degree.trim();
    entry.institution = entry.institution.trim();
    entry.details = entry.details.trim();
  }

  return entries;
}

function parseEducationLine(line, entry) {
  // Try to separate degree, institution, year from one line
  // Common formats:
  //   "MBA, IIM Ahmedabad, 2020"
  //   "B.Tech in Computer Science | IIT Delhi | 2018"
  //   "B.Tech Computer Science Engineering, 82%, 2015"

  // First extract year
  extractYear(line, entry);

  // Remove year from line for further parsing
  let cleaned = line;
  if (entry.year) {
    cleaned = cleaned.replace(new RegExp(`\\b${entry.year}\\b`), '').trim();
  }
  // Remove date ranges
  cleaned = cleaned.replace(DATE_RANGE_REGEX, '').trim();

  // Extract percentage/GPA and put in details
  const pctMatch = cleaned.match(PERCENTAGE_REGEX) || cleaned.match(GPA_REGEX);
  if (pctMatch) {
    const pctStr = pctMatch[0];
    cleaned = cleaned.replace(pctStr, '').trim();
    entry.details = (entry.details ? entry.details + '\n' : '') + pctStr;
  }

  // Clean separators
  cleaned = cleaned.replace(/^[|,–—\-]\s*/, '').replace(/[|,–—\-]\s*$/, '').trim();

  // Split by separators
  const separators = [/\s*\|\s*/, /\s*[–—]\s*/, /\s*,\s+/];
  let parts = [cleaned];
  for (const sep of separators) {
    if (cleaned.split(sep).length >= 2) {
      parts = cleaned.split(sep).map(p => p.trim()).filter(p => p.length > 0);
      break;
    }
  }

  if (parts.length >= 2) {
    // Determine which is degree vs institution
    for (let p = 0; p < parts.length; p++) {
      const part = parts[p];
      if (DEGREE_PATTERNS.test(part) && !entry.degree) {
        entry.degree = part;
      } else if (INSTITUTION_INDICATORS.test(part) && !entry.institution) {
        entry.institution = part;
      } else if (PERCENTAGE_REGEX.test(part) || GPA_REGEX.test(part)) {
        addEducationDetails(part, entry);
      } else if (!entry.degree) {
        entry.degree = part;
      } else if (!entry.institution) {
        entry.institution = part;
      } else {
        addEducationDetails(part, entry);
      }
    }
  } else if (parts.length === 1) {
    const part = parts[0];
    if (DEGREE_PATTERNS.test(part)) {
      entry.degree = part;
    } else if (INSTITUTION_INDICATORS.test(part)) {
      entry.institution = part;
    } else {
      entry.degree = part;
    }
  }
}

function extractYear(text, entry) {
  if (entry.year) return;
  // Prefer date ranges first
  const rangeMatch = text.match(DATE_RANGE_REGEX);
  if (rangeMatch) {
    // Extract the end year
    const endYear = rangeMatch[2].match(/\b(19|20)\d{2}\b/);
    if (endYear) {
      entry.year = endYear[0];
      return;
    }
  }
  // Single year
  const yearMatch = text.match(/\b((?:19|20)\d{2})\b/);
  if (yearMatch) {
    entry.year = yearMatch[1];
  }
}

function addEducationDetails(text, entry) {
  if (!text || text.length < 2) return;
  if (entry.details) {
    entry.details += '\n' + text;
  } else {
    entry.details = text;
  }
}


// ===== Projects Parser =====
function parseProjects(lines) {
  if (!lines || lines.length === 0) return [];

  const entries = [];
  let current = null;

  for (const line of lines) {
    const isBullet = /^[-•▪►★✓✔→●◆■]/.test(line);

    if (!isBullet && line.length < 100 && !current) {
      current = { name: line, description: '' };
    } else if (!isBullet && line.length < 80 && current && !current.description) {
      // Might be a subtitle or new project
      if (current.description || current.name) {
        entries.push(current);
      }
      current = { name: line, description: '' };
    } else if (current) {
      const cleanLine = line.replace(/^[-•▪►★✓✔→●◆■]\s*/, '').trim();
      if (cleanLine) {
        current.description += (current.description ? '\n' : '') + cleanLine;
      }
    } else {
      current = { name: line.replace(/^[-•▪►★✓✔→●◆■]\s*/, '').trim(), description: '' };
    }
  }

  if (current) entries.push(current);
  return entries;
}


module.exports = { parseResume };
