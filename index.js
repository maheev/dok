const express = require('express');
const puppeteer = require('puppeteer-core');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/scrape', async (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).send({ error: 'Missing URL' });

  try {
    const browser = await puppeteer.launch({
      headless: true,
      executablePath: '/usr/bin/chromium',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2' });

    await page.waitForSelector('.product-card', { timeout: 10000 });

    const data = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('.product-card')).map(card => {
        const title = card.querySelector('.product-card__name')?.innerText.trim() || 'Нет названия';
        const price = card.querySelector('.product-price__value')?.innerText.trim() || 'Нет цены';
        const brand = card.querySelector('.product-card__brand')?.innerText.trim() || 'Нет бренда';
        const network = card.querySelector('.product-card__shop-name')?.innerText.trim() || 'Нет сети';

        return { title, price, brand, network };
      });
    });

    await browser.close();
    res.json(data);
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
