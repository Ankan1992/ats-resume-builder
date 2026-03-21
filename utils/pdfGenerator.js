const puppeteer = require('puppeteer');
const { buildHTML } = require('../templates/htmlTemplates');

async function generatePDF(resumeData, template, keywords, outputPath, tone) {
  const html = buildHTML(resumeData, template, keywords, tone);

  const launchOptions = {
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
  };

  // Use system Chromium if set (Docker/Render deployment)
  if (process.env.PUPPETEER_EXECUTABLE_PATH) {
    launchOptions.executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
  }

  const browser = await puppeteer.launch(launchOptions);

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    await page.pdf({
      path: outputPath,
      format: 'A4',
      printBackground: true,
      margin: { top: '0', right: '0', bottom: '0', left: '0' }
    });
  } finally {
    await browser.close();
  }
}

module.exports = { generatePDF };
