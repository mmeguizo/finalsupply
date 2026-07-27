# Production-Readiness Audit Report

**Project:** FINAL SUPPLY — Supply Management System  
**Repository:** `C:\Users\markm\Desktop\FINAL SUPPLY`  
**Date:** 2026-07-27  
**Auditor:** Copilot CLI  
**Status:** Final

---

## Executive Summary

This audit assesses the production readiness of the FINAL SUPPLY GraphQL API and supporting test tooling. The codebase implements purchase-order, inspection/acceptance, property-acknowledgement, and requisition/issue-slip workflows, but several patterns currently present meaningful risk at production scale: unbounded database queries, client-side aggregation, ineffective rate limiting, weak input validation, and sensitive-data logging.

Of the 12 findings identified, **four are rated High/Critical and P1**, meaning they should be remediated before any production launch or load-bearing deployment. The remaining issues are addressable in parallel but should be tracked on a public backlog with owners and deadlines. With focused remediation—principally pagination, SQL-level aggregation, structured/redacted logging, server-side validation, and corrected authentication middleware—the system can reach a production-ready baseline within a short sprint.

---

## Scope

- **API layer:** `api/index.js`, `api/config.js`, `api/auth/authorization.js`
- **GraphQL resolvers:** `api/resolvers/inspectionacceptancereport.resolver.js`, `api/resolvers/purchaseorder.resolver.js`, `api/resolvers/requisitionissueslip.resolver.js`, `api/resolvers/propertyacknowledgementrepoert.resolver.js`, and related resolver files
- **Stress/utility tests:** `stress-test/injection-test.js`, `stress-test/full-flow-test.js`, `stress-test/db-stress-test.js`
- **Out of scope:** Frontend code review, infrastructure-as-code, CI/CD pipeline internals, third-party vendor integrations

---

## Methodology

1. **Static review** of resolver files, middleware, configuration, and authorization helpers using the line ranges and behavior described in the research findings.
2. **Pattern analysis** across resolvers to identify repeated anti-patterns (unbounded `findAll`, in-memory aggregation, generic error handling, missing validation).
3. **Risk scoring** using Severity (Critical / High / Medium / Low) and Priority (P0 / P1 / P2 / P3) based on production impact, exploitability, and remediation effort.
4. **Recommendation synthesis** producing actionable, file-specific remediation steps.

---

## Findings

### Category: Compute / Database

#### 1. Unbounded list queries with deep joins

- **File / Location:**
  - `api\resolvers\inspectionacceptancereport.resolver.js` lines 28–59
  - `api\resolvers\purchaseorder.resolver.js` lines 18–21 and 298–301
  - `api\resolvers\requisitionissueslip.resolver.js` lines 16–20
- **Severity:** High
- **Priority:** P1
- **Risk / Impact:** These resolvers call Sequelize `findAll()` without `limit`, `offset`, or explicit field projection, and they include deeply nested `include` chains. As the PO, IAR, and RIS tables grow, each request can pull tens of thousands of rows and associated records into Node.js memory. This causes CPU/memory spikes, long event-loop blocks, database connection exhaustion, and potential GraphQL denial-of-service.
- **Actionable Recommendation:**
  - Add mandatory `limit`/`offset` arguments to every list query (default limit, e.g., 25–50, with a hard cap, e.g., 250–1000).
  - Project only the fields required by the GraphQL schema using `attributes`.
  - Replace deep eager-loading with DataLoader-style batching or field-gated resolvers so nested data is fetched only when requested.
  - Add query-cost analysis or GraphQL query-depth/complexity limits as a guardrail.

---

#### 2. Report resolvers perform full-table scans and client-side grouping

- **File / Location:** `api\resolvers\inspectionacceptancereport.resolver.js` lines 117–174
- **Severity:** High
- **Priority:** P1
- **Risk / Impact:** The report resolver fetches a large record set and then deduplicates/groups it in JavaScript. At production volume this wastes database I/O, serializes excessive rows over the network, and blocks the event loop during the grouping phase, degrading response times for all concurrent users.
- **Actionable Recommendation:**
  - Move aggregation to SQL using `GROUP BY`, `COUNT`, `SUM`, and conditional aggregates.
  - If complex grouping is unavoidable, use a read-model / materialized view or a dedicated reporting query path.
  - Paginate the underlying detail query and stream large result sets instead of materializing full arrays in memory.

---

#### 3. Totals computed in application memory

- **File / Location:** `api\resolvers\purchaseorder.resolver.js` lines 75–115
- **Severity:** Medium
- **Priority:** P2
- **Risk / Impact:** The resolver loads every matching purchase-order row via `findAll()` and then uses `reduce()` (or equivalent array iteration) to compute totals. For large date ranges or tenants with many POs, this is O(n) memory and CPU work that should be O(1) at the database.
- **Actionable Recommendation:**
  - Replace the in-memory reduction with SQL aggregate functions (`SUM`, `COUNT`, `AVG`) scoped by the requested filters.
  - Use `sequelize.fn()` or a raw parameterized query for the aggregate path.
  - Return aggregate results separately from detail results so clients can fetch only what they need.

