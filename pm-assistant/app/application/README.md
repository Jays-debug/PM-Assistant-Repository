# Application Layer Skeleton

This package reserves the PM Assistant application and use-case boundary. Phase 5.1
adds no services, commands, queries, entities, repositories, or business behavior.

Future separately approved work in this layer may coordinate use cases, domain
policies, inward-owned interfaces, transactions, and safe application results. It
may depend on the domain layer but must not depend directly on presentation details,
ORM entities, database sessions, provider SDKs, AutoPM source, or browser state.
