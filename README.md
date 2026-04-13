# AI-Powered DevOps Observability Platform

> A self-hosted platform that monitors microservices, detects anomalies with AI, and auto-generates incident reports.

## Stack
- **3 Node.js microservices** behind an Nginx API gateway
- **Redis Streams** for real-time log ingestion
- **PostgreSQL** for persistent storage
- **OpenAI API** for anomaly detection & incident reports
- **React + Socket.io** live dashboard
- **GitHub Actions** CI/CD with Trivy security scanning

## Quick Start

```bash
git clone <your-repo>
cd observability-platform
docker compose up --build
```

## Test the Gateway

```bash
# Gateway health
curl http://localhost:8080/health

# Products
curl http://localhost:8080/products/products

# Login
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"alice","password":"secret"}'

# Create order
curl -X POST http://localhost:8080/orders/orders \
  -H "Content-Type: application/json" \
  -d '{"productId":1,"quantity":2,"userId":"alice"}'
```

## Week Progress
- [x] Week 1 — Microservices + Docker Compose + Nginx gateway
- [ ] Week 2 — Log pipeline (Redis Streams + PostgreSQL)
- [ ] Week 3 — AI anomaly detection engine
- [ ] Week 4 — React live dashboard
- [ ] Week 5 — GitHub Actions CI/CD + Trivy scanning
- [ ] Week 6 — Deploy + blog post + demo video
