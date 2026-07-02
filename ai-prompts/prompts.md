# AI Usage Log

## Tools Used

Claude (chat) — used heavily for service-layer and controller implementation guidance, including reservation creation, release workflow, and expiry-job logic.

ChatGPT — used for architecture design, schema design, Docker/Kafka setup and troubleshooting, concurrency test design, validation, and documentation drafting.

GitHub Copilot — used for minor code suggestions, command assistance, and debugging support during development.

## Prompt Log

### Prompt 1
Tool: ChatGPT
Date: 2026-07-01
Prompt:
```text
Design a backend service using Node.js, Fastify, PostgreSQL, Kafka, and Docker that allows inventory reservations and prevents overselling.
```
Useful output summary:
Suggested PostgreSQL as the source of truth, Kafka for asynchronous events, Docker Compose for local infra, and a controller/route/service/database/kafka/jobs layer separation.

What I accepted:
Fastify as the API server, PostgreSQL as the persistence layer, Kafka integration, background expiration job, Docker Compose setup.

What I changed manually:
Adjusted folder structure and endpoint organization to fit the actual assignment requirements.

Why:
Needed a starting architecture that matched the assignment's tech stack and correctness priorities.

---

### Prompt 2
Tool: ChatGPT
Date: 2026-07-01
Prompt:
```text
Design PostgreSQL tables for products and reservations.
```
Useful output summary:
Recommended separate `products` and `reservations` tables with timestamps, status tracking, and inventory fields.

What I accepted:
- products: id, name, total_quantity, available_quantity, created_at, updated_at
- reservations: id, product_id, quantity, status, expires_at, created_at, updated_at

What I changed manually:
Added indexes and wrote the actual migration files.

Why:
Needed a normalized schema that supports inventory tracking and the reservation lifecycle.

---

### Prompt 3
Tool: Claude
Date: 2026-07-01
Prompt:
```text
Implement the reservation creation transaction in PostgreSQL using row-level locking to prevent overselling — begin transaction, lock the product row, validate available inventory, decrement inventory, create the reservation, and commit.
```
Useful output summary:
Generated the full transaction implementation using `SELECT ... FOR UPDATE`, including inventory validation before decrementing and rollback handling on failure.

What I accepted:
The transaction flow and row-locking implementation as the core of the reservation service.

What I changed manually:
Added custom error handling for insufficient inventory and missing product cases; verified the SQL and ESM compatibility.

Why:
This was the core correctness requirement of the assignment — inventory must never go negative under concurrent requests.

---

### Prompt 4
Tool: Claude
Date: 2026-07-01
Prompt:
```text
Generate the Fastify controller and service layer code for the reservation creation endpoint, using the transaction logic above.
```
Useful output summary:
Generated the controller/service separation and the `POST /reservations` handler wired to the transaction logic.

What I accepted:
The controller-service code structure and the endpoint implementation.

What I changed manually:
Adapted request/response formats to match the assignment's expected API shape and repository conventions.

Why:
Kept the endpoint consistent with the rest of the codebase and the assignment's API spec.

---

### Prompt 5
Tool: Claude
Date: 2026-07-01
Prompt:
```text
Implement the reservation release endpoint so that inventory is restored exactly once, and releasing the same reservation twice does not corrupt inventory.
```
Useful output summary:
Generated the release service/controller code with an idempotency guard (release only proceeds if the reservation is currently ACTIVE) and transactional inventory restoration.

What I accepted:
The idempotent release logic and the `DELETE /reservations/:reservationId` implementation.

What I changed manually:
Fixed a release-event publishing order issue and a variable scope bug found during manual testing.

Why:
The assignment explicitly requires that releasing the same reservation multiple times must not corrupt inventory.

---

### Prompt 6
Tool: Claude
Date: 2026-07-01
Prompt:
```text
Write a background job that finds expired ACTIVE reservations, marks them EXPIRED, and restores inventory correctly.
```
Useful output summary:
Generated the polling job code: find expired reservations → mark EXPIRED (conditioned on current status) → restore inventory → publish Kafka event.

