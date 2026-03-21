// ===== State =====
let resumeData = {
  name: '', email: '', phone: '', location: '', linkedin: '', website: '',
  summary: '',
  experience: [],
  education: [],
  skills: [],
  certifications: [],
  achievements: [],
  projects: [],
  languages: [],
  additionalSections: []
};
let selectedTemplate = 'classic';
let keywords = [];
let currentStep = 1;
let originalParsedData = null; // Track original parsed data for learning

// ===== Step Navigation =====
function goToStep(step) {
  if (step === 3) collectFormData();
  document.querySelectorAll('.step-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.step').forEach(s => {
    const sNum = parseInt(s.dataset.step);
    s.classList.remove('active', 'completed');
    if (sNum === step) s.classList.add('active');
    else if (sNum < step) s.classList.add('completed');
  });
  document.getElementById(`step${step}`).classList.add('active');
  currentStep = step;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ===== File Upload =====
const dropzone = document.getElementById('dropzone');
const fileInput = document.getElementById('fileInput');
const browseBtn = document.getElementById('browseBtn');

browseBtn.addEventListener('click', (e) => { e.stopPropagation(); fileInput.click(); });
dropzone.addEventListener('click', () => fileInput.click());

dropzone.addEventListener('dragover', (e) => { e.preventDefault(); dropzone.classList.add('dragover'); });
dropzone.addEventListener('dragleave', () => dropzone.classList.remove('dragover'));
dropzone.addEventListener('drop', (e) => {
  e.preventDefault();
  dropzone.classList.remove('dragover');
  const file = e.dataTransfer.files[0];
  if (file) handleFileUpload(file);
});

fileInput.addEventListener('change', (e) => {
  if (e.target.files[0]) handleFileUpload(e.target.files[0]);
});

async function handleFileUpload(file) {
  const ext = file.name.split('.').pop().toLowerCase();
  if (!['pdf', 'doc', 'docx'].includes(ext)) {
    showToast('Please upload a PDF or DOCX file', 'error');
    return;
  }
  if (file.size > 10 * 1024 * 1024) {
    showToast('File size must be under 10MB', 'error');
    return;
  }

  document.getElementById('dropzone').style.display = 'none';
  document.getElementById('uploadProgress').style.display = 'flex';

  const formData = new FormData();
  formData.append('resume', file);

  try {
    const res = await fetch('/api/upload', { method: 'POST', body: formData });
    const result = await res.json();

    if (result.success) {
      resumeData = { ...resumeData, ...result.data };
      // Store a deep copy of original parsed data for learning
      originalParsedData = JSON.parse(JSON.stringify(resumeData));
      populateForm();
      showToast('Resume parsed successfully!', 'success');
      goToStep(2);
    } else {
      showToast(result.error || 'Failed to parse resume', 'error');
    }
  } catch (err) {
    showToast('Upload failed. Please try again.', 'error');
  }

  document.getElementById('dropzone').style.display = 'flex';
  document.getElementById('uploadProgress').style.display = 'none';
}

// ===== Start From Scratch =====
document.getElementById('startScratchBtn').addEventListener('click', () => {
  resumeData = {
    name: '', email: '', phone: '', location: '', linkedin: '', website: '',
    summary: '',
    experience: [{ title: '', company: '', duration: '', description: '' }],
    education: [{ degree: '', institution: '', year: '', details: '' }],
    skills: [],
    certifications: [],
    achievements: [],
    projects: [],
    languages: [],
    additionalSections: []
  };
  populateForm();
  goToStep(2);
});

// ===== Populate Form from Data =====
function populateForm() {
  document.getElementById('field-name').value = resumeData.name || '';
  document.getElementById('field-email').value = resumeData.email || '';
  document.getElementById('field-phone').value = resumeData.phone || '';
  document.getElementById('field-location').value = resumeData.location || '';
  document.getElementById('field-linkedin').value = resumeData.linkedin || '';
  document.getElementById('field-website').value = resumeData.website || '';
  document.getElementById('field-summary').value = resumeData.summary || '';

  // LinkedIn URL
  const linkedinUrl = document.getElementById('linkedinUrl').value;
  if (linkedinUrl && !resumeData.linkedin) {
    const match = linkedinUrl.match(/linkedin\.com\/in\/([\w-]+)/);
    if (match) resumeData.linkedin = `linkedin.com/in/${match[1]}`;
    document.getElementById('field-linkedin').value = resumeData.linkedin;
  }

  // Experience
  const expContainer = document.getElementById('experience-container');
  expContainer.innerHTML = '';
  (resumeData.experience || []).forEach((exp, i) => addExperience(exp));
  if (!resumeData.experience || resumeData.experience.length === 0) addExperience();

  // Education
  const eduContainer = document.getElementById('education-container');
  eduContainer.innerHTML = '';
  (resumeData.education || []).forEach((edu, i) => addEducation(edu));
  if (!resumeData.education || resumeData.education.length === 0) addEducation();

  // Skills
  renderTags('skills-tags', resumeData.skills || [], 'skill');

  // Certifications
  const certContainer = document.getElementById('certifications-container');
  certContainer.innerHTML = '';
  (resumeData.certifications || []).forEach(c => addCertification(c));

  // Achievements
  const achContainer = document.getElementById('achievements-container');
  achContainer.innerHTML = '';
  (resumeData.achievements || []).forEach(a => addAchievement(a));

  // Projects
  const projContainer = document.getElementById('projects-container');
  projContainer.innerHTML = '';
  (resumeData.projects || []).forEach(p => addProject(p));

  // Languages
  renderTags('languages-tags', resumeData.languages || [], 'language');
}

// ===== Dynamic Entry Builders =====
function addExperience(data = {}) {
  const container = document.getElementById('experience-container');
  const index = container.children.length;
  const card = document.createElement('div');
  card.className = 'entry-card';
  card.innerHTML = `
    <button type="button" class="entry-remove" onclick="this.parentElement.remove()">✕</button>
    <div class="form-grid">
      <div class="form-group">
        <label>Job Title</label>
        <input type="text" class="input-field exp-title" value="${escapeAttr(data.title || '')}" placeholder="Software Engineer">
      </div>
      <div class="form-group">
        <label>Company</label>
        <input type="text" class="input-field exp-company" value="${escapeAttr(data.company || '')}" placeholder="Google">
      </div>
      <div class="form-group" style="grid-column: span 2">
        <label>Duration</label>
        <input type="text" class="input-field exp-duration" value="${escapeAttr(data.duration || '')}" placeholder="Jan 2022 - Present">
      </div>
      <div class="form-group" style="grid-column: span 2">
        <label>Description (one bullet point per line)</label>
        <textarea class="input-field textarea exp-desc" rows="4" placeholder="Led a team of 5 engineers to deliver...&#10;Improved system performance by 40%...&#10;Designed and implemented microservices...">${escapeAttr(data.description || '')}</textarea>
      </div>
    </div>
  `;
  container.appendChild(card);
}

function addEducation(data = {}) {
  const container = document.getElementById('education-container');
  const card = document.createElement('div');
  card.className = 'entry-card';
  card.innerHTML = `
    <button type="button" class="entry-remove" onclick="this.parentElement.remove()">✕</button>
    <div class="form-grid">
      <div class="form-group">
        <label>Degree / Qualification</label>
        <input type="text" class="input-field edu-degree" value="${escapeAttr(data.degree || '')}" placeholder="B.Tech in Computer Science">
      </div>
      <div class="form-group">
        <label>Institution</label>
        <input type="text" class="input-field edu-institution" value="${escapeAttr(data.institution || '')}" placeholder="IIT Delhi">
      </div>
      <div class="form-group">
        <label>Year</label>
        <input type="text" class="input-field edu-year" value="${escapeAttr(data.year || '')}" placeholder="2022">
      </div>
      <div class="form-group">
        <label>Details (GPA, Honors, etc.)</label>
        <input type="text" class="input-field edu-details" value="${escapeAttr(data.details || '')}" placeholder="GPA: 3.8/4.0, Dean's List">
      </div>
    </div>
  `;
  container.appendChild(card);
}

function addCertification(text = '') {
  const container = document.getElementById('certifications-container');
  const card = document.createElement('div');
  card.className = 'entry-card';
  card.style.padding = '10px 16px';
  card.innerHTML = `
    <div style="display:flex;align-items:center;gap:10px">
      <input type="text" class="input-field cert-text" value="${escapeAttr(text)}" placeholder="AWS Certified Solutions Architect" style="flex:1">
      <button type="button" class="entry-remove" style="position:static" onclick="this.parentElement.parentElement.remove()">✕</button>
    </div>
  `;
  container.appendChild(card);
}

function addAchievement(text = '') {
  const container = document.getElementById('achievements-container');
  const card = document.createElement('div');
  card.className = 'entry-card';
  card.style.padding = '10px 16px';
  card.innerHTML = `
    <div style="display:flex;align-items:center;gap:10px">
      <input type="text" class="input-field achievement-text" value="${escapeAttr(text)}" placeholder="Dean's List, Best Paper Award, etc." style="flex:1">
      <button type="button" class="entry-remove" style="position:static" onclick="this.parentElement.parentElement.remove()">✕</button>
    </div>
  `;
  container.appendChild(card);
}

function addProject(data = {}) {
  const container = document.getElementById('projects-container');
  const card = document.createElement('div');
  card.className = 'entry-card';
  card.innerHTML = `
    <button type="button" class="entry-remove" onclick="this.parentElement.remove()">✕</button>
    <div class="form-grid">
      <div class="form-group" style="grid-column: span 2">
        <label>Project Name</label>
        <input type="text" class="input-field proj-name" value="${escapeAttr(data.name || '')}" placeholder="E-commerce Platform">
      </div>
      <div class="form-group" style="grid-column: span 2">
        <label>Description (one bullet per line)</label>
        <textarea class="input-field textarea proj-desc" rows="3" placeholder="Built a full-stack e-commerce platform using React and Node.js...">${escapeAttr(data.description || '')}</textarea>
      </div>
    </div>
  `;
  container.appendChild(card);
}

// ===== Tags (Skills, Languages, Keywords) =====
function renderTags(containerId, items, type) {
  const container = document.getElementById(containerId);
  container.innerHTML = '';
  items.forEach((item, i) => {
    const tag = document.createElement('span');
    tag.className = 'tag';
    tag.innerHTML = `${escapeHTML(item)} <span class="tag-remove" data-type="${type}" data-index="${i}">✕</span>`;
    container.appendChild(tag);
  });
}

// Tag input handlers
function setupTagInput(inputId, containerId, type) {
  const input = document.getElementById(inputId);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const value = input.value.trim();
      if (!value) return;

      if (type === 'skill') {
        if (!resumeData.skills.includes(value)) {
          resumeData.skills.push(value);
          renderTags(containerId, resumeData.skills, type);
        }
      } else if (type === 'language') {
        if (!resumeData.languages.includes(value)) {
          resumeData.languages.push(value);
          renderTags(containerId, resumeData.languages, type);
        }
      } else if (type === 'keyword') {
        if (!keywords.includes(value)) {
          keywords.push(value);
          renderTags(containerId, keywords, type);
        }
      }
      input.value = '';
    }
  });
}

