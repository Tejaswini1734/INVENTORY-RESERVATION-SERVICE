# Inventory Reservation Service

A backend service that manages inventory reservations while preventing overselling under concurrent requests. The service is built using Fastify, PostgreSQL, Kafka, and Docker. It supports reservation creation, release, expiration handling, inventory tracking, and event publishing.

---

## Project Objective

The primary goal of this service is to guarantee inventory consistency even when multiple clients attempt to reserve the same product simultaneously.

The implementation uses:

- PostgreSQL transactions
- Row-level locking (`SELECT ... FOR UPDATE`)
- Background expiration processing
- Kafka event publishing

to ensure correctness under concurrent load.

---

# Features

- Create reservations with configurable TTL (Time To Live)
- Release reservations idempotently
- Retrieve reservation details
- Check product availability
- Prevent overselling under concurrent requests
- Automatically expire stale reservations
- Restore inventory when reservations expire
- Publish Kafka events for reservation lifecycle changes
- Dockerized local development environment

---

# Tech Stack

| Component | Technology |
|------------|------------|
| Runtime | Node.js 18+ |
| Framework | Fastify |
| Database | PostgreSQL |
| Messaging | Apache Kafka |
| Kafka Client | KafkaJS |
| Containerization | Docker Compose |
| Configuration | dotenv |

---

# Architecture Overview

```text
Client
  |
  v
Fastify API
  |
  v
Reservation Service
  |
  +----------------------+
  |                      |
  v                      v
PostgreSQL          Kafka Producer
  |
  v
Expiry Job
```

---

# Project Structure

```text
inventory-reservation-service/
│
├── src/
│   ├── app.js
│   ├── server.js
│   │
│   ├── config/
│   │
│   ├── controllers/
│   │   ├── product.controller.js
│   │   └── reservation.controller.js
│   │
│   ├── routes/
│   │   ├── health.routes.js
│   │   ├── product.routes.js
│   │   └── reservation.routes.js
│   │
│   ├── services/
│   │   └── reservation.service.js
│   │
│   ├── jobs/
│   │   └── reservationExpiry.job.js
│   │
│   ├── kafka/
│   │   ├── client.js
│   │   └── producer.js
│   │
│   ├── errors/
│   │   └── reservationErrors.js
│   │
│   └── db/
│       ├── pool.js
│       ├── seed.sql
│       └── migrations/
│           ├── 001_create_products.sql
│           └── 002_create_reservations.sql
│
├── tests/
│   └── concurrency-test.js
│
├── ai-prompts/
│   └── prompts.md
│
├── docker-compose.yml
├── package.json
├── .env.example
└── README.md
```

---

# Quick Start

## 1. Clone Repository

```bash
git clone <repository-url>
cd inventory-reservation-service
```

## 2. Install Dependencies

```bash
npm install
```

---

## 3. Start PostgreSQL and Kafka

```bash
docker compose up -d
```

Verify:

```bash
docker ps
```

Expected:

```text
inventory-postgres
inventory-kafka
```

Both containers should be in `Up` state.

---

## 4. Run Database Migrations

```bash
docker exec -i inventory-postgres psql -U postgres -d inventory < src/db/migrations/001_create_products.sql

docker exec -i inventory-postgres psql -U postgres -d inventory < src/db/migrations/002_create_reservations.sql
```

---

## 5. Seed Initial Data

```bash
docker exec -i inventory-postgres psql -U postgres -d inventory < src/db/seed.sql
```

Verify:

```sql
SELECT * FROM products;
```

Expected:

```text
product-1 | Test Product | 10 | 10
```

---

## 6. Start Application

```bash
npm run dev
```

Expected:

```text
Server listening at http://0.0.0.0:3000
```

---

# Environment Variables

Create a `.env` file from `.env.example`.

```env
PORT=3000

DB_HOST=localhost
DB_PORT=5432
DB_NAME=inventory
DB_USER=postgres
DB_PASSWORD=postgres

KAFKA_BROKERS=localhost:9092

DEFAULT_TTL_MINUTES=15
```

---

# API Endpoints

---

## Health Check

### Request

```http
GET /health
```

### Response

```json
{
  "status": "ok",
  "db": "ok",
  "kafka": "ok"
}
```

