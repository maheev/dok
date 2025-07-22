const express = require('express');
const puppeteer = require('puppeteer');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/metro', async (req, res) => {
  console.log('Запрос к METRO...');

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();

    const url = 'https://online.metro-cc.ru/category/bakaleya/sousy-mayonezy-spetsii/mayonezy';
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });

    // Ждём загрузки данных из window.__INITIAL_STATE__
    const data = await page.evaluate(() => {
      try {
        const initialState = window.__INITIAL_STATE__;
        const products = initialState?.search?.products?.products || [];

        return products.map(p => ({
          name: p.name,
          brand: p.manufacturer?.name || '',
          grammage: p.name.match(/\d+г|\d+грамм|\d+ мл|\d+л/)?.[0] || 'не указано',
          price: p.prices?.price || 'нет цены'
        }));
      } catch (e) {
        return { error: 'Ошибка при парсинге данных', details: e.message };
      }
    });

    res.json(data);
  } catch (err) {
    console.error('Ошибка:', err.message);
    res.status(500).json({ error: 'Ошибка при получении данных с METRO', details: err.message });
  } finally {
    if (browser) await browser.close();
  }
});

app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});