// Remove tag
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('tag-remove')) {
    const type = e.target.dataset.type;
    const index = parseInt(e.target.dataset.index);
    if (type === 'skill') {
      resumeData.skills.splice(index, 1);
      renderTags('skills-tags', resumeData.skills, 'skill');
    } else if (type === 'language') {
      resumeData.languages.splice(index, 1);
      renderTags('languages-tags', resumeData.languages, 'language');
    } else if (type === 'keyword') {
      keywords.splice(index, 1);
      renderTags('keywords-tags', keywords, 'keyword');
    }
  }
});

setupTagInput('skill-input', 'skills-tags', 'skill');
setupTagInput('language-input', 'languages-tags', 'language');
setupTagInput('keyword-input', 'keywords-tags', 'keyword');

// ===== Tone-based Keyword Suggestions (with sub-categories) =====
const toneSuggestions = {
  technical: {
    'Engineering': ['Python', 'JavaScript', 'TypeScript', 'Java', 'C++', 'Go', 'Rust', 'React', 'Node.js', 'Angular', 'Vue.js', 'Django', 'Spring Boot', 'REST API', 'GraphQL', 'Microservices', 'System Design', 'Full Stack', 'Backend', 'Frontend'],
    'Cloud & DevOps': ['AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'CI/CD', 'Terraform', 'Jenkins', 'GitHub Actions', 'DevOps', 'Cloud Computing', 'Serverless', 'Infrastructure as Code', 'SRE', 'Linux'],
    'Data & AI': ['Machine Learning', 'Deep Learning', 'Data Pipeline', 'SQL', 'NoSQL', 'MongoDB', 'PostgreSQL', 'Data Engineering', 'ETL', 'TensorFlow', 'PyTorch', 'NLP', 'Computer Vision', 'LLM', 'Big Data', 'Apache Spark', 'Data Visualization'],
    'Practices': ['Agile', 'Scrum', 'Kanban', 'TDD', 'Code Review', 'Performance Optimization', 'Scalability', 'Git', 'Architecture', 'Design Patterns', 'Technical Documentation', 'Mentoring']
  },
  business: {
    'Strategy & Leadership': ['Strategic Planning', 'Leadership', 'Executive Leadership', 'Vision & Strategy', 'Change Management', 'Organizational Development', 'Board Presentations', 'C-Suite Engagement', 'Thought Leadership', 'Transformation'],
    'Product & Program': ['Product Management', 'Product Strategy', 'Program Management', 'Product Roadmap', 'Product Lifecycle', 'Backlog Prioritization', 'User Stories', 'Go-to-Market', 'MVP', 'Feature Specification', 'Sprint Planning', 'Requirements Gathering', 'Stakeholder Management'],
    'Finance & Operations': ['P&L Management', 'Revenue Growth', 'Budget Management', 'Cost Optimization', 'Financial Modeling', 'ROI', 'EBITDA', 'Due Diligence', 'M&A', 'Forecasting', 'Operational Excellence', 'Vendor Management', 'Supply Chain'],
    'Growth & Analytics': ['Business Development', 'Market Analysis', 'Competitive Analysis', 'KPI', 'OKR', 'Data-driven Decision Making', 'Client Relations', 'Account Management', 'Partnership Development', 'Revenue Operations', 'GTM Strategy', 'Customer Success'],
    'People & Process': ['Cross-functional Teams', 'Team Building', 'Hiring & Talent', 'Performance Management', 'Process Improvement', 'Six Sigma', 'Lean', 'Negotiation', 'Risk Management', 'Compliance', 'Governance', 'Conflict Resolution']
  },
  creative: {
    'Design': ['UX/UI Design', 'User Research', 'Wireframing', 'Prototyping', 'Figma', 'Sketch', 'Adobe Creative Suite', 'Design Systems', 'Typography', 'Art Direction', 'Visual Identity', 'Motion Design', 'Responsive Design'],
    'Marketing & Content': ['Brand Strategy', 'Content Marketing', 'Content Strategy', 'Copywriting', 'Storytelling', 'Social Media', 'Campaign Management', 'Email Marketing', 'Influencer Marketing', 'PR', 'Editorial', 'Video Production'],
    'Growth & Data': ['SEO', 'SEM', 'A/B Testing', 'Conversion Rate Optimization', 'Analytics', 'Google Analytics', 'Engagement', 'Audience Growth', 'Marketing Automation', 'Funnel Optimization', 'Attribution']
  },
  academic: {
    'Research': ['Research', 'Publications', 'Peer-reviewed', 'Methodology', 'Data Analysis', 'Grant Writing', 'Literature Review', 'Hypothesis Testing', 'IRB Approval', 'Research Design'],
    'Teaching & Leadership': ['Curriculum Development', 'Teaching', 'Mentoring', 'Academic Leadership', 'Course Design', 'Student Advising', 'Conference Presentations', 'Keynote Speaker'],
    'Tools & Methods': ['Quantitative', 'Qualitative', 'Mixed Methods', 'Statistical Analysis', 'SPSS', 'R Programming', 'Stata', 'Lab Management', 'Clinical Trials', 'Systematic Review']
  },
  general: {
    'Core Skills': ['Problem Solving', 'Communication', 'Teamwork', 'Time Management', 'Analytical', 'Detail-oriented', 'Self-motivated', 'Adaptable', 'Project Management', 'Results-driven', 'Collaboration', 'Organization', 'Critical Thinking', 'Decision Making', 'Initiative', 'Multitasking', 'Presentation Skills']
  }
};

let activeKeywordCategory = null;

function updateKeywordSuggestions() {
  const tone = document.querySelector('input[name="tone"]:checked')?.value || 'general';
  const container = document.getElementById('keywordSuggestions');
  const categories = toneSuggestions[tone] || toneSuggestions.general;
  const catNames = Object.keys(categories);

  // If no active category or it doesn't exist in current tone, default to first
  if (!activeKeywordCategory || !categories[activeKeywordCategory]) {
    activeKeywordCategory = catNames[0];
  }

  let html = '';

  // Category tabs
  html += '<div class="keyword-categories">';
  catNames.forEach(cat => {
    const isActive = cat === activeKeywordCategory;
    html += `<span class="keyword-cat-tab${isActive ? ' active' : ''}" data-cat="${cat}">${cat}</span>`;
  });
  html += '</div>';

  // Keywords for active category
  html += '<div class="keyword-pills">';
  const kws = categories[activeKeywordCategory] || [];
  kws.forEach(kw => {
    const isAdded = keywords.includes(kw);
    html += `<span class="keyword-suggestion${isAdded ? ' added' : ''}" data-kw="${escapeAttr(kw)}">${escapeHTML(kw)}</span>`;
  });
  html += '</div>';

  container.innerHTML = html;

  // Bind click events for category tabs
  container.querySelectorAll('.keyword-cat-tab').forEach(tab => {
    tab.onclick = () => {
      activeKeywordCategory = tab.dataset.cat;
      updateKeywordSuggestions();
    };
  });

  // Bind click events for keyword pills
  container.querySelectorAll('.keyword-suggestion:not(.added)').forEach(pill => {
    pill.onclick = () => {
      const kw = pill.dataset.kw;
      if (!keywords.includes(kw)) {
        keywords.push(kw);
        renderTags('keywords-tags', keywords, 'keyword');
        updateKeywordSuggestions();
      }
    };
  });
}

// Listen for tone changes
document.querySelectorAll('input[name="tone"]').forEach(radio => {
  radio.addEventListener('change', () => {
    updateKeywordSuggestions();
    loadTemplates();
  });
});

// Initialize suggestions and templates when step 3 is shown
const origGoToStep = goToStep;
goToStep = function(step) {
  origGoToStep(step);
  if (step === 3) {
    updateKeywordSuggestions();
    loadTemplates();
  }
};

// ===== Collect Form Data =====
function collectFormData() {
  resumeData.name = document.getElementById('field-name').value;
  resumeData.email = document.getElementById('field-email').value;
  resumeData.phone = document.getElementById('field-phone').value;
  resumeData.location = document.getElementById('field-location').value;
  resumeData.linkedin = document.getElementById('field-linkedin').value;
  resumeData.website = document.getElementById('field-website').value;
  resumeData.summary = document.getElementById('field-summary').value;

  // Experience
  resumeData.experience = [];
  document.querySelectorAll('#experience-container .entry-card').forEach(card => {
    resumeData.experience.push({
      title: card.querySelector('.exp-title').value,
      company: card.querySelector('.exp-company').value,
      duration: card.querySelector('.exp-duration').value,
      description: card.querySelector('.exp-desc').value
    });
  });

  // Education
  resumeData.education = [];
  document.querySelectorAll('#education-container .entry-card').forEach(card => {
    resumeData.education.push({
      degree: card.querySelector('.edu-degree').value,
      institution: card.querySelector('.edu-institution').value,
      year: card.querySelector('.edu-year').value,
      details: card.querySelector('.edu-details').value
    });
  });

  // Certifications
  resumeData.certifications = [];
  document.querySelectorAll('#certifications-container .cert-text').forEach(input => {
    if (input.value.trim()) resumeData.certifications.push(input.value.trim());
  });

  // Achievements
  resumeData.achievements = [];
  document.querySelectorAll('#achievements-container .achievement-text').forEach(input => {
    if (input.value.trim()) resumeData.achievements.push(input.value.trim());
  });

  // Projects
  resumeData.projects = [];
  document.querySelectorAll('#projects-container .entry-card').forEach(card => {
    resumeData.projects.push({
      name: card.querySelector('.proj-name').value,
      description: card.querySelector('.proj-desc').value
    });
  });
}

// ===== Template Selection =====
let allTemplates = [];
let currentFilter = 'recommended';

function selectTemplate(template) {
  selectedTemplate = template;
  document.querySelectorAll('.template-card').forEach(card => {
    card.classList.toggle('selected', card.dataset.template === template);
  });
}

async function loadTemplates() {
  const tone = document.querySelector('input[name="tone"]:checked')?.value || 'general';
  try {
    const res = await fetch(`/api/templates?tone=${tone}`);
    const data = await res.json();
    allTemplates = data.templates || [];
    filterTemplates(currentFilter);
  } catch (err) {
    console.error('Failed to load templates:', err);
  }
}

function filterTemplates(filter) {
  currentFilter = filter;
  // Update filter buttons
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.filter === filter);
  });

  const tone = document.querySelector('input[name="tone"]:checked')?.value || 'general';
  let filtered;

  if (filter === 'recommended') {
    // Show templates that match the selected tone first (they come pre-sorted from API)
    filtered = allTemplates.filter(t => t.tones && t.tones.includes(tone));
    if (filtered.length === 0) filtered = allTemplates.slice(0, 6);
  } else if (filter === 'all') {
    filtered = allTemplates;
  } else {
    // Filter by category
    filtered = allTemplates.filter(t => t.category === filter || (t.tones && t.tones.includes(filter)));
  }

  renderTemplateGrid(filtered);
}

