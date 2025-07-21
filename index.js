const express = require('express');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/scrape', async (req, res) => {
  try {
    const response = await axios.post('https://api.metro-cc.ru/graphql', {
      operationName: "search",
      variables: {
        query: "майонез",
        page: 1,
        limit: 30
      },
      query: `
        query search($query: String!, $page: Int!, $limit: Int!) {
          search(query: $query, page: $page, limit: $limit) {
            products {
              name
              price
              brand
              in_stock_status
            }
          }
        }
      `
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'https://online.metro-cc.ru',
        'Referer': 'https://online.metro-cc.ru/',
        'User-Agent': 'Mozilla/5.0'
      }
    });

    const data = response.data.data?.search?.products || [];

    const result = data.map(item => ({
      title: item.name || 'Нет названия',
      price: item.price ? `${item.price} ₽` : 'Нет цены',
      brand: item.brand || 'Нет бренда',
      network: 'METRO' // явно указываем, так как источник известен
    }));

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка при получении данных' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
