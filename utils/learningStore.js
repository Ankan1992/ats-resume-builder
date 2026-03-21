/**
 * Learning Store — Persistent storage for parser improvements learned from user corrections.
 *
 * Stores:
 *   - New company names users correct
 *   - New institution names users correct
 *   - New job titles users correct
 *   - Format patterns (how different resume layouts are structured)
 *   - User feedback messages
 *
 * Data persists in a JSON file (or /tmp on serverless).
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

// Storage path — use /tmp on Vercel, local data/ dir otherwise
const DATA_DIR = process.env.VERCEL
  ? os.tmpdir()
  : path.join(__dirname, '..', 'data');

const STORE_FILE = path.join(DATA_DIR, 'learned-entities.json');

// Default empty store
const DEFAULT_STORE = {
  version: 1,
  lastUpdated: null,
  stats: {
    totalCorrections: 0,
    totalFeedback: 0,
    resumesParsed: 0
  },
  learnedCompanies: {},    // { "company name (lowercase)": { count: N, original: "Company Name", firstSeen: date } }
  learnedInstitutions: {}, // same structure
  learnedTitles: {},       // same structure
  formatPatterns: [],      // [{ type: "bullet", pattern: "•", count: N }]
  feedbackLog: []          // [{ timestamp, message, category, context }]
};

let _store = null;

/**
 * Load the store from disk (or initialize if missing)
 */
function loadStore() {
  if (_store) return _store;

  try {
    // Ensure data directory exists
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (fs.existsSync(STORE_FILE)) {
      const raw = fs.readFileSync(STORE_FILE, 'utf-8');
      _store = JSON.parse(raw);
      // Merge with defaults in case new fields were added
      _store = { ...DEFAULT_STORE, ..._store };
    } else {
      _store = JSON.parse(JSON.stringify(DEFAULT_STORE));
      saveStore();
    }
  } catch (err) {
    console.error('Learning store load error:', err.message);
    _store = JSON.parse(JSON.stringify(DEFAULT_STORE));
  }

  return _store;
}

/**
 * Save the store to disk
 */
function saveStore() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    _store.lastUpdated = new Date().toISOString();
    fs.writeFileSync(STORE_FILE, JSON.stringify(_store, null, 2), 'utf-8');
  } catch (err) {
    console.error('Learning store save error:', err.message);
  }
}

/**
 * Record that a company name was corrected/added by a user
 */
function learnCompany(name) {
  if (!name || name.trim().length < 2) return;
  const store = loadStore();
  const key = name.trim().toLowerCase();

  if (store.learnedCompanies[key]) {
    store.learnedCompanies[key].count++;
    store.learnedCompanies[key].lastSeen = new Date().toISOString();
  } else {
    store.learnedCompanies[key] = {
      count: 1,
      original: name.trim(),
      firstSeen: new Date().toISOString(),
      lastSeen: new Date().toISOString()
    };
  }
  saveStore();
}

/**
 * Record that an institution name was corrected/added by a user
 */
function learnInstitution(name) {
  if (!name || name.trim().length < 2) return;
  const store = loadStore();
  const key = name.trim().toLowerCase();

  if (store.learnedInstitutions[key]) {
    store.learnedInstitutions[key].count++;
    store.learnedInstitutions[key].lastSeen = new Date().toISOString();
  } else {
    store.learnedInstitutions[key] = {
      count: 1,
      original: name.trim(),
      firstSeen: new Date().toISOString(),
      lastSeen: new Date().toISOString()
    };
  }
  saveStore();
}

/**
 * Record that a job title was corrected/added by a user
 */
function learnTitle(name) {
  if (!name || name.trim().length < 2) return;
  const store = loadStore();
  const key = name.trim().toLowerCase();

  if (store.learnedTitles[key]) {
    store.learnedTitles[key].count++;
    store.learnedTitles[key].lastSeen = new Date().toISOString();
  } else {
    store.learnedTitles[key] = {
      count: 1,
      original: name.trim(),
      firstSeen: new Date().toISOString(),
      lastSeen: new Date().toISOString()
    };
  }
  saveStore();
}

/**
 * Process a full correction diff: compare original parsed data with user-edited data
 * and learn from the differences.
 */