---

#### 4. (Additional observation) No query timeout or connection-pool sizing evident

- **File / Location:** `api\config.js` and `api\index.js` (configuration review)
- **Severity:** Medium
- **Priority:** P2
- **Risk / Impact:** Without explicit query timeouts and bounded connection pools, a single slow unbounded query can hold connections indefinitely and starve other requests, amplifying the impact of findings 1–3.
- **Actionable Recommendation:**
  - Configure Sequelize with `pool: { max, min, acquire, idle }` values appropriate for the production database tier.
  - Add `queryTimeout` / `statement_timeout` (PostgreSQL) or equivalent MySQL timeout settings.
  - Instrument slow-query logging and set an alert threshold (e.g., 2 seconds).

---

### Category: Security

#### 5. Authentication rate limiter likely ineffective

- **File / Location:** `api\index.js` lines 58–64
- **Severity:** High
- **Priority:** P1
- **Risk / Impact:** The login detection middleware inspects `req.body` before the JSON body parser has populated it. On JSON login requests, `req.body` is still a Buffer/string or empty at that point, so the `/login` path condition will rarely match and brute-force protection will not trigger.
- **Actionable Recommendation:**
  - Move the rate-limiting middleware after `express.json()` so `req.body` is parsed.
  - Alternatively, detect login routes by `req.path === '/login'` and `req.method === 'POST'` regardless of body content, or safely inspect the raw body without double-parsing.
  - Add tests that prove the limiter responds to repeated failed login attempts.

---

#### 6. Config validation bug for database password

- **File / Location:** `api\config.js` lines 29–33
- **Severity:** High
- **Priority:** P1
- **Risk / Impact:** The condition `if (!process.env.MYSQL_PASSWORD === undefined)` is logically incorrect (`!string === undefined` is always `false`). A missing password therefore bypasses validation and the application may start with an invalid or empty credential, producing cryptic connection failures in production instead of a clear startup error.
- **Actionable Recommendation:**
  - Fix the check to `if (process.env.MYSQL_PASSWORD === undefined)` or use a schema validator such as Joi/Zod for all required environment variables.
  - Fail fast at startup with an explicit message listing the missing variable.
  - Add a unit test covering missing required configuration.

---

#### 7. Ownership scope may expose shared / null-owned records broadly

- **File / Location:**
  - `api\auth\authorization.js` lines 31–40
  - Used in `api\resolvers\requisitionissueslip.resolver.js` lines 14–19 and similar patterns in other resolvers
- **Severity:** Medium
- **Priority:** P2
- **Risk / Impact:** The authorization helper adds `{ createdBy: null }` to the query scope for non-admin users. Any record with a null `createdBy` becomes visible to every non-admin user, which may leak cross-department or cross-tenant data if null ownership is not intentionally public.
- **Actionable Recommendation:**
  - Verify whether null `createdBy` records are deliberately shared. If not, remove `{ createdBy: null }` from the default scope.
  - If shared records are required, gate them with an explicit `isPublic`/`isShared` flag or tenant/department filter.
  - Add authorization unit tests for non-admin access to null-owned and other-owned records.

---

#### 8. Weak input validation on mutations

- **File / Location:**
  - `api\resolvers\purchaseorder.resolver.js` lines 218–289 and 343–420
  - Similar patterns in IAR, PAR, and RIS resolvers
- **Severity:** High
- **Priority:** P1
- **Risk / Impact:** Mutations accept IDs, quantities, dates, and long text fields with little or no server-side validation. This opens the door to invalid data, integer overflows, malformed dates, overly long strings, and injection-style payloads that could corrupt reports or break downstream print templates.
- **Actionable Recommendation:**
  - Add a centralized validation layer (Joi, Zod, Yup, or class-validator) for every mutation input.
  - Enforce rules such as: positive numeric quantities, valid UUID/integer IDs, date ranges, max text lengths, enum values, and required PO number / supplier / place-of-delivery per the project design decisions.
  - Return clear, field-level validation errors to the client instead of generic exceptions.

---

### Category: Logging

#### 9. Sensitive data logged in production paths

- **File / Location:**
  - `api\resolvers\purchaseorder.resolver.js` around line 205
  - `api\resolvers\requisitionissueslip.resolver.js` lines 75–76
  - `api\resolvers\propertyacknowledgementrepoert.resolver.js` lines 214–215
  - `api\index.js` lines 101–110
- **Severity:** Medium
- **Priority:** P2
- **Risk / Impact:** Production logs capture user details, raw inputs, signatory names, and error internals. If logs are forwarded to third-party services or retained long-term, this creates a data-privacy and compliance risk and increases the blast radius of any log leak.
- **Actionable Recommendation:**
  - Switch to structured logging (e.g., Pino, Winston JSON) with a consistent schema.
  - Redact or omit PII fields (names, signatures, phone/TIN, error stack traces in production).
  - Use log levels correctly (`debug` for verbose request bodies, `info` for business events, `error` for failures).
  - Document the log retention policy and ensure it aligns with privacy requirements.

---

### Category: Error Handling

