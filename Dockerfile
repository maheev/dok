FROM node:18-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
  chromium \
  libnss3 \
  libatk1.0-0 \
  libatk-bridge2.0-0 \
  libcups2 \
  libgbm1 \
  libasound2 \
  libpangocairo-1.0-0 \
  libxss1 \
  libgtk-3-0 \
  libxshmfence1 \
  libglu1 \
  fonts-liberation \
  libappindicator3-1 \
  xdg-utils \
  ca-certificates \
  && apt-get clean && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev

COPY . .
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

EXPOSE 3000
CMD ["node", "index.js"]
