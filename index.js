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
    await page.waitForSelector('.product-card');

    const data = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('.product-card')).map(el => {
        const title = el.querySelector('.product-card-name')?.innerText.trim() || 'Нет названия';

        // Ищем цену в более глубокой структуре
        const priceEl = el.querySelector('.product-price__wrapper span, .product-price__wrapper div');
        const price = priceEl?.innerText.trim() || 'Нет цены';

        // Попытка определить бренд из названия
        const brand = (() => {
          const words = title.split(' ');
          const first = words[0]?.toLowerCase();
          const knownBrands = ['слобода', 'махеевъ', 'ряба', 'heinz', 'mr.', 'solpro', 'efko', 'hellmann\'s', 'печагин', 'metro'];
          const match = knownBrands.find(b => first.includes(b));
          return match ? match.charAt(0).toUpperCase() + match.slice(1) : 'Нет бренда';
        })();

        return {
          title,
          price,
          brand,
          network: 'Нет сети'
        };
      });
    });

    await browser.close();
    res.json(data);
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
