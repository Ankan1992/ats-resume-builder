// Template Registry — All templates with metadata, tone affinity, and styles
// Each template has: id, name, description, tones (which tones it's best for),
// cssVars, bodyFont, headerStyle, sectionStyle

const templates = [
  // ===== UNIVERSAL TEMPLATES =====
  {
    id: 'classic',
    name: 'Classic',
    description: 'Traditional serif design. Timeless and ATS-proven.',
    tones: ['general', 'business', 'academic'],
    category: 'universal',
    colors: { accent: '#2c3e50', accentLight: '#34495e', text: '#1a1a1a', textLight: '#555', border: '#2c3e50' },
    css: `
      body { font-family: 'Georgia', 'Times New Roman', serif; }
      .header { border-bottom: 3px solid var(--accent); padding-bottom: 12px; }
      .name { font-size: 28px; letter-spacing: 2px; }
      h2 { font-size: 13px; letter-spacing: 3px; border-bottom: 1.5px solid var(--accent); padding-bottom: 4px; }
    `
  },
  {
    id: 'modern',
    name: 'Modern',
    description: 'Clean blue accents. Contemporary and sleek.',
    tones: ['technical', 'general', 'creative'],
    category: 'universal',
    colors: { accent: '#2563eb', accentLight: '#3b82f6', text: '#1e293b', textLight: '#64748b', border: '#2563eb' },
    css: `
      body { font-family: 'Calibri', 'Helvetica Neue', Arial, sans-serif; }
      .header { border-bottom: 3px solid var(--accent); padding-bottom: 14px; }
      .name { font-size: 30px; letter-spacing: 1px; }
      h2 { font-size: 12px; letter-spacing: 3px; background: #eff6ff; padding: 5px 10px; border-left: 3px solid var(--accent); }
    `
  },
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Ultra-clean whitespace. Let content shine.',
    tones: ['general', 'technical', 'creative'],
    category: 'universal',
    colors: { accent: '#374151', accentLight: '#6b7280', text: '#111827', textLight: '#9ca3af', border: '#d1d5db' },
    css: `
      body { font-family: 'Helvetica Neue', 'Arial', sans-serif; }
      .header { border-bottom: 1px solid #e5e7eb; padding-bottom: 14px; }
      .name { font-size: 26px; letter-spacing: 0.5px; font-weight: 300; }
      h2 { font-size: 11px; letter-spacing: 3px; color: var(--accent-light); border-bottom: 1px solid #e5e7eb; padding-bottom: 4px; }
    `
  },

  // ===== BUSINESS TEMPLATES =====
  {
    id: 'executive',
    name: 'Executive',
    description: 'Boardroom-ready. Navy tones with gold accent.',
    tones: ['business'],
    category: 'business',
    colors: { accent: '#1e3a5f', accentLight: '#2d5986', text: '#1a1a1a', textLight: '#555', border: '#1e3a5f' },
    css: `
      body { font-family: 'Garamond', 'Georgia', serif; }
      .header { border-bottom: 3px double var(--accent); padding-bottom: 16px; }
      .name { font-size: 32px; letter-spacing: 4px; font-weight: 400; color: var(--accent); }
      .contact { font-size: 10pt; letter-spacing: 1px; }
      h2 { font-size: 12px; letter-spacing: 4px; border-bottom: 2px solid var(--accent); padding-bottom: 4px; color: var(--accent); }
      .entry-title { font-size: 11.5pt; }
    `
  },
  {
    id: 'corporate',
    name: 'Corporate',
    description: 'Structured corporate layout. Clean and authoritative.',
    tones: ['business'],
    category: 'business',
    colors: { accent: '#0f172a', accentLight: '#334155', text: '#0f172a', textLight: '#64748b', border: '#0f172a' },
    css: `
      body { font-family: 'Calibri', 'Segoe UI', Arial, sans-serif; }
      .header { border-bottom: 4px solid var(--accent); padding-bottom: 12px; background: #f8fafc; margin: -40px -50px 16px; padding: 30px 50px 14px; }
      .name { font-size: 28px; letter-spacing: 1px; font-weight: 800; }
      h2 { font-size: 11px; letter-spacing: 3px; background: #f1f5f9; padding: 6px 12px; border-left: 4px solid var(--accent); margin-left: -8px; padding-left: 20px; }
    `
  },
  {
    id: 'consultant',
    name: 'Consultant',
    description: 'McKinsey-inspired. Crisp, structured, data-focused.',
    tones: ['business'],
    category: 'business',
    colors: { accent: '#003d6b', accentLight: '#005ea2', text: '#1a1a1a', textLight: '#666', border: '#003d6b' },
    css: `
      body { font-family: 'Arial', 'Helvetica', sans-serif; font-size: 10.5pt; }
      .header { border-bottom: 2px solid var(--accent); padding-bottom: 10px; }
      .name { font-size: 26px; letter-spacing: 0.5px; font-weight: 700; color: var(--accent); }
      h2 { font-size: 11px; letter-spacing: 2px; color: var(--accent); border-bottom: 1px solid #ccc; padding-bottom: 3px; text-transform: uppercase; }
      .entry-bullets li { margin-bottom: 2px; }
    `
  },
  {
    id: 'finance',
    name: 'Finance',
    description: 'Wall Street style. Conservative, dense, impactful.',
    tones: ['business'],
    category: 'business',
    colors: { accent: '#1a1a2e', accentLight: '#16213e', text: '#1a1a1a', textLight: '#555', border: '#1a1a2e' },
    css: `
      body { font-family: 'Times New Roman', 'Georgia', serif; font-size: 10.5pt; line-height: 1.35; }
      .header { border-bottom: 1px solid #000; padding-bottom: 8px; text-align: left; }
      .name { font-size: 22px; letter-spacing: 0; font-weight: 700; text-align: left; text-transform: none; }
      .contact { text-align: left; font-size: 9.5pt; }
      h2 { font-size: 11px; letter-spacing: 1px; border-bottom: 1px solid #333; padding-bottom: 2px; text-transform: uppercase; font-weight: 700; }
      .entry-bullets { font-size: 10pt; }
      .entry-bullets li { margin-bottom: 1px; }
    `
  },

  // ===== TECHNICAL TEMPLATES =====
  {
    id: 'developer',
    name: 'Developer',
    description: 'Clean monospace headers. GitHub-inspired.',
    tones: ['technical'],
    category: 'technical',
    colors: { accent: '#0d1117', accentLight: '#30363d', text: '#1a1a1a', textLight: '#656d76', border: '#0d1117' },
    css: `
      body { font-family: 'Segoe UI', 'Helvetica Neue', Arial, sans-serif; font-size: 10.5pt; }
      .header { border-bottom: 2px solid var(--accent); padding-bottom: 10px; }
      .name { font-size: 28px; font-weight: 600; letter-spacing: 0; font-family: 'SF Mono', 'Fira Code', 'Consolas', monospace; }
      .contact a { color: #0969da; }
      h2 { font-size: 12px; letter-spacing: 1px; color: var(--accent); border-bottom: 2px solid #d0d7de; padding-bottom: 4px; font-family: 'SF Mono', 'Fira Code', 'Consolas', monospace; }
      .skills-list { font-family: 'SF Mono', 'Fira Code', monospace; font-size: 9.5pt; }
    `
  },
  {
    id: 'engineer',
    name: 'Engineer',
    description: 'Precision-focused. Structured for technical depth.',
    tones: ['technical'],
    category: 'technical',
    colors: { accent: '#0ea5e9', accentLight: '#38bdf8', text: '#0c4a6e', textLight: '#64748b', border: '#0ea5e9' },
    css: `
      body { font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif; }
      .header { border-bottom: 3px solid var(--accent); padding-bottom: 12px; }
      .name { font-size: 30px; letter-spacing: 0; font-weight: 700; color: var(--accent); }
      h2 { font-size: 11px; letter-spacing: 2px; background: #f0f9ff; padding: 5px 10px; border-left: 3px solid var(--accent); color: #0c4a6e; }
      .skills-list { line-height: 1.8; }
    `
  },
  {
    id: 'data-science',
    name: 'Data Science',
    description: 'Analytics-inspired. Clean with teal accents.',
    tones: ['technical'],
    category: 'technical',
    colors: { accent: '#0d9488', accentLight: '#14b8a6', text: '#134e4a', textLight: '#5f7a76', border: '#0d9488' },
    css: `
      body { font-family: 'Calibri', 'Helvetica Neue', sans-serif; }
      .header { border-bottom: 3px solid var(--accent); padding-bottom: 14px; }
      .name { font-size: 28px; letter-spacing: 1px; color: var(--accent); }
      h2 { font-size: 12px; letter-spacing: 2px; background: #f0fdfa; padding: 5px 10px; border-left: 3px solid var(--accent); }
      .keyword-highlight { background: #ccfbf1; }
    `
  },
  {
    id: 'devops',
    name: 'DevOps',
    description: 'Terminal-style headers. Infrastructure-inspired.',
    tones: ['technical'],
    category: 'technical',
    colors: { accent: '#ea580c', accentLight: '#f97316', text: '#1a1a1a', textLight: '#78716c', border: '#ea580c' },
    css: `
      body { font-family: 'Roboto', 'Helvetica Neue', Arial, sans-serif; font-size: 10.5pt; }
      .header { border-bottom: 3px solid var(--accent); padding-bottom: 10px; }
      .name { font-size: 28px; font-weight: 800; letter-spacing: 0; }
      h2 { font-size: 11px; letter-spacing: 2px; background: #fff7ed; padding: 5px 10px; border-left: 3px solid var(--accent); }
      h2::before { content: '> '; font-family: monospace; color: var(--accent); }
    `
  },

  // ===== CREATIVE TEMPLATES =====
  {
    id: 'elegant',
    name: 'Elegant',
    description: 'Purple sophistication. Distinctive and refined.',
    tones: ['creative', 'general'],
    category: 'creative',
    colors: { accent: '#7c3aed', accentLight: '#8b5cf6', text: '#1e1b4b', textLight: '#6b7280', border: '#7c3aed' },
    css: `
      body { font-family: 'Garamond', 'Georgia', serif; }
      .header { border-bottom: 2px double var(--accent); padding-bottom: 14px; }
      .name { font-size: 32px; letter-spacing: 3px; font-weight: 400; }
      h2 { font-size: 13px; letter-spacing: 4px; border-bottom: 1px solid var(--accent); padding-bottom: 5px; }
    `
  },
  {
    id: 'bold',
    name: 'Bold',
    description: 'Red accent power. Strong and impactful.',
    tones: ['creative', 'business'],
    category: 'creative',
    colors: { accent: '#dc2626', accentLight: '#ef4444', text: '#1a1a1a', textLight: '#6b7280', border: '#dc2626' },
    css: `
      body { font-family: 'Arial', 'Helvetica', sans-serif; }
      .header { border-bottom: 4px solid var(--accent); padding-bottom: 12px; }
      .name { font-size: 30px; letter-spacing: 1px; font-weight: 900; }
      h2 { font-size: 13px; letter-spacing: 2px; background: #fef2f2; padding: 5px 10px; border-left: 4px solid var(--accent); }
    `
  },
  {
    id: 'designer',
    name: 'Designer',
    description: 'Portfolio-style. Clean grid with creative flair.',
    tones: ['creative'],
    category: 'creative',
    colors: { accent: '#e11d48', accentLight: '#fb7185', text: '#1a1a1a', textLight: '#71717a', border: '#e11d48' },
    css: `
      body { font-family: 'Futura', 'Trebuchet MS', 'Helvetica Neue', sans-serif; }
      .header { border-bottom: none; padding-bottom: 16px; text-align: left; }
      .name { font-size: 36px; letter-spacing: -0.5px; font-weight: 800; text-transform: none; color: var(--accent); text-align: left; }
      .contact { text-align: left; }
      h2 { font-size: 10px; letter-spacing: 4px; color: var(--accent); border-bottom: none; padding-bottom: 2px; border-top: 2px solid var(--accent); padding-top: 6px; margin-top: 18px; }
      .section { border-left: 2px solid #fce7f3; padding-left: 14px; }
    `
  },
  {
    id: 'magazine',
    name: 'Magazine',
    description: 'Editorial layout. Striking serif headlines.',
    tones: ['creative'],
    category: 'creative',
    colors: { accent: '#0f172a', accentLight: '#475569', text: '#0f172a', textLight: '#64748b', border: '#0f172a' },
    css: `
      body { font-family: 'Georgia', 'Times New Roman', serif; font-size: 10.5pt; }
      .header { border-bottom: 4px solid #000; padding-bottom: 10px; text-align: left; }
      .name { font-size: 40px; letter-spacing: -1px; font-weight: 900; text-transform: uppercase; line-height: 1; text-align: left; }
      .contact { text-align: left; font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 9pt; letter-spacing: 0.5px; margin-top: 6px; }
      h2 { font-size: 9px; letter-spacing: 5px; border-bottom: 1px solid #000; padding-bottom: 3px; font-family: 'Helvetica Neue', Arial, sans-serif; }
    `
  },

  // ===== ACADEMIC TEMPLATES =====
  {
    id: 'academic-cv',
    name: 'Academic CV',
    description: 'Traditional CV format. Dense, comprehensive.',
    tones: ['academic'],
    category: 'academic',
    colors: { accent: '#1e3a5f', accentLight: '#2d5986', text: '#1a1a1a', textLight: '#555', border: '#1e3a5f' },
    css: `
      body { font-family: 'Times New Roman', 'Georgia', serif; font-size: 11pt; line-height: 1.4; }
      .header { border-bottom: 2px solid var(--accent); padding-bottom: 8px; text-align: left; }
      .name { font-size: 24px; letter-spacing: 0; font-weight: 700; text-align: left; text-transform: none; }
      .contact { text-align: left; }
      h2 { font-size: 12px; letter-spacing: 1px; border-bottom: 1px solid var(--accent); padding-bottom: 3px; font-weight: 700; }
    `
  },
  {
    id: 'research',
    name: 'Research',
    description: 'Journal-inspired. Clean for publications & grants.',
    tones: ['academic'],
    category: 'academic',
    colors: { accent: '#4338ca', accentLight: '#6366f1', text: '#1e1b4b', textLight: '#6b7280', border: '#4338ca' },
    css: `
      body { font-family: 'Palatino', 'Book Antiqua', 'Georgia', serif; font-size: 10.5pt; }
      .header { border-bottom: 1.5px solid var(--accent); padding-bottom: 10px; }
      .name { font-size: 26px; letter-spacing: 1px; font-weight: 400; color: var(--accent); }
      h2 { font-size: 12px; letter-spacing: 2px; color: var(--accent); border-bottom: 0.5px solid #c7d2fe; padding-bottom: 4px; }
    `
  },
  {
    id: 'scholar',
    name: 'Scholar',
    description: 'Modern academic. Balanced formality with readability.',
    tones: ['academic'],
    category: 'academic',
    colors: { accent: '#166534', accentLight: '#15803d', text: '#14532d', textLight: '#6b7280', border: '#166534' },
    css: `
      body { font-family: 'Cambria', 'Georgia', serif; }
      .header { border-bottom: 2px solid var(--accent); padding-bottom: 12px; }
      .name { font-size: 28px; letter-spacing: 1px; color: var(--accent); }
      h2 { font-size: 12px; letter-spacing: 2px; background: #f0fdf4; padding: 4px 10px; border-left: 3px solid var(--accent); }
    `
  }
];

// Get templates sorted by relevance for a given tone
function getTemplatesForTone(tone) {
  const primary = templates.filter(t => t.tones.includes(tone));
  const others = templates.filter(t => !t.tones.includes(tone));
  return [...primary, ...others];
}

// Get template by ID
function getTemplate(id) {
  return templates.find(t => t.id === id) || templates[0];
}

// Get all unique categories
function getCategories() {
  return [...new Set(templates.map(t => t.category))];
}

module.exports = { templates, getTemplatesForTone, getTemplate, getCategories };
