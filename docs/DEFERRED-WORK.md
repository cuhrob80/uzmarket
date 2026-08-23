# UzMarket Deferred Work

This file records intentionally postponed work.

Rules:
- Do not silently forget postponed work.
- Do not implement an item only because it exists here.
- Review this file before each major stage.
- Remove an item only after it is implemented and verified.
- Add the stage or condition that should trigger reconsideration when known.

## Open items

### DW-001 — Search infrastructure
Status: Deferred

Current PostgreSQL search is sufficient for the current stage.

Reconsider when:
- listing volume grows significantly;
- search quality requirements exceed PostgreSQL capabilities;
- ranking, typo tolerance, advanced filters, or dedicated indexing become necessary.

Do not introduce Elasticsearch/OpenSearch/Meilisearch only for hypothetical future scale.

### DW-002 — Cache infrastructure
Status: Deferred

Do not introduce Redis or another distributed cache until there is a measured need.

Reconsider when:
- database/query load justifies caching;
- rate limiting needs shared state across multiple backend instances;
- sessions, queues, counters, or other shared ephemeral state require it.

### DW-003 — Background jobs and queues
Status: Deferred

Do not introduce RabbitMQ, Kafka, BullMQ, or similar infrastructure yet.

Reconsider when asynchronous work appears, such as:
- image processing;
- notifications;
- moderation pipelines;
- bulk imports;
- expensive background tasks.

### DW-004 — Service extraction / microservices
Status: Deferred

Keep the backend modular, but do not split it into microservices prematurely.

Reconsider when a module has an independent scaling, deployment, reliability, or ownership requirement.

### DW-005 — External provider abstractions
Status: Ongoing architectural rule

SMS, media storage, maps, payments, notifications, search, and similar external services should be integrated behind replaceable boundaries when introduced.

Avoid spreading provider-specific logic throughout business modules.

### DW-006 — Listing media
Status: Planned

Listing image/media support is intentionally reserved for a dedicated stage.

Before implementation, define:
- ownership rules;
- upload limits;
- file validation;
- ordering;
- cover image behavior;
- storage abstraction;
- deletion behavior;
- moderation/security considerations;
- web and mobile API requirements.

Do not attach a storage provider directly to core listing business logic.
