# FleetOS Identity Contract

## Purpose

This contract defines how AutoPM and PM Assistant identify and reconcile shared entities without direct database access. It distinguishes current identifiers, transitional matching keys, and proposed target identities.

It does not assert that `fleetos_vehicle_id`, a stable location identifier, production authentication, or a production FleetOS API exists.

## Identity principles

1. PM Assistant authority over maintenance workflow does not by itself settle enterprise Vehicle Master ownership.
2. `vehicle_no` is the only approved transitional cross-system matching key.
3. `vehicle_no` must not be described as permanently immutable or globally unique beyond the approved transition.
4. `fleetos_vehicle_id` is reserved as a proposed future canonical internal identifier. Its format, generation, storage and lifecycle are unresolved.
5. Sheet row numbers, array indexes and database-local integers must not be assumed to be shared identities.
6. Registration, vehicle code and historical vehicle numbers are aliases or attributes until an approved owner and uniqueness policy says otherwise.
7. Original source values must be retained alongside normalized comparison values.
8. Ambiguous matches are quarantined, never guessed.
9. ADR-0004 authorizes PM Assistant-local Vehicle reference creation without
   establishing enterprise Vehicle Master ownership.
10. Persistence generates `local_vehicle_id` inside the application-owned
    creation transaction; a caller cannot supply or select it.

## Current, transitional and target hierarchy

### Vehicle

Current:

- AutoPM observes sheet row index, `vehicle_no`, registration and vehicle attributes.
- PM Assistant observes local `vehicle_master.id`, currently constrained
  `vehicle_no`, vehicle code, and weekly-control registration. The observed
  storage constraint is not an approved Original Vehicle Number uniqueness
  policy.
- PM plans and weekly items use textual vehicle references; relational enforcement to the vehicle master is not demonstrated.

ADR-0004 local creation direction:

- persistence allocates a positive `local_vehicle_id` inside the
  application-owned transaction;
- the aggregate and caller do not generate or select the value;
- the value remains immutable and PM Assistant-local, may contain gaps, and has
  no public or cross-system meaning;
- exact Original Vehicle Number uniqueness remains a pending Product Owner
  decision.

Transitional:

1. Original source record
2. Normalized `vehicle_no` matching value
3. Reviewed aliases: registration, vehicle code, historical spelling/format
4. Reconciliation decision and provenance

Target direction:

1. `fleetos_vehicle_id` — reserved future canonical internal identifier; not implemented
2. Current vehicle number — effective-dated business identifier
3. Registration(s) — effective-dated aliases/attributes
4. Vehicle code(s) — namespaced aliases/attributes
5. Master attributes and effective-dated organizational assignments

Enterprise registry ownership remains unresolved.

### Location

Current:

- PM Assistant has a database-local integer location ID and a unique human-readable name.
- PM plans store location as text.

Transitional:

- Use exact canonical names or explicitly approved aliases.
- Preserve the name stored on historical plans.
- Do not infer that similarly named Thai locations are the same.

Target direction:

- Introduce a future stable FleetOS location identifier after ownership and lifecycle approval.
- Keep name, province, district, address and service type as attributes.

The identifier name/format and enterprise owner remain unresolved.

### PM plan, events and imports

- `pm_plan.id`, history IDs, notification-log IDs and import-log IDs are currently PM Assistant-local identifiers.
- They may be exposed only as local resource identifiers until an external contract is approved.
- Future create/import commands require an idempotency identity, but no format is approved here.
- History and notification attempts must retain association to their initiating plan/action.

### Fleet, business unit and responsibility

- Fleet, business unit, transport type, PM group and responsible-person strings are currently labels, not stable identities.
- They must occupy separate namespaces until Product Owner-approved semantics and hierarchy exist.
- Display-name equality must not link a responsible person to a PM Assistant user.
- Effective-dated mappings are the target direction.

## Normalization rules

Normalization is for comparison only. The original display value remains authoritative evidence of what a source supplied.

### Universal rules

1. Decode source content using its declared or verified encoding; preserve the original decoded value.
2. Apply Unicode normalization consistently. NFC is the proposed comparison form; final approval and test corpus are required.
3. Trim leading/trailing whitespace and collapse repeated internal whitespace for comparison.
4. Treat non-breaking spaces and ordinary spaces consistently for comparison.
5. Do not transliterate Thai text to Latin text.
6. Do not remove Thai combining marks or change Thai spelling.
7. Do not coerce identifier-like strings to numbers; preserve leading zeros.
8. Latin case-folding may be used in a field-specific comparison rule, never as a destructive rewrite.
9. Store the normalization-rule version with reconciliation results.

### Vehicle number

- Accept only the vehicle-number field as the transitional key; never substitute registration or vehicle code implicitly.
- Trim/collapse whitespace and normalize Unicode.
- A legacy display value containing `" | "` may yield the prefix only when the source contract explicitly identifies that format. Preserve the full original value.
- Hyphens, slashes and prefixes must not be removed until a reviewed corpus proves the transformation safe.
- Thai digits and Arabic digits must not be converted automatically until Product Owner approval confirms equivalence and leading-zero behavior.
- Empty or placeholder values such as `-`, `N/A`, or Thai equivalents are not identities.

### Registration

