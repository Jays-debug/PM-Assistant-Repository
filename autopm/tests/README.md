# AutoPM Test Skeleton

This directory reserves the test boundaries for the existing AutoPM application.
Phase 5.1 adds structure only; it adds no tests, test tooling, dependencies, or
runtime behavior.

## Test boundaries

- `unit/` is reserved for isolated presentation, mapping, freshness, and local
  interaction behavior.
- `component/` is reserved for AutoPM-owned UI component behavior.
- `integration/` is reserved for approved interactions among AutoPM-owned parts.
- `contract/` is reserved for read-only consumer verification against a separately
  approved cross-module contract.
- `end_to_end/` is reserved for approved AutoPM user-flow validation.
- `fixtures/` is reserved for synthetic or explicitly approved sanitized test data.

AutoPM remains read-only for maintenance workflow information. Tests must not import
PM Assistant source, access PM Assistant persistence, contain secrets or production
data, or make AutoPM test fixtures an authoritative data source.