---

## Create Reservation

### Request

```http
POST /reservations
```

```json
{
  "productId": "product-1",
  "quantity": 1,
  "ttlMinutes": 15
}
```

### Response

```json
{
  "id": "50de347b-2fab-4e10-89e9-7178164d57ec",
  "product_id": "product-1",
  "quantity": 1,
  "status": "ACTIVE"
}
```

---

## Release Reservation

### Request

```http
DELETE /reservations/:reservationId
```

### Response

```json
{
  "id": "50de347b-2fab-4e10-89e9-7178164d57ec",
  "status": "RELEASED"
}
```

---

## Get Reservation

### Request

```http
GET /reservations/:reservationId
```

### Response

```json
{
  "id": "50de347b-2fab-4e10-89e9-7178164d57ec",
  "product_id": "product-1",
  "quantity": 1,
  "status": "ACTIVE"
}
```

---

## Product Availability

### Request

```http
GET /products/:productId/availability
```

### Response

```json
{
  "id": "product-1",
  "available_quantity": 10
}
```

---

# Database Design

## Products Table

Stores inventory information.

```text
id
name
total_quantity
available_quantity
created_at
updated_at
```

---

## Reservations Table

Stores reservation lifecycle information.

```text
id
product_id
quantity
status
expires_at
created_at
updated_at
```

Status values:

```text
ACTIVE
RELEASED
EXPIRED
```

---

# Reservation Flow

1. Client sends `POST /reservations`
2. Service starts a transaction
3. Product row is locked using `SELECT ... FOR UPDATE`
4. Inventory availability is validated
5. Inventory is deducted
6. Reservation row is inserted
7. Transaction commits
8. Kafka event is published

This guarantees inventory correctness under concurrent requests.

---

# Concurrency Handling

Overselling is prevented using:

```sql
SELECT *
FROM products
WHERE id = $1
FOR UPDATE
```

This row-level lock serializes reservation requests for the same product.

Only one transaction can modify inventory at a time.

---

# Concurrency Test

A dedicated concurrency test script is included.

```bash
node tests/concurrency-test.js
```

Scenario:

```text
Initial Inventory: 10

20 Concurrent Reservation Requests

Expected:
10 Success
10 Failure

Final Inventory:
0
```

Actual Result:

```text
Total Requests : 20
Successful     : 10
Failed         : 10
Final Available Quantity : 0
```

This demonstrates that overselling is successfully prevented.

---

# Reservation Expiry Job

A background job runs every minute.

Responsibilities:

- Find expired ACTIVE reservations
- Restore reserved inventory
- Mark reservation as EXPIRED
- Publish Kafka event

Implementation:

```text
ACTIVE
   |
   v
EXPIRED
   |
   v
Inventory Restored
```

---

# Kafka Integration

The service publishes events after successful state transitions.

Topics:

```text
reservation.created
reservation.released
reservation.expired
```

Example:

```json
{
  "reservationId": "50de347b-2fab-4e10-89e9-7178164d57ec",
  "status": "ACTIVE"
}
```

---

# Error Handling

Supported errors:

### Product Not Found

```json
{
  "error": "Product not found"
}
```

### Insufficient Inventory

```json
{
  "error": "Insufficient inventory"
}
```

### Reservation Not Found

```json
{
  "error": "Reservation not found"
}
```

---

# What I Deliberately Did Not Implement

To keep the scope focused on inventory consistency and concurrency correctness:

- Kafka consumers
- Dead-letter queues
- Distributed locking
- Request idempotency keys
- Authentication / Authorization
- Multi-region deployment support

---

# Future Improvements

Given more time, I would add:

- Kafka consumers and event-driven workflows
- Request idempotency
- Integration and load testing
- OpenTelemetry tracing
- Metrics and monitoring dashboards
- Dead-letter queue support
- Kubernetes deployment manifests

---

# Key Design Decisions

1. PostgreSQL was chosen as the source of truth.
2. `SELECT ... FOR UPDATE` was used instead of optimistic locking.
3. Kafka publishing occurs after successful transaction commit.
4. Reservation expiration uses a background job.
5. Inventory integrity is enforced at both application and database levels.

---

# Author

Tejaswini V  
