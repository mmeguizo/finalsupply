# Optimize Compute/Database-Heavy Resolvers

The production-readiness audit identified three resolvers that perform unbounded `findAll()` queries with deep eager-loading, compute totals in application memory, and fetch report data client-side instead of using the database. This task refactors those resolvers to use pagination, field projection, and SQL aggregates so the server remains responsive as data grows.

## Goal

Move heavy work out of application memory and into the database for the three identified resolvers. Each resolver must support bounded list queries, project only required fields, and compute aggregates (counts, sums, grouped data) with SQL.

## Context

- `api\resolvers\inspectionacceptancereport.resolver.js` currently runs an unbounded `findAll()` with deep includes. The report path fetches the full table and then groups/dedupes in application code.
- `api\resolvers\purchaseorder.resolver.js` currently runs an unbounded list query with deep joins and computes totals in memory with `findAll()` plus `reduce()`.
- `api\resolvers\requisitionissueslip.resolver.js` currently runs an unbounded `findAll()` list query with no limit, offset, or projection.

These patterns work for small datasets but will degrade once the database grows. The fix follows a common pattern: cap the result set, fetch fewer columns, and let the database do grouping/aggregation.

## Files to Touch

- `api\resolvers\inspectionacceptancereport.resolver.js`
- `api\resolvers\purchaseorder.resolver.js`
- `api\resolvers\requisitionissueslip.resolver.js`

## Subtasks (small chunks)

### 1. Add pagination and hard cap to Inspection Acceptance Report list query

- **File(s) to touch**: `api\resolvers\inspectionacceptancereport.resolver.js`
- **Description**: Locate the resolver that returns a list of Inspection Acceptance Reports. Add `limit` and `offset` arguments, default `limit` to a safe value (e.g., 50), enforce a hard maximum (e.g., 500), and pass them to the Sequelize `findAll()` call.
- **Acceptance criteria**: The list query accepts `limit` and `offset`, rejects or clamps values above the hard cap, and never calls `findAll()` without an explicit row limit.
- **Test/verification**: Run the GraphQL list query without arguments and confirm it returns at most the default limit. Then request `limit: 1000` and confirm it is clamped to the hard cap.

### 2. Add field projection to Inspection Acceptance Report list query

- **File(s) to touch**: `api\resolvers\inspectionacceptancereport.resolver.js`
- **Description**: In the same list query, add an `attributes` option that returns only the columns required by the list UI. Keep deeper includes only when the detail view is requested; for list queries, limit the related fields to identifiers and names.
- **Acceptance criteria**: The list query `attributes` array excludes columns not shown in the list (e.g., large text/details fields) and the response still contains all fields the UI list requires.
- **Test/verification**: Inspect the generated SQL (Sequelize logging or database slow-log) and verify the column list is reduced compared with the original query.

### 3. Convert Inspection Acceptance Report report path to SQL aggregation

- **File(s) to touch**: `api\resolvers\inspectionacceptancereport.resolver.js`
- **Description**: Find the resolver path that builds a report by fetching the full table and grouping/deduping in memory. Replace the full-table `findAll()` with a parameterized raw query or a `findAll()` using `sequelize.fn('COUNT')`, `sequelize.fn('SUM')`, and `group` so the database returns the aggregated result directly.
- **Acceptance criteria**: The report endpoint no longer fetches the full table, no client-side grouping loop remains for that path, and the returned totals/groups match the previous implementation for a representative dataset.
- **Test/verification**: Run the report query, compare its JSON output against the same query on `main`, and confirm the generated SQL contains `GROUP BY`/`COUNT`/`SUM`.

### 4. Add pagination and hard cap to Purchase Order list query

- **File(s) to touch**: `api\resolvers\purchaseorder.resolver.js`
- **Description**: Locate the list resolver for Purchase Orders. Accept `limit` and `offset`, default `limit` to a safe value (e.g., 50), enforce a hard maximum (e.g., 500), and apply them to the Sequelize query.
- **Acceptance criteria**: The list query supports `limit`/`offset`, clamps out-of-range values, and never performs an unbounded `findAll()`.
- **Test/verification**: Run the list query with no arguments, with a normal limit, and with a limit exceeding the cap; verify the returned row counts match expectations.

### 5. Add field projection to Purchase Order list query

- **File(s) to touch**: `api\resolvers\purchaseorder.resolver.js`
- **Description**: Add an `attributes` option to the Purchase Order list query so only fields shown in the list are fetched. Reduce eager-loading depth for the list resolver; fetch full item detail only in the single-record/detail resolver.
- **Acceptance criteria**: The list query selects only required columns and does not eagerly load heavy nested associations that are only needed by the detail view.
- **Test/verification**: Enable Sequelize logging or use the database slow-log to confirm the column list is shorter and the join count/depth is reduced for the list query.