function renderTemplateGrid(templates) {
  const grid = document.getElementById('templatesGrid');
  if (!templates || templates.length === 0) {
    grid.innerHTML = '<p style="text-align:center;color:var(--gray-500);grid-column:1/-1;padding:24px;">No templates found for this filter.</p>';
    return;
  }

  grid.innerHTML = templates.map(t => {
    const accent = t.accentColor || '#2c3e50';
    const isSelected = selectedTemplate === t.id;
    return `
      <div class="template-card${isSelected ? ' selected' : ''}" data-template="${t.id}" onclick="selectTemplate('${t.id}')">
        <div class="template-check">✓</div>
        <div class="template-preview">
          <div class="tp-header" style="background:${accent}"></div>
          <div class="tp-section" style="background:${accent}"></div>
          <div class="tp-line w90"></div>
          <div class="tp-line w85"></div>
          <div class="tp-line w75"></div>
          <div class="tp-section" style="background:${accent}"></div>
          <div class="tp-line w80"></div>
          <div class="tp-line w90"></div>
          <div class="tp-line w70"></div>
        </div>
        <div class="template-info">
          <h4>${escapeHTML(t.name)}</h4>
          <p>${escapeHTML(t.description || '')}</p>
          ${t.tones ? `<div class="template-tones">${t.tones.map(tn => `<span class="template-tone-badge">${tn}</span>`).join('')}</div>` : ''}
        </div>
      </div>
    `;
  }).join('');
}

