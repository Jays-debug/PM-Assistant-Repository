# FleetOS Security and Observability Standard

Version 1.0

## Security baseline

Security is a design and review requirement for every change. Controls described as target direction are not operational until implementation and validation evidence exists.

Minimum rules:

- apply least privilege to users, services, data, files, networks, and external integrations;
- deny access by default at approved protected boundaries;
- validate all untrusted input and encode output for its destination;
- keep AutoPM read-only for maintenance workflow information;
- prohibit direct shared-database access;
- minimize collection, exposure, and retention of sensitive data;
- maintain dependency awareness and address relevant vulnerabilities;
- preserve audit evidence without recording secrets;
- require explicit Product Owner approval for security architecture, authentication, deployment, migration, credential rotation, and external-service changes.

## Secrets and environment variables

- Never commit `.env` files, tokens, passwords, API keys, private keys, signing secrets, database credentials, or provider credentials.
- Store secrets only in an approved local secret mechanism or deployment environment.
- Keep `.env.example` limited to variable names and safe non-secret placeholders.
- Do not paste secret values into prompts, documentation, issues, commits, Pull Requests, screenshots, logs, tests, fixtures, or chat summaries.
- Do not place privileged secrets in HTML, browser JavaScript, browser storage, or static assets.
- Read configuration through an explicit boundary; validate required values at startup without echoing them.
- Distinguish development, test, staging, and production configuration. Never let staging silently target production data or recipients.
- Rotate and revoke an exposed secret through its provider. Rollback must not restore a revoked secret.
- Secret scanning supplements careful review; it does not prove that content is safe.

## Authentication and authorization

Production authentication and authorization are not proven operational in the current repository.

Before production exposure:

- approve the identity and trust topology;
- authenticate callers using a reviewed mechanism;
- authorize each operation and data projection with least privilege;
- define service and human roles separately where appropriate;
- prevent resource-existence disclosure when required;
- define credential issuance, storage, rotation, revocation, and incident procedures;
- test failed, expired, malformed, and insufficient-scope cases;
- retain safe audit evidence for protected actions.

Correlation IDs are diagnostic only and never authenticate, authorize, order, or make a request idempotent.

## Web and API security

- Use TLS at approved production boundaries.
- Restrict production CORS to approved origins, methods, and headers.
- Validate content type, body size, query limits, pagination limits, files, filenames, and archive contents.
- Define timeouts, retry limits, cache policy, and rate limits before production use.
- Never return stack traces, SQL, filesystem paths, connection details, internal topology, credentials, or raw sensitive payloads.
- Verify webhook signatures before processing when an integration provides signing.
- Protect state-changing operations against replay and duplication through approved idempotency and authorization controls.
- Do not trust browser cache, client-provided status, hidden fields, or UI restrictions as security controls.

## Data and logging safety

- Classify data before logging or exposing it.
- Avoid raw request and response bodies by default.
- Redact credentials, authorization headers, cookies, tokens, notification targets, personal data, raw webhook payloads, connection strings, and sensitive import rows.
- Log only the minimum safe context needed to diagnose an event.
- Do not log secrets even at debug level.
- Protect and limit access to logs and audit records.
- Define retention and deletion requirements before production operation; current retention policy remains unresolved.

## Structured logging

Future operational logging should use structured, machine-readable records with consistent fields where supported:

- timestamp with explicit timezone;
- severity;
- service and module;
- event name;
- safe resource or operation reference;
- correlation ID;
- result and duration;
- safe error classification;
- approved deployment or application version.

Avoid duplicate logs across layers. Record exceptions once at the layer with enough context to act, while preserving the original cause internally.

## Correlation IDs

At an approved FleetOS API boundary:

- accept an inbound `X-Correlation-ID` only after length and character validation;
- generate a new value when input is absent or invalid;
- return the same value in the response header and documented envelope;
- propagate it through approved internal calls, scheduler actions, notification attempts, and audit events where applicable;
- never permit free text, secrets, or personal data in the identifier;
- sanitize it before logging.

The exact format and trust behavior remain subject to approval in the API error model.

## Health and readiness

When implemented under an approved API contract:

- liveness reports whether the process can run;
- readiness reports whether essential authoritative read dependencies are available;
- probes expose only coarse status;
- probes never disclose hosts, database engines, schemas, credentials, paths, or provider topology;
- probe authentication, caching, and exposure are deliberate decisions;
- missing authoritative data must not be represented as a healthy zero-result state.

## Required operational visibility

Future production readiness should address:

- application and API errors;
- request latency and dependency timeouts;
- correlation across module boundaries;
- scheduler start, completion, failure, and duplicate-execution protection;
- notification intent, attempt, result, and retry;
- controlled import and reconciliation outcomes;
- identity ambiguity and conflict counts;
- data freshness and stale read models;
- migration execution and reconciliation;
- security-relevant events and access failures.

This list is direction, not evidence that monitoring exists.

## Security incident and rollback considerations

- Stop exposure and preserve safe evidence.
- Notify the Product Owner through the approved channel.
- Rotate or revoke affected credentials without recording their values.
- Use the last-known-good application or configuration only when it is not itself compromised.
- Do not roll back a security fix blindly if rollback would reopen the vulnerability.
- Reconcile data and audit records after containment.
- Document root cause, affected scope, remediation, validation, and prevention without exposing exploitable secret material.