- Preserve Thai letters, digits, spaces, hyphens and province text in the original value.
- A comparison form may normalize Unicode and whitespace only by default.
- Removing province names, hyphens, spaces, or converting digit systems requires a separately approved rule.
- Registration reuse and registration changes must be represented as effective-dated aliases, not destructive replacements.

### Vehicle code

- Vehicle codes occupy a namespace distinct from vehicle numbers.
- Preserve leading zeros, prefixes and punctuation.
- Require a source/system namespace if more than one coding scheme is introduced.

### Fleet, business unit and location

- Normalize Unicode and whitespace only.
- Do not merge abbreviations, Thai/English translations, spelling variants or parent/child locations without an explicit mapping.
- Store mapping version, effective dates and original label.

### Dates and times

- Preserve the raw source value and parsed value.
- Record timezone for event and odometer timestamps; Asia/Bangkok must not be assumed for external sources without confirmation.
- Explicitly distinguish Buddhist Era and Gregorian years during parsing.
- Reject ambiguous dates rather than guessing day/month order.

## Match classifications

| Classification | Meaning | Action |
|---|---|---|
| Exact | Original approved key values are identical. | Link provisionally with provenance. |
| Normalized | Values differ only by approved normalization rules. | Link provisionally and retain both originals/rule version. |
| Ambiguous | One source record matches multiple candidates. | Quarantine; Product Owner/delegate review required. |
| Conflicting | Different identifiers/attributes point to incompatible entities. | Quarantine; no overwrite or merge. |
| Missing | No candidate exists. | Create an exception; do not silently create a canonical entity. |
| Rejected | Value is empty, placeholder, invalid, or violates the field contract. | Exclude from synchronization and audit the reason. |

## Duplicate and mismatch scenarios

- Exact Original Vehicle Number uniqueness for PM Assistant-local creation is a
  pending business decision. Exact value equality does not by itself prove that
  two records represent the same Vehicle.
- Duplicate sheet rows with the same `vehicle_no`: group for review; do not select the last row automatically.
- Same `vehicle_no`, different registrations: preserve each record and determine whether it is a registration change, source error or identity collision.
- Same registration, different `vehicle_no`: treat as a conflict because registrations may change or be reused.
- Vehicle code equals another vehicle's number: retain separate namespaces and refuse cross-field matching.
- PM plan vehicle missing from Vehicle Master: keep the maintenance record; raise an identity exception.
- Weekly-control vehicle disagrees with registration: do not auto-complete against registration; review the `vehicle_no` link.
- Sheet row index changes: ignore it for identity.
- Fleet/business-unit mismatch: attach neither grouping automatically until a mapping decision is recorded.
- Location rename: retain historical label and map it to a stable identity only after approval.
- Thai/Arabic digit variants: mark as a candidate ambiguity until digit-conversion policy is approved.

## Stale data and concurrency

- Every shared read model must expose source and freshness metadata.
- AutoPM cache is temporary presentation state and cannot become a synchronization source.
- A stale AutoPM value never overrides PM Assistant workflow data.
- Ownership takes precedence over `updated_at` timestamps.
- Concurrent changes within an authoritative domain require optimistic versioning or an equivalent approved mechanism in a later implementation.
- Clock time alone must not decide identity merges or completion conflicts.

## Audit and lineage

Successful PM Assistant-local Vehicle creation must be auditable. Required
content, actor or process representation, persistence structure, access,
retention, and storage implementation remain deferred.

An identity decision record must include:

- entity/domain;
- original source and record reference;
- original and normalized values;
- normalization-rule version;
- match classification;
- chosen canonical reference, if any;
- reviewer/actor or import batch;
- decision timestamp and effective dates;
- previous decision when superseded;
- merge, split, alias and correction reason.

Secrets, credentials and raw authentication material must never appear in identity audit data.

## Migration and reconciliation

1. Build inventories without rewriting sources.
2. Test normalization against a reviewed Thai vehicle/registration corpus.
3. Produce exact, normalized, ambiguous, conflicting, missing and rejected reports.
4. Resolve exceptions before assigning future canonical identities.
5. Preserve a reversible crosswalk from every source reference to the chosen identity.
6. Introduce `fleetos_vehicle_id` only after owner, generation, uniqueness, merge/split and retirement policies are approved.
7. Shadow-test AutoPM joins and KPI counts against the crosswalk.
8. Retain transitional `vehicle_no` matching until cutover acceptance; do not erase it afterward.

## Rollback

- Revert to the prior mapping version, not to untracked manual matching.
- Preserve canonical IDs and aliases already issued; rollback must not reuse or renumber them.
- Keep raw source values and reconciliation reports immutable.
- AutoPM may return to a last-known-good read contract while displaying staleness.
- PM Assistant maintenance workflow authority does not change during rollback.

## Unresolved decisions

- Enterprise Vehicle Master owner.
- `fleetos_vehicle_id` type, generator, storage, API representation, merge/split and retirement rules.
- Whether and when `vehicle_no` may change or be reused.
- Whether exact Original Vehicle Number values must be unique among PM
  Assistant-local Vehicle references and how an approved duplicate is reported.
- Minimum local Vehicle-creation audit content and persistence design.
- Thai/Arabic digit conversion and punctuation normalization.
- Registration uniqueness, province handling and reuse policy.
- Stable location identity and location-master ownership.
- Fleet/business-unit master identities and hierarchy.
- User/person/team identity provider and responsibility mapping.
- Stable external plan/event/import identifiers and idempotency rules.
