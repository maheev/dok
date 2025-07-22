const express = require('express');
const puppeteer = require('puppeteer');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/scrape', async (req, res) => {
  console.log('📥 Запрос к /scrape получен');

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    const url = 'https://online.metro-cc.ru/category/bakaleya/sousy-mayonezy-spetsii/mayonezy';

    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 });

    const data = await page.evaluate(() => {
      try {
        const products = window.__INITIAL_STATE__?.search?.products?.products || [];

        return products.map(p => ({
          name: p.name,
          brand: p.manufacturer?.name || 'неизвестно',
          grammage: p.name.match(/\d+\s?(г|гр|грамм|мл|л)/i)?.[0] || 'не указано',
          price: p.prices?.price || 'цена не указана'
        }));
      } catch (e) {
        return { error: 'Ошибка парсинга на клиенте', message: e.message };
      }
    });

    console.log('📦 Данные успешно получены');
    res.json(data);
  } catch (err) {
    console.error('❌ Ошибка при получении данных:', err.message);
    res.status(500).json({ error: 'Ошибка при получении данных с METRO', details: err.message });
  } finally {
    if (browser) await browser.close();
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Сервер запущен на порту ${PORT}`);
});
