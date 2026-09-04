FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:20-alpine AS runner

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY --from=builder /app/dist ./dist

# Fix start script to use dist/server.js
RUN sed -i 's/"start": "ts-node src\/server.ts"/"start": "node dist\/server.js"/' package.json

EXPOSE 3001
CMD ["npm", "start"]
