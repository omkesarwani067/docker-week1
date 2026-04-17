FROM node:20-alpine AS base
WORKDIR /app
COPY package.json .
RUN npm install --omit=dev
COPY . .

FROM base AS production
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser
CMD ["node", "index.js"]
