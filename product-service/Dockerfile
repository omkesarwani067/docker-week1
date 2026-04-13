FROM node:20-alpine AS base
WORKDIR /app
COPY package.json .
RUN npm install --omit=dev
COPY . .

FROM base AS production
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser
EXPOSE 3002
HEALTHCHECK --interval=15s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:3002/health || exit 1
CMD ["node", "index.js"]