// ===== Generate Resume =====
async function generateResume() {
  collectFormData();

  const format = document.querySelector('input[name="format"]:checked').value;
  const tone = document.querySelector('input[name="tone"]:checked')?.value || 'general';

  // Validate minimum data
  if (!resumeData.name) {
    showToast('Please enter your name', 'error');
    return;
  }

  // Auto-submit corrections to the learning system (non-blocking)
  if (originalParsedData) {
    submitCorrections(originalParsedData, resumeData);
  }

  const btnText = document.querySelector('.btn-text');
  const btnLoading = document.querySelector('.btn-loading');
  btnText.style.display = 'none';
  btnLoading.style.display = 'inline-flex';

  try {
    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        resumeData,
        template: selectedTemplate,
        format,
        keywords,
        tone
      })
    });

    const result = await res.json();

    if (result.success) {
      showDownloadCards(result.files);
      goToStep(4);
      showToast('Resume generated successfully!', 'success');
    } else {
      showToast(result.error || 'Generation failed', 'error');
    }
  } catch (err) {
    showToast('Something went wrong. Please try again.', 'error');
  }

  btnText.style.display = 'inline';
  btnLoading.style.display = 'none';
}

function showDownloadCards(files) {
  const container = document.getElementById('downloadCards');
  container.innerHTML = '';

  if (files.pdf) {
    container.innerHTML += `
      <a href="${files.pdf}" class="download-card" download>
        <span class="dl-icon">📕</span>
        <span class="dl-label">PDF Resume</span>
        <span class="dl-hint">ATS-optimized, print-ready</span>
        <span class="btn btn-primary">Download PDF</span>
      </a>
    `;
  }

  if (files.docx) {
    container.innerHTML += `
      <a href="${files.docx}" class="download-card" download>
        <span class="dl-icon">📘</span>
        <span class="dl-label">Word Resume</span>
        <span class="dl-hint">Editable .docx format</span>
        <span class="btn btn-primary">Download DOCX</span>
      </a>
    `;
  }
}

