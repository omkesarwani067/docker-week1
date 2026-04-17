FROM node:20-alpine AS base
WORKDIR /app
COPY order-service/package.json ./
RUN npm install --omit=dev
COPY logger.js ./
COPY order-service/index.js ./

FROM base AS production
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser
EXPOSE 3003
CMD ["node", "index.js"]
