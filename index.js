const express = require('express');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 8080;

app.get('/scrape', async (req, res) => {
  try {
    const payload = {
      operationName: "search",
      variables: {
        text: "майонез", // или req.query.text если нужно динамически
        cityId: 24,
        page: 1,
        pageSize: 30
      },
      query: `
        query search($text: String!, $cityId: Int!, $page: Int!, $pageSize: Int!) {
          search(text: $text, cityId: $cityId, page: $page, pageSize: $pageSize) {
            products {
              name
              price
              brand
              in_stock_status
            }
          }
        }
      `
    };

    const response = await axios.post(
      'https://api.metro-cc.ru/integrations-api/graphql',
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
          'Origin': 'https://online.metro-cc.ru',
          'Referer': 'https://online.metro-cc.ru/',
          'User-Agent': 'Mozilla/5.0 (Linux; Android 6.0.1; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Mobile Safari/537.36',
          'ClientId': 'METRO_ECOM_WEB',
          // Ниже cookie можешь вставлять свой актуальный при необходимости!
          // 'Cookie': 'metroStored=...; ...'
        }
      }
    );

    const data = response.data.data?.search?.products || [];
    const result = data.map(item => ({
      title: item.name || 'Нет названия',
      price: item.price ? `${item.price} ₽` : 'Нет цены',
      brand: item.brand || 'Нет бренда',
      network: 'METRO'
    }));

    res.json(result);
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: 'Ошибка при получении данных с METRO' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
