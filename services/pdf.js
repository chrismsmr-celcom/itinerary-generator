const puppeteer = require('puppeteer-core');
const { executablePath } = require('@puppeteer/browsers');

async function renderItineraryPdf(itinerary, mapImageUrl, agencyBranding = {}) {
  // ✅ Configuration pour Render avec puppeteer-core
  let launchOptions = {
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--disable-gpu'
    ]
  };

  // Sur Render, utiliser le Chrome système
  if (process.env.RENDER) {
    launchOptions.executablePath = '/usr/bin/google-chrome';
  } 
  // Sur GitHub Actions ou CI
  else if (process.env.CI) {
    launchOptions.executablePath = '/usr/bin/chromium-browser';
  }
  // En développement local
  else {
    try {
      launchOptions.executablePath = executablePath('chrome');
    } catch (err) {
      console.warn('⚠️ Chrome non trouvé, utilisation de puppeteer par défaut');
    }
  }

  const browser = await puppeteer.launch(launchOptions);

  try {
    const page = await browser.newPage();
    const html = buildHtml(itinerary, mapImageUrl, agencyBranding);
    await page.setContent(html, { waitUntil: 'networkidle0' });
    
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '0', bottom: '20px', left: '0', right: '0' },
      timeout: 60000
    });
    
    return pdfBuffer;
  } finally {
    await browser.close();
  }
}
