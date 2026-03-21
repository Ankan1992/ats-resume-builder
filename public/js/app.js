// ===== State =====
let resumeData = {
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
let selectedTemplate = 'classic';
let keywords = [];
let currentStep = 1;

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

// ===== Tone-based Keyword Suggestions =====
const toneSuggestions = {
  technical: ['Python', 'JavaScript', 'AWS', 'Docker', 'Kubernetes', 'CI/CD', 'REST API', 'Microservices', 'Machine Learning', 'System Design', 'Agile', 'Scrum', 'SQL', 'NoSQL', 'DevOps', 'Cloud Computing', 'Data Pipeline', 'Performance Optimization', 'Scalability', 'Git'],
  business: ['Revenue Growth', 'P&L Management', 'Strategic Planning', 'Stakeholder Management', 'Market Analysis', 'ROI', 'Cross-functional', 'Leadership', 'Budget Management', 'KPI', 'Business Development', 'Client Relations', 'Process Improvement', 'Change Management', 'Negotiation', 'Risk Management', 'Forecasting', 'Go-to-Market', 'OKR', 'Due Diligence'],
  creative: ['Brand Strategy', 'Content Marketing', 'UX/UI Design', 'Campaign Management', 'Storytelling', 'Social Media', 'Adobe Creative Suite', 'A/B Testing', 'SEO', 'Conversion Rate', 'User Research', 'Wireframing', 'Figma', 'Typography', 'Art Direction', 'Copywriting', 'Analytics', 'Engagement', 'Visual Identity', 'Design Systems'],
  academic: ['Research', 'Publications', 'Peer-reviewed', 'Methodology', 'Data Analysis', 'Grant Writing', 'Curriculum Development', 'Teaching', 'Thesis', 'Literature Review', 'Quantitative', 'Qualitative', 'Statistical Analysis', 'Lab Management', 'Conference Presentations', 'Citation', 'Hypothesis Testing', 'IRB Approval', 'SPSS', 'R Programming'],
  general: ['Problem Solving', 'Communication', 'Teamwork', 'Time Management', 'Analytical', 'Detail-oriented', 'Self-motivated', 'Adaptable', 'Project Management', 'Results-driven', 'Collaboration', 'Organization', 'Critical Thinking', 'Decision Making', 'Initiative']
};

function updateKeywordSuggestions() {
  const tone = document.querySelector('input[name="tone"]:checked')?.value || 'general';
  const container = document.getElementById('keywordSuggestions');
  const suggestions = toneSuggestions[tone] || toneSuggestions.general;

  container.innerHTML = '<span style="font-size:12px;color:#6b7280;margin-right:4px">Suggested:</span>';
  suggestions.forEach(kw => {
    const isAdded = keywords.includes(kw);
    const pill = document.createElement('span');
    pill.className = `keyword-suggestion${isAdded ? ' added' : ''}`;
    pill.textContent = kw;
    pill.onclick = () => {
      if (!keywords.includes(kw)) {
        keywords.push(kw);
        renderTags('keywords-tags', keywords, 'keyword');
        updateKeywordSuggestions();
      }
    };
    container.appendChild(pill);
  });
}

// Listen for tone changes
document.querySelectorAll('input[name="tone"]').forEach(radio => {
  radio.addEventListener('change', updateKeywordSuggestions);
});

// Initialize suggestions when step 3 is shown
const origGoToStep = goToStep;
goToStep = function(step) {
  origGoToStep(step);
  if (step === 3) updateKeywordSuggestions();
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
function selectTemplate(template) {
  selectedTemplate = template;
  document.querySelectorAll('.template-card').forEach(card => {
    card.classList.toggle('selected', card.dataset.template === template);
  });
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
