# PM Assistant Test Skeleton

This directory reserves test boundaries for the authoritative PM Assistant module.
Phase 5.1 adds structure only; it adds no tests, test tooling, dependencies, fixtures,
configuration, or runtime behavior.

## Test boundaries

- `unit/` is reserved for isolated domain and application behavior.
- `component/` is reserved for presentation and infrastructure boundary behavior.
- `integration/` is reserved for approved interactions inside PM Assistant.
- `contract/` is reserved for provider-side verification of separately approved read
  models or contracts.
- `end_to_end/` is reserved for approved PM Assistant user-flow validation.
- `fixtures/` is reserved for deterministic synthetic or explicitly approved sanitized
  test data.

Tests must preserve PM Assistant authority, keep all four status domains separate,
and exclude secrets, production credentials, raw protected payloads, production
databases, and unapproved personal data. Test support must not create a shared source
dependency with AutoPM.
