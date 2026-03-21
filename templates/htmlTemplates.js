function escapeHTML(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function highlightText(text, keywords) {
  if (!text || !keywords || keywords.length === 0) return escapeHTML(text);

  let result = escapeHTML(text);
  keywords.forEach(keyword => {
    const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escaped})`, 'gi');
    result = result.replace(regex, '<strong class="keyword-highlight">$1</strong>');
  });
  return result;
}

function buildContactLine(data) {
  const parts = [];
  if (data.email) parts.push(`<a href="mailto:${escapeHTML(data.email)}">${escapeHTML(data.email)}</a>`);
  if (data.phone) parts.push(escapeHTML(data.phone));
  if (data.location) parts.push(escapeHTML(data.location));
  if (data.linkedin) parts.push(`<a href="https://${escapeHTML(data.linkedin)}">${escapeHTML(data.linkedin)}</a>`);
  if (data.website) parts.push(escapeHTML(data.website));
  return parts.join(' &nbsp;|&nbsp; ');
}

function buildExperienceHTML(experience, keywords, label) {
  if (!experience || experience.length === 0) return '';
  let html = `<div class="section"><h2>${escapeHTML(label || 'Professional Experience')}</h2>`;
  experience.forEach(exp => {
    html += '<div class="entry">';
    html += `<div class="entry-header">`;
    html += `<span class="entry-title">${escapeHTML(exp.title)}</span>`;
    if (exp.company) html += `<span class="entry-company"> | ${escapeHTML(exp.company)}</span>`;
    html += `</div>`;
    if (exp.duration) html += `<div class="entry-date">${escapeHTML(exp.duration)}</div>`;
    if (exp.description) {
      html += '<ul class="entry-bullets">';
      exp.description.split('\n').filter(b => b.trim()).forEach(bullet => {
        const clean = bullet.replace(/^[-•▪►*]\s*/, '');
        html += `<li>${highlightText(clean, keywords)}</li>`;
      });
      html += '</ul>';
    }
    html += '</div>';
  });
  html += '</div>';
  return html;
}

function buildEducationHTML(education, label) {
  if (!education || education.length === 0) return '';
  let html = `<div class="section"><h2>${escapeHTML(label || 'Education')}</h2>`;
  education.forEach(edu => {
    html += '<div class="entry">';
    html += `<div class="entry-header">`;
    html += `<span class="entry-title">${escapeHTML(edu.degree)}</span>`;
    if (edu.year) html += `<span class="entry-date-inline"> | ${escapeHTML(edu.year)}</span>`;
    html += `</div>`;
    if (edu.institution) html += `<div class="entry-subtitle">${escapeHTML(edu.institution)}</div>`;
    if (edu.details) html += `<div class="entry-details">${escapeHTML(edu.details)}</div>`;
    html += '</div>';
  });
  html += '</div>';
  return html;
}

function buildSkillsHTML(skills, keywords, label) {
  if (!skills || skills.length === 0) return '';
  const skillText = skills.map(s => highlightText(s, keywords)).join(' &nbsp;&bull;&nbsp; ');
  return `<div class="section"><h2>${escapeHTML(label || 'Skills')}</h2><div class="skills-list">${skillText}</div></div>`;
}

function buildCertsHTML(certifications, label) {
  if (!certifications || certifications.length === 0) return '';
  let html = `<div class="section"><h2>${escapeHTML(label || 'Certifications')}</h2><ul>`;
  certifications.forEach(c => { html += `<li>${escapeHTML(c)}</li>`; });
  html += '</ul></div>';
  return html;
}

function buildProjectsHTML(projects, keywords, label) {
  if (!projects || projects.length === 0) return '';
  let html = `<div class="section"><h2>${escapeHTML(label || 'Projects')}</h2>`;
  projects.forEach(proj => {
    html += '<div class="entry">';
    html += `<div class="entry-title">${escapeHTML(proj.name)}</div>`;
    if (proj.description) {
      html += '<ul class="entry-bullets">';
      proj.description.split('\n').filter(b => b.trim()).forEach(bullet => {
        const clean = bullet.replace(/^[-•▪►*]\s*/, '');
        html += `<li>${highlightText(clean, keywords)}</li>`;
      });
      html += '</ul>';
    }
    html += '</div>';
  });
  html += '</div>';
  return html;
}

function buildLanguagesHTML(languages) {
  if (!languages || languages.length === 0) return '';
  return `<div class="section"><h2>Languages</h2><div class="skills-list">${languages.map(escapeHTML).join(' &bull; ')}</div></div>`;
}

function buildAdditionalHTML(additionalSections, keywords) {
  if (!additionalSections || additionalSections.length === 0) return '';
  let html = '';
  additionalSections.forEach(section => {
    html += `<div class="section"><h2>${escapeHTML(section.title)}</h2><p>${highlightText(section.content, keywords)}</p></div>`;
  });
  return html;
}

// Template styles
const templateStyles = {
  classic: `
    :root { --accent: #2c3e50; --accent-light: #34495e; --text: #1a1a1a; --text-light: #555; --border: #2c3e50; --bg-header: #fff; }
    body { font-family: 'Georgia', 'Times New Roman', serif; }
    .header { border-bottom: 3px solid var(--accent); padding-bottom: 12px; }
    .name { font-size: 28px; letter-spacing: 2px; }
    h2 { font-size: 13px; letter-spacing: 3px; border-bottom: 1.5px solid var(--accent); padding-bottom: 4px; }
  `,
  modern: `
    :root { --accent: #2563eb; --accent-light: #3b82f6; --text: #1e293b; --text-light: #64748b; --border: #2563eb; --bg-header: #fff; }
    body { font-family: 'Calibri', 'Helvetica Neue', Arial, sans-serif; }
    .header { border-bottom: 3px solid var(--accent); padding-bottom: 14px; }
    .name { font-size: 30px; letter-spacing: 1px; }
    h2 { font-size: 12px; letter-spacing: 3px; background: #eff6ff; padding: 5px 10px; border-left: 3px solid var(--accent); }
  `,
  elegant: `
    :root { --accent: #7c3aed; --accent-light: #8b5cf6; --text: #1e1b4b; --text-light: #6b7280; --border: #7c3aed; --bg-header: #fff; }
    body { font-family: 'Garamond', 'Georgia', serif; }
    .header { border-bottom: 2px double var(--accent); padding-bottom: 14px; }
    .name { font-size: 32px; letter-spacing: 3px; font-weight: 400; }
    h2 { font-size: 13px; letter-spacing: 4px; border-bottom: 1px solid var(--accent); padding-bottom: 5px; }
  `,
  bold: `
    :root { --accent: #dc2626; --accent-light: #ef4444; --text: #1a1a1a; --text-light: #6b7280; --border: #dc2626; --bg-header: #fff; }
    body { font-family: 'Arial', 'Helvetica', sans-serif; }
    .header { border-bottom: 4px solid var(--accent); padding-bottom: 12px; }
    .name { font-size: 30px; letter-spacing: 1px; font-weight: 900; }
    h2 { font-size: 13px; letter-spacing: 2px; background: #fef2f2; padding: 5px 10px; border-left: 4px solid var(--accent); }
  `,
  minimal: `
    :root { --accent: #374151; --accent-light: #6b7280; --text: #111827; --text-light: #9ca3af; --border: #d1d5db; --bg-header: #fff; }
    body { font-family: 'Helvetica Neue', 'Arial', sans-serif; }
    .header { border-bottom: 1px solid #e5e7eb; padding-bottom: 14px; }
    .name { font-size: 26px; letter-spacing: 0.5px; font-weight: 300; }
    h2 { font-size: 11px; letter-spacing: 3px; color: var(--accent-light); border-bottom: 1px solid #e5e7eb; padding-bottom: 4px; }
  `
};

// Tone-specific section labels
const toneLabels = {
  technical: {
    summary: 'TECHNICAL SUMMARY',
    experience: 'Engineering Experience',
    education: 'Education',
    skills: 'Technical Skills & Tools',
    certifications: 'Certifications & Training',
    projects: 'Technical Projects'
  },
  business: {
    summary: 'EXECUTIVE SUMMARY',
    experience: 'Professional Experience',
    education: 'Education & Credentials',
    skills: 'Core Competencies',
    certifications: 'Certifications & Licenses',
    projects: 'Key Initiatives'
  },
  creative: {
    summary: 'PROFILE',
    experience: 'Creative Experience',
    education: 'Education',
    skills: 'Skills & Tools',
    certifications: 'Awards & Certifications',
    projects: 'Selected Work'
  },
  academic: {
    summary: 'RESEARCH INTERESTS',
    experience: 'Academic & Research Experience',
    education: 'Education',
    skills: 'Research Skills & Methodologies',
    certifications: 'Grants, Awards & Publications',
    projects: 'Research Projects'
  },
  general: {
    summary: 'PROFESSIONAL SUMMARY',
    experience: 'Professional Experience',
    education: 'Education',
    skills: 'Skills',
    certifications: 'Certifications',
    projects: 'Projects'
  }
};

function getLabels(tone) {
  return toneLabels[tone] || toneLabels.general;
}

function buildHTML(resumeData, template, keywords, tone) {
  const style = templateStyles[template] || templateStyles.classic;
  const labels = getLabels(tone);

  const body = `
    <div class="header">
      <div class="name">${escapeHTML(resumeData.name || 'Your Name')}</div>
      <div class="contact">${buildContactLine(resumeData)}</div>
    </div>

    ${resumeData.summary ? `<div class="section"><h2>${labels.summary}</h2><p class="summary-text">${highlightText(resumeData.summary, keywords)}</p></div>` : ''}
    ${buildExperienceHTML(resumeData.experience, keywords, labels.experience)}
    ${buildEducationHTML(resumeData.education, labels.education)}
    ${buildSkillsHTML(resumeData.skills, keywords, labels.skills)}
    ${buildCertsHTML(resumeData.certifications, labels.certifications)}
    ${buildProjectsHTML(resumeData.projects, keywords, labels.projects)}
    ${buildLanguagesHTML(resumeData.languages)}
    ${buildAdditionalHTML(resumeData.additionalSections, keywords)}
  `;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <style>
    ${style}

    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { color: var(--text); line-height: 1.45; padding: 40px 50px; max-width: 800px; margin: 0 auto; font-size: 11pt; }

    .header { text-align: center; margin-bottom: 16px; }
    .name { color: var(--accent); text-transform: uppercase; margin-bottom: 6px; }
    .contact { font-size: 9.5pt; color: var(--text-light); margin-top: 4px; }
    .contact a { color: var(--accent); text-decoration: none; }

    .section { margin-top: 14px; }
    h2 { text-transform: uppercase; color: var(--accent); margin-bottom: 8px; font-weight: 700; }

    .summary-text { font-size: 10.5pt; color: var(--text); line-height: 1.5; }

    .entry { margin-bottom: 12px; }
    .entry-header { display: flex; flex-wrap: wrap; align-items: baseline; gap: 4px; }
    .entry-title { font-weight: 700; font-size: 11pt; }
    .entry-company { color: var(--accent); font-size: 10.5pt; }
    .entry-date, .entry-date-inline { font-size: 9.5pt; color: var(--text-light); font-style: italic; }
    .entry-subtitle { font-style: italic; color: #444; font-size: 10.5pt; }
    .entry-details { font-size: 10pt; color: var(--text-light); }

    .entry-bullets { margin: 4px 0 0 18px; font-size: 10.5pt; }
    .entry-bullets li { margin-bottom: 3px; line-height: 1.45; }

    .skills-list { font-size: 10.5pt; line-height: 1.6; }

    ul { margin-left: 18px; }
    ul li { margin-bottom: 3px; font-size: 10.5pt; }

    .keyword-highlight { font-weight: 700; background: #fef08a; padding: 0 2px; border-radius: 2px; }

    @media print {
      body { padding: 30px 40px; }
      .keyword-highlight { background: #fef08a !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
  </style>
</head>
<body>${body}</body>
</html>`;
}

module.exports = { buildHTML };