function processCorrections(originalData, correctedData) {
  const store = loadStore();
  store.stats.totalCorrections++;

  const learned = {
    companies: [],
    institutions: [],
    titles: []
  };

  // Compare experience entries
  if (correctedData.experience && Array.isArray(correctedData.experience)) {
    correctedData.experience.forEach((corrExp, i) => {
      const origExp = (originalData.experience && originalData.experience[i]) || {};

      // If user changed or added a company name
      if (corrExp.company && corrExp.company.trim() &&
          corrExp.company.trim().toLowerCase() !== (origExp.company || '').trim().toLowerCase()) {
        learnCompany(corrExp.company);
        learned.companies.push(corrExp.company.trim());
      }

      // If user changed or added a title
      if (corrExp.title && corrExp.title.trim() &&
          corrExp.title.trim().toLowerCase() !== (origExp.title || '').trim().toLowerCase()) {
        learnTitle(corrExp.title);
        learned.titles.push(corrExp.title.trim());
      }
    });

    // Also learn companies/titles from new entries the user added
    if (correctedData.experience.length > (originalData.experience || []).length) {
      for (let i = (originalData.experience || []).length; i < correctedData.experience.length; i++) {
        const exp = correctedData.experience[i];
        if (exp.company && exp.company.trim()) {
          learnCompany(exp.company);
          learned.companies.push(exp.company.trim());
        }
        if (exp.title && exp.title.trim()) {
          learnTitle(exp.title);
          learned.titles.push(exp.title.trim());
        }
      }
    }
  }

  // Compare education entries
  if (correctedData.education && Array.isArray(correctedData.education)) {
    correctedData.education.forEach((corrEdu, i) => {
      const origEdu = (originalData.education && originalData.education[i]) || {};

      // If user changed or added an institution name
      if (corrEdu.institution && corrEdu.institution.trim() &&
          corrEdu.institution.trim().toLowerCase() !== (origEdu.institution || '').trim().toLowerCase()) {
        learnInstitution(corrEdu.institution);
        learned.institutions.push(corrEdu.institution.trim());
      }
    });

    // New education entries
    if (correctedData.education.length > (originalData.education || []).length) {
      for (let i = (originalData.education || []).length; i < correctedData.education.length; i++) {
        const edu = correctedData.education[i];
        if (edu.institution && edu.institution.trim()) {
          learnInstitution(edu.institution);
          learned.institutions.push(edu.institution.trim());
        }
      }
    }
  }

  saveStore();
  return learned;
}

/**
 * Record user feedback from the chat widget
 */
function addFeedback(message, category = 'general', context = {}) {
  const store = loadStore();
  store.stats.totalFeedback++;

  store.feedbackLog.push({
    timestamp: new Date().toISOString(),
    message: message.trim(),
    category,
    context
  });

  // Keep only last 500 feedback entries to prevent unbounded growth
  if (store.feedbackLog.length > 500) {
    store.feedbackLog = store.feedbackLog.slice(-500);
  }

  saveStore();
}

/**
 * Increment resumes parsed counter
 */
function recordParsed() {
  const store = loadStore();
  store.stats.resumesParsed++;
  saveStore();
}

/**
 * Get all learned companies as a Set (lowercase) for parser use
 */
function getLearnedCompanies() {
  const store = loadStore();
  return new Set(Object.keys(store.learnedCompanies));
}

/**
 * Get all learned institutions as a Set (lowercase) for parser use
 */
function getLearnedInstitutions() {
  const store = loadStore();
  return new Set(Object.keys(store.learnedInstitutions));
}

/**
 * Get all learned titles as a Set (lowercase) for parser use
 */
function getLearnedTitles() {
  const store = loadStore();
  return new Set(Object.keys(store.learnedTitles));
}

/**
 * Get learning stats for the dashboard
 */
function getStats() {
  const store = loadStore();
  return {
    ...store.stats,
    learnedCompaniesCount: Object.keys(store.learnedCompanies).length,
    learnedInstitutionsCount: Object.keys(store.learnedInstitutions).length,
    learnedTitlesCount: Object.keys(store.learnedTitles).length,
    recentFeedback: store.feedbackLog.slice(-10),
    lastUpdated: store.lastUpdated,
    topLearnedCompanies: Object.entries(store.learnedCompanies)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 20)
      .map(([k, v]) => ({ name: v.original, count: v.count })),
    topLearnedInstitutions: Object.entries(store.learnedInstitutions)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 20)
      .map(([k, v]) => ({ name: v.original, count: v.count })),
    topLearnedTitles: Object.entries(store.learnedTitles)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 20)
      .map(([k, v]) => ({ name: v.original, count: v.count }))
  };
}

/**
 * Reset the store (for testing)
 */
function resetStore() {
  _store = JSON.parse(JSON.stringify(DEFAULT_STORE));
  saveStore();
}

module.exports = {
  loadStore,
  learnCompany,
  learnInstitution,
  learnTitle,
  processCorrections,
  addFeedback,
  recordParsed,
  getLearnedCompanies,
  getLearnedInstitutions,
  getLearnedTitles,
  getStats,
  resetStore
};
