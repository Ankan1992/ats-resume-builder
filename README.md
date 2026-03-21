# ATS Resume Builder

A full-stack web application that generates ATS-friendly resumes in PDF and Word (DOCX) format. Upload an existing resume or build one from scratch, choose your design template and professional tone, highlight industry keywords, and download your optimized resume.

## Features

- **Upload & Parse** — Drop a PDF or DOCX resume, auto-extracts all sections
- **Start from Scratch** — Build a resume manually with guided form fields
- **Inline Editing** — Edit every field, add/remove experience, education, projects, certifications
- **5 Design Templates** — Classic, Modern, Elegant, Bold, Minimal
- **5 Professional Tones** — Technical, Business, Creative, Academic, General
- **Categorized Keyword Suggestions** — 100+ industry keywords organized by sub-category
- **Keyword Highlighting** — Selected keywords appear bold + highlighted in output
- **Tone-Specific Section Labels** — e.g., "Executive Summary" for Business, "Technical Summary" for Tech
- **PDF & DOCX Export** — Download one or both formats
- **Mobile Responsive** — Works on all devices

## Quick Start

```bash
npm install
node server.js
```

Open http://localhost:3000

## Tech Stack

- **Backend:** Node.js, Express
- **PDF Generation:** Puppeteer (headless Chrome)
- **DOCX Generation:** docx.js
- **Resume Parsing:** pdf-parse, mammoth
- **Frontend:** Vanilla HTML/CSS/JS

## Deployment

### Docker
```bash
docker build -t ats-resume-builder .
docker run -p 3000:3000 ats-resume-builder
```

### Render (Free)
Connect this repo on [render.com](https://render.com) — the `render.yaml` auto-configures everything.

## License

MIT
