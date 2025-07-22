const express = require('express');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/scrape', async (req, res) => {
  try {
    const apiUrl = 'https://online.metro-cc.ru/api/products?category_id=414595&offset=0&limit=100';

    const response = await axios.get(apiUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Accept': 'application/json'
      }
    });

    const products = response.data?.data || [];

    const cleaned = products.map(p => ({
      name: p.name,
      brand: p.manufacturer?.name || 'не указано',
      grammage: p.name.match(/\d+\s?(г|гр|мл|л)/i)?.[0] || 'нет данных',
      price: p.prices?.price || 'цена отсутствует'
    }));

    res.json(cleaned);
  } catch (err) {
    console.error('Ошибка:', err.message);
    res.status(500).json({ error: 'Не удалось получить данные', details: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});