What I accepted:
The polling job implementation as the expiry mechanism.

What I changed manually:
Integrated the job with the existing service and database layer, and checked the status guard to avoid double-restoring inventory if a release and expiry race.

Why:
Needed automated expiry so stale reservations stop blocking inventory without manual intervention, without introducing a second race condition alongside the create-path locking.

---

### Prompt 7
Tool: ChatGPT
Date: 2026-07-02
Prompt:
```text
Help me install Docker and configure PostgreSQL containers.
```
Useful output summary:
Provided Docker installation guidance, Compose configuration, and troubleshooting steps.

What I accepted:
Base Docker Compose configuration for PostgreSQL.

What I changed manually:
Adjusted environment variables and the migration workflow to match the project.

Why:
Needed a working local Postgres instance to run and test the service.

---

### Prompt 8
Tool: ChatGPT
Date: 2026-07-02
Prompt:
```text
Debug Kafka startup issues and integrate event publishing.
```
Useful output summary:
Helped diagnose container startup failures, KRaft configuration issues, and producer setup.

What I accepted:
General producer setup pattern for publishing `reservation.created`, `reservation.released`, and `reservation.expired` events.

What I changed manually:
Fixed the Kafka container configuration and the placement of event-publishing calls in the service code.

Why:
Kafka kept failing to start locally, and events were originally being published in the wrong place relative to the transaction commit.

---

### Prompt 9
Tool: ChatGPT
Date: 2026-07-02
Prompt:
```text
Create a concurrency test that sends multiple reservation requests simultaneously.
```
Useful output summary:
Suggested stress-testing with more concurrent requests than available inventory to verify the locking strategy.

What I accepted:
The overall test approach — fire concurrent requests against a fixed inventory count.

What I changed manually:
Ran the test against the actual seeded product (quantity 10) with 20 concurrent requests.

Result:
- Successful reservations: 10
- Failed reservations: 10
- Final available inventory: 0

Why:
This was the assignment's explicit correctness benchmark — needed to prove the locking strategy actually prevents overselling, not just assume it.

---

### Prompt 10
Tool: ChatGPT
Date: 2026-07-02
Prompt:
```text
Generate README, project explanation, and submission checklist.
```
Useful output summary:
Provided a README structure, setup instructions, architecture documentation outline, and testing guidance.

What I accepted:
Overall README structure and section headings.

What I changed manually:
Filled in all content to describe the actual implementation, explicitly marked unimplemented items (e.g. idempotency keys, Kafka consumers) as limitations, and wrote the "what I deliberately did not implement" section myself.

Why:
The documentation needed to reflect the real behavior of the service, not an idealized version of it.

---

## Verification Notes
- All Claude-generated service and controller code (reservation creation, release, and expiry job) was manually reviewed line-by-line against the transaction and locking flow before being relied on — SQL correctness, ESM compatibility, and error paths were checked by hand.
- Correctness under concurrency was verified by running 20 concurrent reservation requests against a product with 10 units of inventory (see Prompt 9) — 10 succeeded, 10 failed cleanly, and final inventory was 0.
- Kafka event publishing was verified by observing published messages during local testing.
- Claude-generated code was integrated manually into the repository structure rather than pasted in wholesale
- - Dockerized PostgreSQL and Kafka infrastructure were verified using health checks and end-to-end API testing.


---

## Reflection

AI tools were used as development assistants for architecture exploration, implementation guidance, debugging, infrastructure setup, and documentation.

Final integration, Docker configuration, database verification, Kafka troubleshooting, API testing, concurrency validation, and repository preparation were performed manually.

The most significant engineering challenge was implementing transaction-safe inventory reservation using PostgreSQL row-level locking and validating the solution under concurrent load.

The concurrency test (20 requests against inventory of 10) confirmed that the locking strategy successfully prevented overselling while maintaining inventory consistency.