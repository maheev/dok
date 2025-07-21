const express = require('express');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 8080;

app.get('/scrape', async (req, res) => {
  try {
    const payload = {
      operationName: "search",
      variables: {
        text: "майонез",
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
          'Cookie': 'metroStoreId=43; _slid_server=687e01a5834fb3b7a00e54a6; category_menu=2; kt_buttons=1; lsq=1; plp_sorting=0; rr_placements=0; surge_amount=1; pdp_abc_20=0; aa_test=0; category_0=0; plp_level2=0; _userGUID=0:mdcvl6s6:y5iVePjLt4M12CaB0LijoyDKXmLQbGYa; metro_api_session=GFiapn6qGxtqnkoz7k691YKXMtacGs00MEIo80WO; _ym_uid=1753088433191189100; _ym_d=1753088433; metro_user_id=5e7a06c5991c9da3ff618d2642bcee40; isUnauthorizedWithDraftNull=1; _slid=687e01a5834fb3b7a00e54a6; _slfs=1753088435714; _slfreq=633ff97b9a3f3b9e90027740%3A633ffa4c90db8d5cf00d7810%3A1753095636%3B64a81e68255733f276099da5%3A680f39dba78f7b2bd90206c5%3A1753095636; _ym_isad=1; _gcl_au=1.1.1410180364.1753088436; uxs_uid=2c4a4f30-6611-11f0-ace5-e3a547bd88e5; tmr_lvid=4e08940488f2cf785a1edbaae068af08; tmr_lvidTS=1753088439545; mindboxDeviceUUID=695aca5a-9144-4261-98e6-501bdc52a7f8; directCrm-session=%7B%22deviceGuid%22%3A%22695aca5a-9144-4261-98e6-501bdc52a7f8%22%7D; _slsession=3200e2b4-a113-4ab8-96ca-32250b8703e8'
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
