const express = require('express');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/scrape', async (req, res) => {
  try {
    const response = await axios.get('https://online.metro-cc.ru/api/products?category_id=414595&offset=0&limit=50', {
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
    console.error('Ошибка при получении данных:', err.message);
    res.status(500).json({ error: 'Ошибка при получении данных', details: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Сервер запущен на порту ${PORT}`);
});
