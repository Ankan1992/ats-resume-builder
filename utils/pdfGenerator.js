const puppeteer = require('puppeteer-core');
const { buildHTML } = require('../templates/htmlTemplates');

async function generatePDF(resumeData, template, keywords, outputPath, tone) {
  const html = buildHTML(resumeData, template, keywords, tone);

  let browser;

  if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    // Serverless environment (Vercel / Lambda)
    const chromium = require('@sparticuz/chromium');
    browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless
    });
  } else if (process.env.PUPPETEER_EXECUTABLE_PATH) {
    // Docker / system Chromium
    browser = await puppeteer.launch({
      headless: 'new',
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
    });
  } else {
    // Local development — use full puppeteer
    const puppeteerFull = require('puppeteer');
    browser = await puppeteerFull.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
    });
  }

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
