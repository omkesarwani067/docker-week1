FROM node:20-alpine AS base
WORKDIR /app
COPY auth-service/package.json ./
RUN npm install --omit=dev
COPY logger.js ./
COPY auth-service/index.js ./

FROM base AS production
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser
EXPOSE 3001
CMD ["node", "index.js"]