// ===== Toast =====
function showToast(message, type = '') {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = `toast show ${type}`;
  setTimeout(() => { toast.className = 'toast'; }, 3500);
}

// ===== Utilities =====
function escapeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function escapeAttr(str) {
  return (str || '').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// ===== Step click navigation =====
document.querySelectorAll('.step').forEach(step => {
  step.addEventListener('click', () => {
    const num = parseInt(step.dataset.step);
    if (num <= currentStep || step.classList.contains('completed')) {
      goToStep(num);
    }
  });
});

// ===== Self-Improving Parser: Corrections & Feedback =====

/**
 * Submit corrections to the learning system.
 * Compares original parsed data with user-edited data and sends diffs.
 */
async function submitCorrections(original, corrected) {
  try {
    await fetch('/api/feedback/corrections', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ originalData: original, correctedData: corrected })
    });
    console.log('[Learning] Corrections submitted successfully');
  } catch (err) {
    console.log('[Learning] Failed to submit corrections:', err.message);
  }
}

/**
 * Submit a feedback message from the chat widget
 */
async function submitFeedback(message, category = 'general') {
  if (!message || !message.trim()) return;
  try {
    const res = await fetch('/api/feedback/message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        category,
        context: {
          currentStep,
          hasResume: !!resumeData.name,
          experienceCount: (resumeData.experience || []).length,
          educationCount: (resumeData.education || []).length
        }
      })
    });
    const result = await res.json();
    return result;
  } catch (err) {
    console.error('[Feedback] Failed to submit:', err.message);
    return { success: false };
  }
}

