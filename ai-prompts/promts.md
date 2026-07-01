# AI Usage Log

## Tools Used

- Claude
- ChatGPT
- GitHub Copilot

---

## Prompt Log

### Prompt 1

Tool: Claude

Date: 2026-07-01

Prompt:

```text
Design an Inventory Reservation Service using Node.js, Fastify, PostgreSQL, Kafka and Docker Compose.
Focus on concurrency correctness.
```

Useful output summary:

- Proposed products and reservations schema
- Recommended PostgreSQL transactions
- Suggested row-level locking strategy

What I accepted:

- Products table
- Reservations table
- Reservation status values
- Row locking approach

What I changed manually:

- Reviewed schema and constraints
- Simplified some recommendations to fit assignment scope

Why:

- Needed a solution that is correct under concurrent requests.

---

### Prompt 2

Tool: Claude

Date: 2026-07-01

Prompt:

```text
Generate PostgreSQL migration files for products and reservations.
```

Useful output summary:

- Products migration
- Reservations migration
- Constraints and indexes

What I accepted:

- Inventory constraints
- Status validation
- Expiry index

What I changed manually:

- Reviewed timestamp and UUID decisions

Why:

- To ensure data integrity at database level.

---

### Prompt 3

Tool: Claude

Date: 2026-07-01

Prompt:

```text
Implement reservation creation transaction using PostgreSQL row locking.
```

Useful output summary:

- BEGIN transaction
- SELECT ... FOR UPDATE
- Inventory deduction
- Reservation creation
- Rollback handling

What I accepted:

- Row locking strategy
- Transaction flow
- Error handling structure

What I changed manually:

- Verified ESM compatibility
- Reviewed SQL queries

Why:

- To prevent overselling inventory.

---

### Prompt 4

Tool: ChatGPT

Date: 2026-07-01

Prompt:

```text
Review architecture, migrations, Docker setup, Fastify setup and reservation transaction logic.
```

Useful output summary:

- Validated architecture
- Identified Express vs Fastify mismatch
- Reviewed PostgreSQL transaction design

What I accepted:

- Fastify project structure
- PostgreSQL pool configuration
- Health endpoint design

What I changed manually:

- Replaced Express-generated files with Fastify versions

Why:

- Assignment explicitly requires Fastify.