### 6. Move Purchase Order totals from app memory to SQL aggregate

- **File(s) to touch**: `api\resolvers\purchaseorder.resolver.js`
- **Description**: Identify the totals calculation that currently uses `findAll()` plus `reduce()`. Replace it with a separate aggregate query using `sequelize.fn('SUM')`/`sequelize.fn('COUNT')` with `GROUP BY`, or a parameterized raw query that returns the totals. Expose the aggregate through a dedicated resolver field or return it alongside the paginated list.
- **Acceptance criteria**: No totals are computed by iterating a `findAll()` result with `reduce()` in application code. The aggregate values are mathematically identical to the previous implementation for the same filter set.
- **Test/verification**: Run the totals query for a fixed filter and compare the result with a manual `SUM`/`COUNT` against the database. Confirm the response no longer requires loading every row.

### 7. Add pagination and hard cap to Requisition Issue Slip list query

- **File(s) to touch**: `api\resolvers\requisitionissueslip.resolver.js`
- **Description**: Locate the list resolver for Requisition Issue Slips. Add `limit` and `offset` arguments, default `limit` to a safe value (e.g., 50), enforce a hard maximum (e.g., 500), and pass them to the `findAll()` call.
- **Acceptance criteria**: The list query accepts pagination, clamps values above the hard cap, and never calls `findAll()` without a row limit.
- **Test/verification**: Execute the list query with default arguments, with a normal limit, and with a limit above the cap. Verify returned row counts match the clamped/default values.

### 8. Add field projection to Requisition Issue Slip list query

- **File(s) to touch**: `api\resolvers\requisitionissueslip.resolver.js`
- **Description**: Add an `attributes` option to the Requisition Issue Slip list query so only fields needed by the list UI are returned. Remove or reduce unnecessary eager includes for the list resolver.
- **Acceptance criteria**: The list query projects only the columns required by the list view and the response still satisfies the UI contract.
- **Test/verification**: Inspect the generated SQL and confirm fewer columns are selected. Run the list query and assert the returned shape is unchanged except for excluded fields that were already unused by the list.

## Acceptance Criteria

- [ ] `inspectionacceptancereport.resolver.js` list query supports pagination and has a hard cap.
- [ ] `inspectionacceptancereport.resolver.js` list query projects only required fields.
- [ ] `inspectionacceptancereport.resolver.js` report path uses SQL aggregates and no longer fetches the full table for client-side grouping.
- [ ] `purchaseorder.resolver.js` list query supports pagination and has a hard cap.
- [ ] `purchaseorder.resolver.js` list query projects only required fields.
- [ ] `purchaseorder.resolver.js` totals are computed by SQL aggregate, not by `findAll()` + `reduce()`.
- [ ] `requisitionissueslip.resolver.js` list query supports pagination and has a hard cap.
- [ ] `requisitionissueslip.resolver.js` list query projects only required fields.
- [ ] All optimized endpoints return equivalent data compared with the original implementation for a representative dataset.
- [ ] No unbounded `findAll()` queries remain in the three resolvers.

## Test Plan

1. Start the API server and open the GraphQL playground or use a test client.
2. For each resolver, execute the list query with no pagination arguments and verify the result count is at most the default limit.
3. For each resolver, execute the list query with a `limit` argument larger than the hard cap and verify it is clamped.
4. For each resolver, execute the list query with a specific `limit`/`offset` pair and verify the correct slice is returned.
5. Run the Inspection Acceptance Report report query, capture the SQL, and verify it contains `GROUP BY` with aggregate functions.
6. Run the Purchase Order totals query, capture the SQL, and verify it uses `SUM`/`COUNT` rather than returning every row.
7. Compare the JSON output of each optimized query against the same query on the unoptimized branch for a fixed dataset; differences should be limited to ordering or fields intentionally removed.
8. Run the existing API test suite (if present) and confirm no regressions.

## Notes

- Keep the default limits conservative (suggest 50) and the hard caps defensive (suggest 500) to prevent accidental large scans.
- Prefer `sequelize.fn()` and `group` over raw queries when the aggregation is simple, so Sequelize continues to map model attributes. Use parameterized raw queries only when the aggregation is complex enough that Sequelize cannot express it cleanly.
- When reducing eager-loading depth, make sure the detail/single-record resolver still returns the full nested data required by detail views and print templates.
- If the frontend currently relies on in-memory totals or client-side grouping from these endpoints, coordinate the API contract changes with the frontend, or expose new dedicated aggregate fields while keeping the list fields stable.
- Add an index to the columns used for `GROUP BY`, `ORDER BY`, and filter `WHERE` clauses if they are not already indexed; this task focuses on resolver changes, but index recommendations should be noted for a follow-up database task.