#### 10. Error handling hides root cause and returns generic errors

- **File / Location:**
  - Throughout resolvers, e.g., `api\resolvers\purchaseorder.resolver.js` lines 24–27
  - `api\index.js` lines 133–139
- **Severity:** Medium
- **Priority:** P2
- **Risk / Impact:** Resolvers wrap failures in generic `Error` objects and the Express error handler returns a 404 status for malformed JSON. This makes production debugging slower and gives clients confusing or incorrect HTTP/GraphQL responses.
- **Actionable Recommendation:**
  - Standardize on typed errors (`AuthenticationError`, `ForbiddenError`, `UserInputError`, `ApolloError`).
  - In production, return safe, user-facing messages while logging the full error detail internally.
  - Fix the malformed-JSON handler to return `400 Bad Request` with a clear body instead of `404`.
  - Add an error-formatting plugin to Apollo Server that normalizes error extensions and masks internal details.

---

### Category: Testing

#### 11. Stress tests miss auth, authorization, and production-safety cases

- **File / Location:**
  - `stress-test\injection-test.js` lines 130–202
  - `stress-test\full-flow-test.js` lines 99–166
  - `stress-test\db-stress-test.js` lines 65–152
- **Severity:** Low
- **Priority:** P3
- **Risk / Impact:** The existing stress suite exercises basic flows and injection-style payloads but does not assert role boundaries, pagination limits, or behavior under large data volumes. Without these assertions, regressions in the P1 issues above can re-enter the codebase undetected.
- **Actionable Recommendation:**
  - Add authorization test cases: non-admin accessing another user's records, admin bypass, null-owned record visibility.
  - Add pagination contract tests: request beyond max limit, default limit enforcement, cursor/offset correctness.
  - Add data-volume tests: resolver response time and memory usage with 10k/100k synthetic rows.
  - Make stress tests fail the build on regression instead of running as informational-only.

---

### Category: Deployment / Configuration

#### 12. (Additional observation) Environment-based limits and feature flags not centralized

- **File / Location:** `api\config.js` and related middleware
- **Severity:** Low
- **Priority:** P3
- **Risk / Impact:** Rate-limit windows, query caps, and pagination defaults appear to be hardcoded or scattered. This makes it hard to tune production behavior without code changes and increases the chance of environment-specific misconfiguration.
- **Actionable Recommendation:**
  - Centralize all tunable constants in `api\config.js` with environment-variable overrides.
  - Validate config at startup and print a sanitized startup manifest (hiding secrets).
  - Document each environment variable in a `README.md` or `.env.example` file.

---

## Summary Table

| # | Finding | Severity | Priority |
|---|---------|----------|----------|
| 1 | Unbounded list queries with deep joins | High | P1 |
| 2 | Report resolvers full-table scans and client-side grouping | High | P1 |
| 3 | Totals computed in application memory | Medium | P2 |
| 4 | No query timeout / connection-pool sizing evident | Medium | P2 |
| 5 | Authentication rate limiter likely ineffective | High | P1 |
| 6 | Config validation bug for database password | High | P1 |
| 7 | Ownership scope may expose shared/null-owned records | Medium | P2 |
| 8 | Weak input validation on mutations | High | P1 |
| 9 | Sensitive data logged in production paths | Medium | P2 |
| 10 | Error handling hides root cause and returns generic errors | Medium | P2 |
| 11 | Stress tests miss auth and production-safety cases | Low | P3 |
| 12 | Environment limits and feature flags not centralized | Low | P3 |

---

## Roadmap / Next Steps

### Immediate (before production launch)

1. **Fix config validation** (`api\config.js` lines 29–33) and fail fast on missing required variables. (Finding 6)
2. **Move/correct login rate limiting** (`api\index.js` lines 58–64) and prove with tests. (Finding 5)
3. **Add pagination, field projection, and query caps** to the three unbounded list resolvers. (Finding 1)
4. **Move report aggregation to SQL** in the IAR report resolver. (Finding 2)
5. **Introduce server-side input validation** for all PO, IAR, PAR, and RIS mutations. (Finding 8)

### Short-term (within 1–2 sprints)

6. Replace in-memory totals with SQL aggregates. (Finding 3)
7. Redact PII and adopt structured logging. (Finding 9)
8. Standardize error types and fix the malformed-JSON 404 response. (Finding 10)
9. Review and tighten ownership scope for null `createdBy` records. (Finding 7)
10. Configure connection pools and query timeouts. (Finding 4)

### Medium-term (ongoing hygiene)

11. Expand stress tests to cover authorization, pagination contracts, and data-volume behavior. (Finding 11)
12. Centralize environment-based tunables and document them. (Finding 12)
13. Introduce query-depth/complexity analysis and a performance budget for resolver response times.

### Suggested acceptance criteria

- All P1 findings have linked PRs with passing tests.
- A load test with 100k synthetic records completes without memory spikes or >2 s p95 resolver latency.
- No PII or stack traces appear in production logs at `info` level or above.
- Non-admin users cannot access records they do not own unless explicitly shared.

---

*End of report.*