// ===== Chat / Feedback Widget =====
function initFeedbackWidget() {
  // Create the floating chat button and panel
  const widget = document.createElement('div');
  widget.id = 'feedback-widget';
  widget.innerHTML = `
    <button class="feedback-fab" id="feedbackFab" title="Help us improve!">
      <span class="fab-icon">💬</span>
      <span class="fab-pulse"></span>
    </button>
    <div class="feedback-panel" id="feedbackPanel">
      <div class="feedback-header">
        <h4>Help Improve the Parser</h4>
        <button class="feedback-close" id="feedbackClose">&times;</button>
      </div>
      <div class="feedback-body">
        <div class="feedback-messages" id="feedbackMessages">
          <div class="feedback-msg bot">
            <span class="msg-avatar">🤖</span>
            <div class="msg-content">
              <p>Hi! I'm always learning. You can:</p>
              <ul>
                <li>Report parsing issues</li>
                <li>Suggest new company/institution names</li>
                <li>Tell me about new resume formats</li>
              </ul>
              <p>Your edits in Step 2 also help me learn automatically!</p>
            </div>
          </div>
        </div>
        <div class="feedback-quick-actions">
          <button class="quick-action-btn" data-cat="parsing" data-msg="The parser didn't recognize my company name correctly">Company not recognized</button>
          <button class="quick-action-btn" data-cat="parsing" data-msg="The parser didn't recognize my job title correctly">Title not recognized</button>
          <button class="quick-action-btn" data-cat="parsing" data-msg="The parser didn't recognize my institution name correctly">Institution not recognized</button>
          <button class="quick-action-btn" data-cat="format" data-msg="My resume format was not parsed correctly">Format issue</button>
        </div>
        <div class="feedback-input-area">
          <input type="text" id="feedbackInput" class="feedback-input" placeholder="Describe the issue or suggestion...">
          <select id="feedbackCategory" class="feedback-select">
            <option value="general">General</option>
            <option value="parsing">Parsing Issue</option>
            <option value="format">Format Issue</option>
            <option value="feature">Feature Request</option>
            <option value="bug">Bug Report</option>
          </select>
          <button class="feedback-send" id="feedbackSend">Send</button>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(widget);

  // Toggle panel
  const fab = document.getElementById('feedbackFab');
  const panel = document.getElementById('feedbackPanel');
  const closeBtn = document.getElementById('feedbackClose');

  fab.addEventListener('click', () => {
    panel.classList.toggle('open');
    fab.classList.toggle('active');
  });
  closeBtn.addEventListener('click', () => {
    panel.classList.remove('open');
    fab.classList.remove('active');
  });

  // Send feedback
  const sendBtn = document.getElementById('feedbackSend');
  const input = document.getElementById('feedbackInput');
  const catSelect = document.getElementById('feedbackCategory');
  const messagesEl = document.getElementById('feedbackMessages');

  async function sendFeedbackMessage(message, category) {
    if (!message || !message.trim()) return;

    // Add user message to chat
    const userMsg = document.createElement('div');
    userMsg.className = 'feedback-msg user';
    userMsg.innerHTML = `<div class="msg-content"><p>${escapeHTML(message)}</p><span class="msg-cat">${category}</span></div>`;
    messagesEl.appendChild(userMsg);
    messagesEl.scrollTop = messagesEl.scrollHeight;

    // Submit to server
    const result = await submitFeedback(message, category);

    // Add bot response
    const botMsg = document.createElement('div');
    botMsg.className = 'feedback-msg bot';
    botMsg.innerHTML = `<span class="msg-avatar">🤖</span><div class="msg-content"><p>${result.success ? 'Thank you! Your feedback has been recorded and will help improve the parser.' : 'Sorry, there was an issue recording your feedback. Please try again.'}</p></div>`;
    messagesEl.appendChild(botMsg);
    messagesEl.scrollTop = messagesEl.scrollHeight;

    input.value = '';
  }

  sendBtn.addEventListener('click', () => {
    sendFeedbackMessage(input.value, catSelect.value);
  });

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      sendFeedbackMessage(input.value, catSelect.value);
    }
  });

  // Quick action buttons
  document.querySelectorAll('.quick-action-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      sendFeedbackMessage(btn.dataset.msg, btn.dataset.cat);
    });
  });
}

// Initialize the feedback widget
initFeedbackWidget();
