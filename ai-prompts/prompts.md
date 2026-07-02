# AI Usage Log

## Tools Used
- GitHub Copilot: VS Code Copilot Chat
- Other: None

## Prompt Log

### Prompt 1
Tool: GitHub Copilot
Date: 2026-07-02
Prompt:
```text
Create a Fastify-based inventory reservation service with PostgreSQL and Kafka, including folder structure, routes, services, migrations, and basic concurrency-safe reservation logic.
```
Useful output summary:
- Suggested a Fastify app structure with route, controller, service, and database layers
- Proposed PostgreSQL-based reservation and inventory flow
- Recommended Kafka event publishing for reservation lifecycle changes

What I accepted:
- Fastify as the HTTP framework
- ES Module project structure
- PostgreSQL transaction-based reservation handling
- Kafka event publishing approach

What I changed manually:
- Adjusted the implementation to match the current repository structure and file layout
- Kept the solution small and focused on correctness under concurrency
- Replaced the initial generic examples with the repository-specific routes and services

Why:
- The assignment emphasized correctness, clean structure, and a compact implementation rather than overbuilding.

### Prompt 2
Tool: GitHub Copilot
Date: 2026-07-02
Prompt:
```text
Review the current reservation service code and generate a README plus AI usage documentation that reflects the actual implementation and the assignment requirements.
```
Useful output summary:
- Documented the current Fastify API endpoints and setup flow
- Captured the concurrency strategy and Kafka usage based on the implemented code
- Structured the README around the assignment checklist

What I accepted:
- The current transaction and locking strategy using `SELECT ... FOR UPDATE`
- The background expiry job approach
- The use of Kafka publish events for reservation lifecycle milestones

What I changed manually:
- Wrote the documentation to match the actual code paths in the repository
- Clearly marked the intentionally unimplemented items as limitations rather than pretending they existed
- Added setup and example API usage tailored to this project

Why:
- The final documentation should describe the real behavior of the service, not an idealized version.

## Verification Notes
- The implementation was reviewed against the current route, service, and migration files in the repository.
- The README and AI log were written to match the actual project structure and behavior.
