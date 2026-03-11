FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

EXPOSE 3000

CMD ["sh", "-c", "npx node-pg-migrate up -m migrations && node src/server.js"]
