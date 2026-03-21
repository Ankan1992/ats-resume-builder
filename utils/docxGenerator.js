const docx = require('docx');
const fs = require('fs');

const {
  Document, Packer, Paragraph, TextRun, HeadingLevel,
  AlignmentType, BorderStyle, TabStopPosition, TabStopType,
  ShadingType, convertInchesToTwip
} = docx;

// Template color schemes
const colorSchemes = {
  classic: { primary: '1a1a1a', accent: '2c3e50', line: '95a5a6', bg: 'f8f9fa' },
  modern: { primary: '1a1a1a', accent: '2563eb', line: '93c5fd', bg: 'eff6ff' },
  elegant: { primary: '1a1a1a', accent: '7c3aed', line: 'c4b5fd', bg: 'f5f3ff' },
  bold: { primary: '1a1a1a', accent: 'dc2626', line: 'fca5a5', bg: 'fef2f2' },
  minimal: { primary: '333333', accent: '555555', line: 'cccccc', bg: 'f5f5f5' }
};

function highlightKeywords(text, keywords) {
  if (!keywords || keywords.length === 0) return [new TextRun({ text, size: 22 })];

  const runs = [];
  const pattern = new RegExp(`(${keywords.map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'gi');
  const parts = text.split(pattern);

  parts.forEach(part => {
    const isKeyword = keywords.some(k => k.toLowerCase() === part.toLowerCase());
    runs.push(new TextRun({
      text: part,
      bold: isKeyword,
      size: 22,
      highlight: isKeyword ? 'yellow' : undefined
    }));
  });

  return runs;
}

function createSectionHeader(title, colors) {
  return new Paragraph({
    spacing: { before: 300, after: 100 },
    border: {
      bottom: { style: BorderStyle.SINGLE, size: 2, color: colors.accent }
    },
    children: [
      new TextRun({
        text: title.toUpperCase(),
        bold: true,
        size: 24,
        color: colors.accent,
        font: 'Calibri'
      })
    ]
  });
}

function buildExperienceSection(experience, keywords, colors, label) {
  const paragraphs = [createSectionHeader(label || 'Professional Experience', colors)];

  experience.forEach(exp => {
    // Title & Company
    paragraphs.push(new Paragraph({
      spacing: { before: 200, after: 40 },
      children: [
        new TextRun({ text: exp.title || '', bold: true, size: 23, color: colors.primary, font: 'Calibri' }),
        ...(exp.company ? [new TextRun({ text: `  |  ${exp.company}`, size: 22, color: colors.accent, font: 'Calibri' })] : [])
      ]
    }));

    // Duration
    if (exp.duration) {
      paragraphs.push(new Paragraph({
        spacing: { after: 60 },
        children: [
          new TextRun({ text: exp.duration, italics: true, size: 20, color: '666666', font: 'Calibri' })
        ]
      }));
    }

    // Description bullets
    if (exp.description) {
      const bullets = exp.description.split('\n').filter(b => b.trim());
      bullets.forEach(bullet => {
        const cleanBullet = bullet.replace(/^[-•▪►*]\s*/, '');
        paragraphs.push(new Paragraph({
          spacing: { after: 40 },
          indent: { left: convertInchesToTwip(0.25) },
          bullet: { level: 0 },
          children: highlightKeywords(cleanBullet, keywords)
        }));
      });
    }
  });

  return paragraphs;
}

function buildEducationSection(education, colors, label) {
  const paragraphs = [createSectionHeader(label || 'Education', colors)];

  education.forEach(edu => {
    paragraphs.push(new Paragraph({
      spacing: { before: 150, after: 40 },
      children: [
        new TextRun({ text: edu.degree || '', bold: true, size: 22, font: 'Calibri' }),
        ...(edu.year ? [new TextRun({ text: `  |  ${edu.year}`, size: 20, color: '666666', font: 'Calibri' })] : [])
      ]
    }));
    if (edu.institution) {
      paragraphs.push(new Paragraph({
        spacing: { after: 40 },
        children: [new TextRun({ text: edu.institution, italics: true, size: 21, color: '444444', font: 'Calibri' })]
      }));
    }
    if (edu.details) {
      paragraphs.push(new Paragraph({
        spacing: { after: 40 },
        indent: { left: convertInchesToTwip(0.25) },
        children: [new TextRun({ text: edu.details, size: 20, font: 'Calibri' })]
      }));
    }
  });

  return paragraphs;
}

function buildSkillsSection(skills, keywords, colors, label) {
  if (!skills || skills.length === 0) return [];

  const paragraphs = [createSectionHeader(label || 'Skills', colors)];
  const skillText = skills.join('  •  ');

  paragraphs.push(new Paragraph({
    spacing: { before: 80, after: 60 },
    children: highlightKeywords(skillText, keywords)
  }));

  return paragraphs;
}

function buildCertificationsSection(certifications, colors, label) {
  if (!certifications || certifications.length === 0) return [];

  const paragraphs = [createSectionHeader(label || 'Certifications', colors)];
  certifications.forEach(cert => {
    paragraphs.push(new Paragraph({
      spacing: { after: 40 },
      bullet: { level: 0 },
      children: [new TextRun({ text: cert, size: 22, font: 'Calibri' })]
    }));
  });

  return paragraphs;
}

function buildProjectsSection(projects, keywords, colors, label) {
  if (!projects || projects.length === 0) return [];

  const paragraphs = [createSectionHeader(label || 'Projects', colors)];
  projects.forEach(proj => {
    paragraphs.push(new Paragraph({
      spacing: { before: 150, after: 40 },
      children: [new TextRun({ text: proj.name || '', bold: true, size: 22, font: 'Calibri' })]
    }));
    if (proj.description) {
      const bullets = proj.description.split('\n').filter(b => b.trim());
      bullets.forEach(bullet => {
        const clean = bullet.replace(/^[-•▪►*]\s*/, '');
        paragraphs.push(new Paragraph({
          spacing: { after: 40 },
          indent: { left: convertInchesToTwip(0.25) },
          bullet: { level: 0 },
          children: highlightKeywords(clean, keywords)
        }));
      });
    }
  });

  return paragraphs;
}

// Tone-specific section labels
const toneLabels = {
  technical: { summary: 'Technical Summary', experience: 'Engineering Experience', education: 'Education', skills: 'Technical Skills & Tools', certifications: 'Certifications & Training', projects: 'Technical Projects' },
  business: { summary: 'Executive Summary', experience: 'Professional Experience', education: 'Education & Credentials', skills: 'Core Competencies', certifications: 'Certifications & Licenses', projects: 'Key Initiatives' },
  creative: { summary: 'Profile', experience: 'Creative Experience', education: 'Education', skills: 'Skills & Tools', certifications: 'Awards & Certifications', projects: 'Selected Work' },
  academic: { summary: 'Research Interests', experience: 'Academic & Research Experience', education: 'Education', skills: 'Research Skills & Methodologies', certifications: 'Grants, Awards & Publications', projects: 'Research Projects' },
  general: { summary: 'Professional Summary', experience: 'Professional Experience', education: 'Education', skills: 'Skills', certifications: 'Certifications', projects: 'Projects' }
};

async function generateDOCX(resumeData, template, keywords, outputPath, tone) {
  const colors = colorSchemes[template] || colorSchemes.classic;
  const labels = toneLabels[tone] || toneLabels.general;

  const sections = [];

  // Header - Name
  sections.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 80 },
    children: [
      new TextRun({
        text: resumeData.name || 'Your Name',
        bold: true,
        size: 36,
        color: colors.accent,
        font: 'Calibri'
      })
    ]
  }));

  // Contact info line
  const contactParts = [
    resumeData.email,
    resumeData.phone,
    resumeData.location,
    resumeData.linkedin,
    resumeData.website
  ].filter(Boolean);

  if (contactParts.length > 0) {
    sections.push(new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 60 },
      border: {
        bottom: { style: BorderStyle.SINGLE, size: 3, color: colors.accent }
      },
      children: [
        new TextRun({
          text: contactParts.join('  |  '),
          size: 20,
          color: '555555',
          font: 'Calibri'
        })
      ]
    }));
  }

  // Summary
  if (resumeData.summary) {
    sections.push(createSectionHeader(labels.summary, colors));
    sections.push(new Paragraph({
      spacing: { before: 60, after: 100 },
      children: highlightKeywords(resumeData.summary, keywords)
    }));
  }

  // Experience
  if (resumeData.experience && resumeData.experience.length > 0) {
    sections.push(...buildExperienceSection(resumeData.experience, keywords, colors, labels.experience));
  }

  // Education
  if (resumeData.education && resumeData.education.length > 0) {
    sections.push(...buildEducationSection(resumeData.education, colors, labels.education));
  }

  // Skills
  if (resumeData.skills && resumeData.skills.length > 0) {
    sections.push(...buildSkillsSection(resumeData.skills, keywords, colors, labels.skills));
  }

  // Certifications
  if (resumeData.certifications && resumeData.certifications.length > 0) {
    sections.push(...buildCertificationsSection(resumeData.certifications, colors, labels.certifications));
  }

  // Projects
  if (resumeData.projects && resumeData.projects.length > 0) {
    sections.push(...buildProjectsSection(resumeData.projects, keywords, colors, labels.projects));
  }

  // Languages
  if (resumeData.languages && resumeData.languages.length > 0) {
    sections.push(createSectionHeader('Languages', colors));
    sections.push(new Paragraph({
      spacing: { before: 60 },
      children: [new TextRun({ text: resumeData.languages.join('  •  '), size: 22, font: 'Calibri' })]
    }));
  }

  // Additional sections
  if (resumeData.additionalSections && resumeData.additionalSections.length > 0) {
    resumeData.additionalSections.forEach(section => {
      sections.push(createSectionHeader(section.title, colors));
      sections.push(new Paragraph({
        spacing: { before: 60 },
        children: highlightKeywords(section.content, keywords)
      }));
    });
  }

  const doc = new Document({
    styles: {
      default: {
        document: {
          run: { font: 'Calibri', size: 22 }
        }
      }
    },
    sections: [{
      properties: {
        page: {
          margin: {
            top: convertInchesToTwip(0.6),
            bottom: convertInchesToTwip(0.6),
            left: convertInchesToTwip(0.7),
            right: convertInchesToTwip(0.7)
          }
        }
      },
      children: sections
    }]
  });

  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(outputPath, buffer);
}

module.exports = { generateDOCX };
