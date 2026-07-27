# Production-readiness execution plan

## Architecture and context inventory

This is a React 19 + TypeScript/Vite single-page application in `app/`, backed by a Node.js ESM Express 4 + Apollo Server 4 GraphQL API in `api/`. The API uses Passport session authentication stored in MySQL, Sequelize/MySQL for operational data, and a legacy unused Mongoose transaction model. Purchase orders flow into IAR rows, then PAR/ICS/RIS/no-category issuance records. The client prints documents by interpolating business data into HTML strings and writing them into a popup or iframe.

The user context is a production deployment with **heavy computations/data processing but not a high user count**. Current deployment material is PM2-oriented (`ecosystem.config.cjs`) and explicitly says a production frontend should be built and served by Nginx. The repository has no Dockerfile, compose file, CI workflow, or backend/frontend automated unit-test script. `stress-test/` has standalone Node scripts, but its README calls for a running server and test credentials.

### Explicit assumptions

1. MySQL is the system of record; data corruption and unauthorized issuance are more serious than short downtime.
2. The intended roles are only `admin` and `user`; browser route checks are convenience only, not authorization.
3. Existing null `createdBy` IAR records deliberately remain visible during the documented transition, but every new record must have a verified owner.
4. Deployment target is cPanel/shared hosting. The frontend is static hosting and the API needs a hosting-supported persistent Node application (normally cPanel Setup Node.js App/Passenger or an administrator-managed equivalent). A shell command alone is not a durable production process manager.
5. The frontend and API real HTTPS domains, Node runtime version, assigned API port/socket, public document root, MySQL access method, and any reverse-proxy capability are hosting-administrator inputs. Do not substitute localhost, a LAN IP, ngrok, or a guessed proxy setting for them.
6. The application has low expected user count but can perform expensive data/document work. Start with one hosting-managed API process and no queue worker. Add a persistent worker, Redis, clustering, or an external queue only after measurements and only if the host can supervise it reliably.
7. Existing local changes are user work and must not be overwritten: three IAR print files are modified, and `app/dist.7z` is untracked (observed with `git status --short` on 2026-07-20).

### cPanel deployment model to verify before release

**Static frontend.** Build `app/` once with the final `VITE_GRAPHQL_URL` and publish only the contents of `app/dist` to the frontend domain’s document root. The Vite environment value is build-time public configuration, not a runtime secret. The cPanel terminal may build it if the required Node version/tools are available; otherwise build the reviewed artifact in a controlled build environment and upload that artifact. Do not publish source, `node_modules`, `.env`, or an archive as the web root.

**API.** Confirm that the host provides a persistent Node service, such as Setup Node.js App backed by Passenger, and supports the required Node version and ESM entry point. Configure `api/index.js` as the startup file, the API directory as the application root outside the public document root, `NODE_ENV=production`, and the port/socket assigned by that facility. Do not use PM2, `npm run dev`, `vite`, a `screen`/`nohup` process, or an interactive terminal session as the assumed production service. If the host does not provide a supported Node application service, the administrator must provide and own an equivalent supervised reverse-proxy/runtime solution or the API must be hosted elsewhere; static cPanel hosting alone cannot run this API.

**Domain topology.** Prefer one HTTPS site with an administrator-provided server-level `/graphql` reverse proxy to the API; then build with `VITE_GRAPHQL_URL=/graphql`. `.htaccess` must not implement that proxy. If the administrator instead maps a distinct API HTTPS domain, build with the exact URL, for example `https://api.example.org/graphql`, and configure exact API CORS origins. Never deploy a localhost, private IP, or plaintext production API URL.

**Restart model.** A Passenger/Node-app restart can terminate requests and clears in-memory rate-limit state. MySQL-backed sessions survive an ordinary API restart; in-process jobs do not. The release procedure must run migrations once, restart through the cPanel Node-app control or the administrator’s documented command, then verify logs and health. Do not expect a terminal process to survive logout, resource enforcement, or a server restart.

### Verified findings (not recommendations)

| ID | Severity | Classification | Verified finding and evidence |
|---|---|---|---|
| F01 | **Blocker** | **MUST BEFORE DEPLOY** | The API imports `cors` at `api/index.js:9`, but `api/package.json:17-37` does not declare it and `npm ls cors --depth=0` reported empty. A clean `npm ci` deployment can fail at startup. |
| F02 | **Blocker** | **MUST BEFORE DEPLOY** | `npm audit --omit=dev` reports 17 backend production vulnerabilities, including 2 critical and 8 high; direct vulnerable packages include `@apollo/server`, `express`, `mongoose`, and `sequelize`. The frontend reports 20 production vulnerabilities, including 7 high; direct vulnerable packages include `react-router`, `react-router-dom`, `vite`, `@toolpad/core`, and `@mui/x-data-grid-generator`. |
| F03 | **Blocker** | **MUST BEFORE DEPLOY** | API startup calls `syncTables()` unconditionally (`api/index.js:73-75`), and that function runs `sequelize.sync({ alter: true })` (`api/db/connectDB.js:79-88`). Schema mutation at every production boot is unsafe and conflicts with migrations. |
| F04 | **Blocker** | **MUST BEFORE DEPLOY** | The declared migration runner imports a file that is absent from the repository: `api/scripts/run_all_migrations.js:5` imports `20260128000001-add_income_mds_details_to_iar.js`; it is not in `api/migrations/`. `npm run db:migrate` is therefore not a reliable release step. |
| F05 | **Blocker** | **MUST BEFORE DEPLOY** | `roleResolver` has no authentication checks for `roles`, `role`, `addRole`, `updateRole`, or `deleteRole` (`api/resolvers/role.resolver.js:4-105`). It is directly callable through GraphQL. |
| F06 | **Blocker** | **MUST BEFORE DEPLOY** | User administration only checks that a caller is authenticated, not that the caller is an admin. `editUser` accepts `role`, password, and arbitrary `id` (`api/resolvers/user.resolver.js:83-181`); `createUser` and `deleteUser` have the same missing role check (`187-296`). An ordinary authenticated user can attempt privilege escalation or modify another account. |
| F07 | **Blocker** | **MUST BEFORE DEPLOY** | Session cookies are permanently configured as `secure: false` (`api/index.js:47-60`), CORS has a hard-coded development/ngrok allowlist (`90-105`), the request body limit is 50 MB (`106`), and the listening port is hard-coded to 4000 (`150`). |
| F08 | **High** | **MUST BEFORE DEPLOY** | Resolvers use only authentication, with no centralized role/ownership policy. Examples include ID-based bulk assignment in `propertyacknowledgementrepoert.resolver.js:224-249`, `requisitionissueslip.resolver.js:81-98`, and `inspectionacceptancereport.resolver.js:280-325`. Some scoped list queries exist, but `getIARItemsByIarId` omits the `createdBy` filter (`inspectionacceptancereport.resolver.js:221-267`). |
| F09 | **High** | **RECOMMENDED POST-LAUNCH** | GraphQL has no pagination arguments on unbounded list fields (`api/typeDefs/purchaseorder.typeDef.js:234-249`, `inspectionacceptancereport.typeDef.js:175-181`). Corresponding resolvers use unbounded `findAll`; dashboard code loads full item and PO lists then aggregates in JavaScript (`purchaseorder.resolver.js:85-161`, `app/src/pages/index.tsx:46-76`). |
| F10 | **High** | **MUST BEFORE DEPLOY** | IAR/PAR/ICS/RIS IDs are calculated with “read latest + one” logic, then stored only in process-local variables (`api/utils/iarIdGenerator.js:40-73`, `parIdGenerator.js:4-65`, `risIdGenerator.js:4-75`, `icsIdGenerator.js:4-105`). Concurrent requests or PM2 cluster workers can create duplicates. There are no verified database unique constraints for these identifiers. |
| F11 | **High** | **MUST BEFORE DEPLOY** | API error handlers repeatedly expose `error.message` to GraphQL clients, for example `user.resolver.js:35-38`, `purchaseorder.resolver.js:761-764`, and `inspectionacceptancereport.resolver.js:701-705`. Apollo has no production `formatError`, query-depth, complexity, or introspection policy (`api/index.js:67-71`). |
| F12 | **High** | **MUST BEFORE DEPLOY** | Server-side sanitization exists but no resolver imports it (`api/utils/sanitize.js:1-167`; repository search found no use outside that file). Dynamic print HTML is written with `document.write`, for example `app/src/components/printingForReports.tsx:42-50`; all templates must be audited at their interpolation points. Two previews use `dangerouslySetInnerHTML` (`inventoryCustodianSlip.tsx` and `requisitionAndIssueSlip.tsx`), although their current `nl2br` helper escapes first (`app/src/utils/textHelpers.ts:1-9`). |
| F13 | **High** | **MUST BEFORE DEPLOY** | The frontend endpoint is a hard-coded private-network HTTP address (`app/src/apollo/client.ts:5-10`), and production sourcemaps are enabled (`app/vite.config.ts:5-13`). Apollo error logging prints operation variables (`app/src/apollo/errorHandling.ts:23-44`), which can include login passwords. |
| F14 | **Medium** | **MUST BEFORE DEPLOY** | `User.email` is not declared unique; its own model comment says this must be created manually (`api/models/user.model.js:8-14`). Application-level “find then create” checks race. |
| F15 | **Medium** | **MUST BEFORE DEPLOY** | Session data remains in localStorage and `getStoredSession()` directly parses JSON (`app/src/auth/SessionContext.tsx:16-24`, `app/src/auth/authUtils.ts:12-25`), so a stale/corrupt browser value can misrepresent UI state. The server still correctly owns the cookie session. |
| F16 | **Medium** | **REQUIRED FOR CPANEL DEPLOYMENT** | Current production PM2 config starts Vite’s development server for the frontend (`ecosystem.config.cjs:83-112`) and runs one API worker per CPU (`36-80`), increasing the identifier-race and aggregate database connection risk. API PM2 config also contains an obsolete absolute path (`api/ecosystem.config.cjs:18-21`). |
| F17 | **Medium** | **RECOMMENDED POST-LAUNCH** | Models indicate indexes with `index: true` (`purchaseorderitems.js:17-27`, `inspectionacceptancereport.js:28-49`), but the tracked migrations explicitly add only the item-group and receipt-line indexes (`20251202001000-add_item_group_to_purchase_order_items.js:24-45`). Actual production indexes must be inspected, not assumed. |
| F18 | **Medium** | **DEFER/NOT APPLICABLE** | There is no upload route or multipart handler in `api/` (verified by repository search). The 50 MB JSON limit is still an unnecessary memory/DoS exposure, not evidence of an upload bug. |

### Recommendations requiring measurement or a product decision

* Establish expected maximum rows, document size, export duration, and p95/p99 response targets before introducing a queue. The current stress tests are a useful starting point, not a production benchmark.
* Decide whether public self-registration is allowed. `signUp` currently creates any unauthenticated user (`api/resolvers/user.resolver.js:6-38`).
* Decide the retention and legal policy for supply-document data, audit records, logs, backups, and local print details.
* Decide whether user-visible cross-user IAR records with `createdBy IS NULL` should remain shared permanently or be assigned by a controlled migration.

## Critical deployment blockers

Do **not** deploy until P0-01 through P0-08 are accepted: dependency integrity, no automatic schema alteration, a working migration ledger, secure config/session settings, server-side RBAC and ownership authorization, GraphQL/HTTP abuse controls, atomic identifier allocation, transactional writes, and a clean production build.

## cPanel hosting prerequisite gate

Do not schedule production deployment until the administrator confirms in writing:

1. Whether a supported persistent Node application service exists, its supported Node version, startup-file convention, application root, assigned port/socket behavior, and the documented restart/log locations.
2. Whether the frontend and API will use one origin with an administrator-managed `/graphql` proxy, or two named HTTPS domains. If a proxy is requested, confirm that it is server-level configuration, not a `.htaccess` workaround.
3. The frontend document root, the API location outside that web root, and which account owns the files/process. Verify writable locations before introducing any generated-file feature.
4. TLS certificate coverage and forced HTTPS for every public frontend/API hostname.
5. MySQL hostname, database name, account/privileges, connection policy, backup facility/retention, and whether database TLS/CA configuration is required. Use the actual cPanel database names (which may be account-prefixed), not guessed `localhost` values.
6. Whether SSH/cPanel Terminal is available for `npm ci`, migration, and restart steps. If not, identify the administrator-owned deployment procedure before release.

A “yes” to cPanel access is not proof of any one of these capabilities. If an item is unavailable, use the stated alternative or stop the rollout; do not silently change the application’s security or process model.

## Executor rules

1. Keep every task below isolated: complete only one task/commit-sized chunk before beginning the next.
2. Before editing, inspect the listed current files and `git status --short`; this plan is evidence-based but the code may have changed.
3. Never overwrite, stage, reset, or reformat unrelated user changes. In particular, preserve the three modified IAR print files and do not add `app/dist.7z`.
4. Run **only** the validation commands listed in the current task, plus their stated prerequisites. Never point stress tests at production.
5. Use environment variables and a non-production database for integration/stress validation. Never print `.env` values, session IDs, passwords, or dumps in logs/CI.
6. Commit only if explicitly asked. If asked, make an atomic commit containing only the completed chunk.
7. On a failed migration, stop rollout, restore from the verified backup, and use the task’s rollback note; never “fix” a production schema by re-enabling `sync({ alter: true })`.

---

## Execution status

| Task | Status | Started | Completed | Blockers / Notes |
|------|--------|---------|-----------|------------------|
| P0-01 | ✅ Completed | 2026-07-20 | 2026-07-20 | Added `cors@^2.8.5` as declared dependency. Upgraded API: `@apollo/server@4.13.0`, `express@4.22.2`, `mongoose@8.24.1`, `sequelize@6.37.8`, `path-to-regexp@0.1.13`. Frontend: `npm audit fix` applied (react-router, vite, rollup, minimatch, postcss, babel, etc. upgraded). Remaining: API - 3 moderate (uuid/@apollo/server 4.x EOL, needs 5.x breaking upgrade); Frontend - 9 moderate (esbuild/vite, uuid/x-data-grid-generator, yaml/@toolpad/core — all need --force breaking changes). Fixed TS build error in `InspectionAcceptanceReportForIAR.tsx:154`. |
| P0-02 | 🔄 In progress | 2026-07-20 | — | The initial config work is complete, but production CORS validation currently rejects valid `https://` origins because it treats `//` as a path. Correct the parser and complete cPanel topology, provider-port, HTTPS-cookie, and staging-like evidence before marking complete. |
| P0-03 | ✅ Completed | 2026-07-20 | 2026-07-20 | Created `api/auth/authorization.js` with `requireAuthenticated`, `requireRole`, `getCurrentUser` helpers (GraphQLError with UNAUTHENTICATED/FORBIDDEN codes). Role resolver: admin-only for all mutations. User resolver: admin-only signUp/createUser/deleteUser; editUser restricted (self safe fields, admin for role/dept/position); passwords require current_password confirmation for self. Department resolver: admin-only mutations. Signatory resolver: admin-only mutations. Added `current_password` to EditUserInput typeDef. Created email-unique migration file `20260720-add-email-unique-to-users.js`. |
| P0-04 | ✅ Completed | 2026-07-20 | 2026-07-20 | Added `ownershipScope`, `authorizeOwnership`, `authorizeOwnershipBatch` to `api/auth/authorization.js` with admin bypass for createdBy-based ownership. Applied to all 4 resolvers: IAR (18 mutations + getIARItemsByIarId), PAR (7 mutations), RIS (6 mutations), PO (16 queries/mutations + revertIARBatch). All `isAuthenticated` calls replaced with centralized helpers. Missing queries (propertyAcknowledgmentReport, requisitionIssueSlip) now have ownership scope. |
| P0-05 | ✅ Completed | 2026-07-20 | 2026-07-20 | Added `helmet`, `express-rate-limit`, `graphql-depth-limit` packages. Updated `api/config.js` with rate-limit and depth settings. Updated `api/index.js`: helmet security headers, general + login rate limiting, GraphQL depth limit (10), introspection disabled in production, production-safe `formatError` with correlation ID logging. Body limit reduced from 50mb to 1mb (configurable). CORS already handled in P0-02. |
| P0-06 | ✅ Completed | 2026-07-20 | 2026-07-20 | Removed `syncTables()` from `connectDB.js` (was unused in runtime). Created `api/scripts/migrate.js` with `_migrations` ledger table, deterministic filename ordering, `up`/`down` support, `--check` verification, `--down` rollback. Replaced missing `add_income.js → 20260128000001-add-income-mds-details-to-iar.js`. Made 3 non-idempotent + 1 buggy-index-check migration idempotent. Removed broken `run_all_migrations.js`. Fixed `module.exports` → ESM exports. Cleaned 62 duplicate email indexes created by `sync({ alter: true })`. All 17 migrations applied; second run is no-op. |
| P0-07 | ✅ Completed | 2026-07-21 | 2026-07-21 | Created `id_counters` table (type/year/scope/counter) for atomic `SELECT ... FOR UPDATE` allocation. Created `api/utils/atomicIdGenerator.js` with `nextIarId`, `nextParId`, `nextRisId`, `nextIcsId`. Updated all 4 resolver files to use atomic generator. Removed old process-global generators and `resetXxxBatch` calls. Deleted 4 old generator files (`iarIdGenerator.js`, `parIdGenerator.js`, `risIdGenerator.js`, `icsIdGenerator.js`). Verified ID formats match originals. Note: document IDs repeat across line items (one document = multiple rows), so unique indexes on ID columns are not applicable. |
| P0-08 | ✅ Completed | 2026-07-21 | 2026-07-21 | Wrapped `updatePurchaseOrder` in explicit `sequelize.transaction()` with `FOR UPDATE` row lock on PO items and strict over-receipt guard (throws instead of silent clamp). Added `FOR UPDATE` locking to source item queries in PAR/RIS/IAR split/assign/create functions. Transactions passed to all `nextXxxId()` calls in mutation functions. Idempotency key table deferred — requires product decision on retry semantics. |
| P1-09 | 🔲 Not started | — | — | Depends on P0-04, P0-06 |
| P1-10 | 🔲 Not started | — | — | Depends on P0-05, P0-08 |
| P1-11 | 🔲 Not started | — | — | Depends on P0-02, P0-03, P0-05 |
| P1-12 | 🔲 Not started | — | — | Depends on P1-09, P1-11 |
| P1-13 | 🔲 Not started | — | — | Depends on P0-02, P0-05 |
| P1-14 | 🔲 Not started | — | — | Depends on P0-04, P0-05, P0-06, P0-08, P1-12, P1-13 |
| P1-15 | 🔲 Not started | — | — | Depends on P0-02, P0-05, P0-07, P1-13 |
| P2-16 | 🔲 Not started | — | — | Depends on P0-06, P1-13 |
| P2-17 | 🔲 Not started | — | — | Depends on P0-01..P0-08, P1-11 |
| P2-18 | 🔲 Not started | — | — | Depends on P1-10, P1-11, P1-13 |

**Legend:** 🔲 Not started | 🔄 In progress | ✅ Completed | ❌ Blocked

### cPanel release resume ledger

Use the execution-status table as the release resume ledger; do not create a separate untracked checklist. Before pausing or handing off a task, record its status, UTC/local timestamp, operator, exact artifact/release identifier or checksum, chosen topology, migration ledger result, backup/restore evidence, health/smoke result, rollback owner, and sanitized blocker. Record only variable names and log locations—not credentials, cookies, database dumps, or raw GraphQL variables. A new operator resumes from the first unfinished **MUST BEFORE DEPLOY** or **REQUIRED FOR CPANEL DEPLOYMENT** task, rechecks the prerequisite gate and `git status --short`, and repeats any stale release evidence after an artifact, environment, domain, database, or host-control change.

## Deployment classification

Priority labels describe implementation risk, not cPanel release order. **MUST BEFORE DEPLOY** means complete or re-verify for this release; a completed task still needs its listed production evidence.

| Existing task | Classification | cPanel release direction |
|---|---|---|
| P0-01 reproducible installation/dependency integrity | **MUST BEFORE DEPLOY** | Re-run clean API/app installs and production audit policy on the actual supported Node version. Document remaining non-exploitable moderate findings and compensating controls. |
| P0-02 fail-fast configuration | **MUST BEFORE DEPLOY** | Correct CORS parsing; verify provider `PORT`, domain, HTTPS, CORS, and cookie settings. |
| P0-03 RBAC | **MUST BEFORE DEPLOY** | Re-run anonymous/user/admin smoke checks after public deployment. |
| P0-04 ownership/anti-IDOR | **MUST BEFORE DEPLOY** | Re-run cross-user read/mutation checks in staging before public data is exposed. |
| P0-05 perimeter controls | **MUST BEFORE DEPLOY** | Preserve headers, body/depth/rate/error safeguards; keep one API process and do not add Redis solely for cPanel. |
| P0-06 tracked migrations | **MUST BEFORE DEPLOY** | Use one cPanel-terminal or administrator-managed migration execution with tested backup/restore. |
| P0-07 atomic document IDs | **MUST BEFORE DEPLOY** | Re-verify database atomicity; one API process does not remove this requirement. |
| P0-08 transactional writes | **MUST BEFORE DEPLOY** | Preserve transactional safeguards; the deferred idempotency product decision remains documented. |
| P1-09 pagination/SQL aggregates/index verification | **RECOMMENDED POST-LAUNCH** | Measure representative data first; promote a measured cPanel memory/time risk to must-fix. |
| P1-10 server contracts/safe document rendering | **MUST BEFORE DEPLOY** | Preserve XSS/output encoding and critical server validation; broader workflow coverage may follow. |
| P1-11 client auth/errors/build output | **MUST BEFORE DEPLOY** | Remove sensitive variable logging, validate server session, apply source-map policy, and build static assets. |
| P1-12 cancellable client workloads | **RECOMMENDED POST-LAUNCH** | Measure and cap the heaviest visible workflow before adding broad cancellation architecture. |
| P1-13 structured observability | **REQUIRED FOR CPANEL DEPLOYMENT** | Require redacted stdout/stderr capture, log location/retention, correlation-friendly errors, and health/readiness endpoints; defer external dashboards and alerts. |
| P1-14 dedicated heavy-job execution | **DEFER/NOT APPLICABLE** | No queue or worker for this release; revisit only after measurement and host confirmation. |
| P1-15 production web tier/process model | **REQUIRED FOR CPANEL DEPLOYMENT** | Use the cPanel static-artifact and hosting-managed API runbook below. |
| P2-16 backup/restore/migration/incident runbook | **MUST BEFORE DEPLOY** | Require host-supported backup and one restore drill; document accepted RPO/RTO if the product lacks PITR or automated off-host backup. |
| P2-17 CI and focused tests | **RECOMMENDED POST-LAUNCH** | Retain local clean-build/migration/security smoke evidence now; add CI and comprehensive test infrastructure after launch. |
| P2-18 accessibility/product-operability | **RECOMMENDED POST-LAUNCH** | Perform basic sign-in/critical workflow error-state and keyboard smoke checks now; schedule the complete audit after launch. |

---

## Prioritized, independently executable chunks

### P0-01 — Restore reproducible package installation

* **Priority/risk:** P0 blocker — clean deployments may not start.
* **Exact goal:** Make every runtime import a declared, lockfile-pinned dependency; produce a known-clean install baseline without blindly applying breaking audit fixes.
* **Files/symbols to inspect/change:** `api/package.json`, `api/package-lock.json`, `app/package.json`, `app/package-lock.json`; `api/index.js` import of `cors`.
* **Implementation steps:**
  1. Inspect `api/index.js` imports against `api/package.json`; confirm `cors` is the only missing direct runtime package.
  2. Add the compatible `cors` version as a production dependency using npm, updating only API manifest/lockfile.
  3. Create a short dependency remediation record in the release/CI documentation added by P2-17: list the audit package, advisory, compatible target version, and regression risk.
  4. Upgrade direct vulnerable dependencies one package family at a time; do not use `npm audit fix --force`. Start with API critical/high packages, then frontend direct high packages. Read changelogs and adjust code when a major upgrade requires it.
  5. Re-run audit after each package family and retain only intentional, documented transitive exceptions with a target removal date.
* **Security/correctness considerations:** `cors` must be declared, not relied on as an accidental transitive package. A lockfile update can change transitive dependencies; review it before accepting. Do not claim zero vulnerabilities until the audit proves it.
* **Acceptance criteria:** `npm ci` works from both app directories; API has `cors` declared; no critical production audit finding remains; any remaining high finding has an explicit remediation issue and compensating control.
* **Exact targeted validation commands:**
  ```powershell
  Set-Location 'C:\Users\markm\Desktop\FINAL SUPPLY\api'; npm ci; npm ls cors --depth=0; npm audit --omit=dev
  Set-Location 'C:\Users\markm\Desktop\FINAL SUPPLY\app'; npm ci; npm audit --omit=dev
  ```
* **Estimated scope:** 1–3 small commits; 30–120 minutes depending on upgrade compatibility.
* **Dependencies:** None.
* **Rollback:** Revert only the package-family commit that fails its targeted build/smoke test; retain the `cors` declaration unless the API no longer imports it.

### P0-02 — Add fail-fast, environment-specific configuration

* **Priority/risk:** P0 blocker — currently insecure defaults and hard-coded network settings.
* **Exact goal:** Centralize validated server configuration and remove all production-sensitive hard-coded endpoint/origin/port/cookie settings.
* **Files/symbols to inspect/change:** `api/index.js:25-60,90-106,150`; `api/db/connectDB.js:5-55`; root/API/app PM2 configs; `app/src/apollo/client.ts:5-10`; `.gitignore`; add tracked `api/.env.example` and `app/.env.example` containing names only.
* **Implementation steps:**
  1. Add an API configuration module that validates nonempty `MYSQL_*`, `SESSION_SECRET`, `PORT`, `CORS_ORIGINS`, and `NODE_ENV` at startup; reject a short/default session secret in production.
  2. Parse `CORS_ORIGINS` as exact origins. In production reject localhost, ngrok, and path-bearing values; keep local origins only in development example values.
  3. Read `PORT` from config; set `app.set('trust proxy', 1)` only when deployment is behind the documented proxy.
  4. Set cookie `secure` from production/TLS config, use `httpOnly`, `sameSite: 'lax'` for same-site deployments (or `none` plus `secure` only when cross-site is required), and use a deployment-specific cookie name.
  5. Move the frontend GraphQL URI to `VITE_GRAPHQL_URL`; use same-origin `/graphql` in the production example only when the administrator provides the server-level proxy. Fail the production build if the value is absent or uses plaintext HTTP outside a local-development mode.
  6. Keep `.env` ignored; rotate secrets only through the deployment secret store, never by committing real values.
  7. Correct production CORS validation so it accepts only canonical, exact origins (scheme + host + optional port) and rejects localhost, ngrok, credentials, query/fragment, or a pathname other than `/`. Do not reject the `//` in a valid `https://` URL. Parse each value with `new URL`, require `url.origin === suppliedValue` (or an explicitly normalized no-trailing-slash equivalent), and require `https:` in production. Keep `credentials: true`; never use `*`.
  8. Treat `MYSQL_PASSWORD` as required and nonempty in production unless the hosting administrator explicitly documents an account that has no password (which must not be used for a public deployment). Validate an integer provider-assigned `PORT` when TCP is used. Keep a long random `SESSION_SECRET` only in protected hosting configuration, never in `.env.example`.
  9. Document this production variable inventory in the plan, using names only: `NODE_ENV=production`; provider-assigned `PORT` when applicable; `MYSQL_HOST`, `MYSQL_USER`, `MYSQL_PASSWORD`, `MYSQL_DATABASE`; `SESSION_SECRET`; `SESSION_COOKIE_NAME`; `SESSION_COOKIE_SECURE=true`; `SESSION_COOKIE_SAMESITE`; `CORS_ORIGINS`; `TRUST_PROXY`; `BODY_LIMIT`; `RATE_LIMIT_WINDOW_MS`; `RATE_LIMIT_MAX`; `RATE_LIMIT_LOGIN_MAX`; and `GRAPHQL_MAX_DEPTH`. `VITE_GRAPHQL_URL` belongs to the frontend build, is public, and must be one of the two approved topology values.
  10. For a same-origin proxy, set `VITE_GRAPHQL_URL=/graphql`; the browser does not need cross-origin CORS. For a separate API hostname on the same registrable site (for example `app.example.org` and `api.example.org`), set `CORS_ORIGINS=https://app.example.org`, keep `credentials: 'include'`, keep the API cookie host-only, and use `SESSION_COOKIE_SECURE=true` with `SESSION_COOKIE_SAMESITE=lax`. Confirm this behavior in target browsers. For genuinely cross-site domains, avoid the topology where possible; if it is required, use `SameSite=None` and `Secure`, exact CORS, and test third-party-cookie behavior explicitly before launch.
* **Security/correctness considerations:** Cookie `secure: true` requires HTTPS and correctly configured proxy trust. Do not allow `*` CORS with credentials. Browser CORS is not an authorization boundary.
* **Acceptance criteria:** API refuses invalid production configuration before listening; no private IP or ngrok origin is hard-coded in production source; production cookie config is secure; client has no hard-coded LAN API endpoint. With `NODE_ENV=production`, a valid `https://frontend.example.org` CORS origin starts successfully, while a localhost/path/query/fragment/wildcard origin fails before listening; a browser completes the selected HTTPS cookie flow. A separate deployment proves that the bundled `VITE_GRAPHQL_URL` has no localhost, LAN IP, or `http://` production value.
* **Exact targeted validation commands:**
  ```powershell
  Set-Location 'C:\Users\markm\Desktop\FINAL SUPPLY\api'; node --check index.js; npm start
  Set-Location 'C:\Users\markm\Desktop\FINAL SUPPLY\app'; npm run build
  ```
  For the API smoke test, run with a non-production `.env` that has all required keys and stop it after confirming the startup log; repeat once with `NODE_ENV=production` and a deliberately missing key to confirm fail-fast behavior.
* **Estimated scope:** 3–6 files, 1 small commit.
* **Dependencies:** P0-01.
* **Rollback:** Restore the previous config module only in non-production; for a production cookie mismatch, correct proxy/TLS/env configuration before reverting security flags.

### P0-03 — Establish centralized GraphQL authentication and RBAC

* **Priority/risk:** P0 blocker — unauthenticated role management and authenticated privilege escalation.
* **Exact goal:** Enforce authentication and server-side `admin`/`user` permissions for every resolver, with no security decision based on frontend routes.
* **Files/symbols to inspect/change:** add `api/auth/authorization.js` (or equivalent); all `api/resolvers/*.js`; `api/models/user.model.js`; `api/typeDefs/user.typeDef.js`; `app/src/auth/config/role.ts` only for aligned UX.
* **Implementation steps:**
  1. Create reusable `requireAuthenticated(context)`, `requireRole(context, ...roles)`, and `getCurrentUser(context)` helpers that produce stable public GraphQL error codes/messages.
  2. Apply `requireRole('admin')` to all role, user, department, and signatory administration reads/writes. Apply the documented policy to PO/history/issuance operations; explicitly map each operation in a policy table in code tests.
  3. Restrict `editUser`: users may update only safe profile fields on their own record; only admins can change another user, `role`, active status, or reset a password. Require current-password confirmation for a self password change.
  4. Decide and implement one registration policy: remove public `signUp`, gate it behind an invite/bootstrap workflow, or create inactive accounts that an admin activates. Never permit role selection in a public path.
  5. Add a database unique migration for normalized email and convert duplicate-email failures into a generic conflict response. Before migration, run a read-only duplicate report and resolve duplicates explicitly.
  6. Retire duplicate inline `context.isAuthenticated()` checks only after all tests prove the helper covers the route; do not leave a resolver unguarded.
* **Security/correctness considerations:** Never trust `session.user.role` in the browser. Normalize email consistently before unique lookup/indexing. Do not return password hashes in any GraphQL type or log.
* **Acceptance criteria:** anonymous role mutation is rejected; a normal user cannot create/edit/delete users or roles and cannot assign self `admin`; admin operations work; email uniqueness is enforced by MySQL.
* **Exact targeted validation commands:**
  ```powershell
  Set-Location 'C:\Users\markm\Desktop\FINAL SUPPLY\api'; node --check resolvers\user.resolver.js; node --check resolvers\role.resolver.js
  Set-Location 'C:\Users\markm\Desktop\FINAL SUPPLY\stress-test'; node injection-test.js
  ```
  Add and run a focused GraphQL authorization integration script using separate anonymous, user, and admin cookie jars against a disposable database; it must assert the acceptance cases above.
* **Estimated scope:** 6–12 files plus one migration; 2–4 small commits.
* **Dependencies:** P0-02 and P0-07 for the unique-index migration.
* **Rollback:** Revert policy changes only as a coordinated release if legitimate roles are blocked; do not drop the email unique index after real duplicate cleanup without a data review.

### P0-04 — Enforce object ownership and anti-IDOR authorization

* **Priority/risk:** P0 blocker — ownership-scoped UI lists do not protect direct GraphQL mutation/query calls.
* **Exact goal:** A user can read or mutate only records they own (plus explicitly approved legacy/null records); admin behavior must match the product decision.
* **Files/symbols to inspect/change:** `api/resolvers/inspectionacceptancereport.resolver.js`, `propertyacknowledgementrepoert.resolver.js`, `requisitionissueslip.resolver.js`, `purchaseorder.resolver.js`; the ownership helper from P0-03; relevant typeDefs and client queries.
* **Implementation steps:**
  1. Write a resolver inventory: every query/mutation that accepts IAR/PAR/ICS/RIS/PO item IDs, IAR IDs, or arrays of IDs gets an owner check before reads/updates.
  2. Implement reusable scoped `where` builders and a “load for update and authorize” helper. For `IN` arrays, verify the returned authorized-row count exactly matches requested unique IDs; reject mixed or missing IDs rather than partially mutating.
  3. Fix `getIARItemsByIarId` to apply the same owner scope used by list queries. Apply scope to returned rows after mutation too.
  4. For each clone/split/append flow, set both `createdBy` and `updatedBy` from the authenticated identity. Do not accept either field from GraphQL input.
  5. Confirm the documented null-owner compatibility rule is intentionally implemented and add an expiry/backfill plan. Do not silently grant an admin bypass unless the product owner approves it.
* **Security/correctness considerations:** Ownership must be checked in the same transaction as the mutation. A client-supplied `id` is untrusted. Restrict PO and history visibility as well if they disclose another user’s IAR data.
* **Acceptance criteria:** user B cannot fetch, update, split, assign, or print user A’s record by guessing an ID/IAR ID; legacy null-owner behavior follows the approved policy; authorized operations still return complete data.
* **Exact targeted validation commands:**
  ```powershell
  Set-Location 'C:\Users\markm\Desktop\FINAL SUPPLY\api'; node --check resolvers\inspectionacceptancereport.resolver.js; node --check resolvers\propertyacknowledgementrepoert.resolver.js; node --check resolvers\requisitionissueslip.resolver.js
  ```
  Run the focused authorization integration script from P0-03 with cross-user read and mutation cases for IAR, PAR, ICS, RIS, no-category, and history.
* **Estimated scope:** 5–8 files; 2–3 small commits.
* **Dependencies:** P0-03.
* **Rollback:** Feature-flag only the legacy null-owner compatibility clause if it blocks historical work; never disable ownership checks for newly owned records.

### P0-05 — Put HTTP and GraphQL resource controls at the perimeter

* **Priority/risk:** P0 blocker — arbitrary GraphQL work, error disclosure, and excessive body size remain exposed.
* **Exact goal:** Enforce a production-safe HTTP/GraphQL boundary with headers, exact CORS, request limits, rate limits, query depth/complexity limits, and stable public errors.
* **Files/symbols to inspect/change:** `api/index.js:67-129`, `api/package.json`, API config module; add a narrow GraphQL validation/error module and focused integration tests.
* **Implementation steps:**
  1. Add maintained production dependencies for security headers, rate limiting, and GraphQL query validation only after compatibility review.
  2. Install security headers before GraphQL; configure CSP deliberately for the API (not a guessed SPA CSP), HSTS only under TLS, `nosniff`, referrer policy, and frame policy.
  3. Replace the 50 MB global JSON limit with the measured maximum GraphQL JSON size (start low, e.g. 1 MB, and justify any increase). Keep uploads unavailable unless a dedicated authenticated upload design is approved.
  4. Configure a rate limit keyed safely for a proxied deployment: stricter login limits, a moderate general GraphQL limit, and a body-size rejection metric. Do not use an in-memory limiter when multiple PM2 workers need a shared limit; choose an appropriate shared store or keep one API process.
  5. Add maximum depth, alias count, token/complexity, and request-time budget validation. Add production error formatting that logs a correlation ID server-side but exposes only stable safe messages/codes.
  6. Disable introspection and landing-page tooling in production unless an approved authenticated operational workflow requires it.
* **Security/correctness considerations:** Limits must accommodate documented batch operations; measure their maximum payload before finalizing. Do not rate-limit trusted health checks. Do not log raw GraphQL variables.
* **Acceptance criteria:** oversized body, malformed JSON, over-depth query, excess aliases, and repeated failed login receive controlled 4xx/GraphQL errors; internal SQL/stack text is absent from responses; allowed production origin works with credentials and an unlisted origin fails.
* **Exact targeted validation commands:**
  ```powershell
  Set-Location 'C:\Users\markm\Desktop\FINAL SUPPLY\api'; node --check index.js; npm start
  Set-Location 'C:\Users\markm\Desktop\FINAL SUPPLY\stress-test'; node injection-test.js
  ```
  Against a disposable local server, use `curl.exe` to send one allowed-origin preflight, one rejected-origin preflight, a malformed JSON body, and a query above the configured depth; record expected status/codes in the integration test.
* **Estimated scope:** 3–6 files; 1–2 small commits.
* **Dependencies:** P0-01 and P0-02.
* **Rollback:** Raise a measured threshold temporarily if a legitimate batch is rejected; do not remove all query/body/rate controls.

### P0-06 — Replace automatic schema alteration with tracked migrations

* **Priority/risk:** P0 blocker — boot-time DDL and an invalid migration runner risk data/schema drift.
* **Exact goal:** Application startup performs connectivity checks only; a single migration tool maintains ordered, recorded, reversible schema changes.
* **Files/symbols to inspect/change:** `api/index.js:73-75`, `api/db/connectDB.js:79-88`, `api/scripts/migrate.js`, all `api/migrations/*.js`, `api/package.json`, deployment docs.
* **Implementation steps:**
  1. Remove `syncTables()` from runtime startup and prohibit `sequelize.sync({ alter: true })` in production code.
  2. Inventory migrations against model fields and the target database. Repair the missing `20260128000001` import by restoring the exact intended migration from source history or removing the invalid import only after proving its schema change is represented elsewhere.
  3. Adopt one migration runner with a persistent migration ledger table, deterministic filename ordering, locking/serialization, and `up`/`down` support. Do not manually curate a partial import list.
  4. Make every migration idempotent only where necessary and fail loudly on unexpected schema state. Never use broad catch-and-ignore around destructive changes.
  5. Add a read-only schema verification command that compares required tables, columns, foreign keys, indexes, and unique constraints against expected migrations.
* **cPanel migration/database release requirements:** Before the first release and every schema/data migration, identify the cPanel/managed-MySQL backup mechanism, account owner, retention, restore requester, and a non-production restore target. Confirm the API database account has only the application privileges it needs; a migration account may need controlled DDL privileges and must not be embedded in source. Confirm the real MySQL host and whether server/CA TLS is required; do not assume `127.0.0.1` or disable certificate validation. Run `npm run migrate:check`, back up, migrate once, verify the migration ledger, and smoke-test. Perform at least one documented restore drill before go-live. If the host cannot provide a recoverable backup/restore path, deployment is blocked.
* **Security/correctness considerations:** Take a tested backup before any migration. Run migrations once per release through the cPanel terminal or administrator-managed procedure, never from application startup or concurrent Node workers. Migration reversibility is not a substitute for a restore plan after data transformations.
* **Acceptance criteria:** API starts without DDL; clean disposable DB migrates from zero to latest exactly once; a second migrate is a no-op; migration ledger lists every applied migration; current production schema discrepancies are reported before deployment.
* **Exact targeted validation commands:**
  ```powershell
  Set-Location 'C:\Users\markm\Desktop\FINAL SUPPLY\api'; npm run migrate:check; npm run migrate
  Set-Location 'C:\Users\markm\Desktop\FINAL SUPPLY\api'; npm start
  ```
  Run `npm run migrate` twice against a disposable database specified only through local environment variables. Run `node --check scripts\migrate.js` before it.
* **Estimated scope:** 6–20 files depending on migration history; 2–5 small commits.
* **Dependencies:** P0-02.
* **Rollback:** Use the runner’s verified down migration only for schema-only changes; restore the pre-migration backup for data-changing migrations.

### P0-07 — Make document identifier allocation atomic

* **Priority/risk:** P0 blocker in clustered/concurrent deployment — duplicate IAR/PAR/ICS/RIS IDs.
* **Exact goal:** Allocate every business document number atomically in MySQL and enforce uniqueness at the appropriate counter/document scope.
* **Files/symbols to inspect/change:** `api/utils/atomicIdGenerator.js`, all resolver callers, `id_counters` migration/model, and relevant document models.
* **Implementation steps:**
  1. Specify each identifier’s immutable format, scope, reset period, and whether one ID groups multiple rows. Preserve existing formats unless a business-approved migration changes them.
  2. Add a compact counter table keyed by document type, year, month when needed, campus/tag scope when needed. Use a single transaction and row lock/upsert to increment and return the next value.
  3. Add the appropriate unique counter/header/index constraint. Where a document ID is intentionally repeated across line rows, use the counter or a document header/composite rule; do not incorrectly make every repeated IAR line unique.
  4. Replace all read-latest generators and remove process-global `lastGenerated*` state/reset functions. Allocate inside the existing mutation transaction and pass that transaction into `atomicIdGenerator`.
  5. Add a duplicate-report migration preflight and resolve existing duplicates deliberately before enabling a conflicting unique index.
* **Security/correctness considerations:** `MAX(id)+1`, “latest row,” JavaScript locks, and PM2 worker memory cannot guarantee uniqueness. Treat unique-key collision as retryable only when the transaction is safe to retry and idempotent.
* **Acceptance criteria:** parallel IAR, PAR, ICS (both tags), and RIS allocation produces unique monotonic identifiers in their specified scopes; IDs survive process restart and multiple API workers; normal multi-line document grouping remains intact.
* **Exact targeted validation commands:**
  ```powershell
  Set-Location 'C:\Users\markm\Desktop\FINAL SUPPLY\api'; node --check utils\atomicIdGenerator.js
  Set-Location 'C:\Users\markm\Desktop\FINAL SUPPLY\stress-test'; node db-stress-test.js
  ```
  Add a focused allocator integration script that invokes each allocation path concurrently against a disposable database and asserts no duplicate ID.
* **Estimated scope:** 7–12 files plus migration; 2–3 small commits.
* **Dependencies:** P0-06.
* **Rollback:** Keep old-format read compatibility; if allocation fails after release, stop writes and repair counter data from the highest committed identifiers rather than reintroducing process-local generators.

### P0-08 — Make receipt, split, and assignment writes transactionally correct

* **Priority/risk:** P0 blocker when heavy/batch work runs concurrently — stock/receipt quantities and history can diverge.
* **Exact goal:** Each multi-row mutation either commits all PO item, IAR/issuance, history, and identifier effects or commits none; competing updates cannot over-receive or double-assign.
* **Files/symbols to inspect/change:** `api/resolvers/purchaseorder.resolver.js:230-1067`, `inspectionacceptancereport.resolver.js:271+`, `propertyacknowledgementrepoert.resolver.js:152+`, `requisitionissueslip.resolver.js:69+`, history model/type, allocator from P0-07.
* **Implementation steps:**
  1. Inventory every mutation’s write set and transaction boundary. Priority flows: PO update receiving path, `generateIARFromPO`, `appendToExistingIAR`, IAR revert, and all PAR/ICS/RIS split/create/add/update flows.
  2. For each input ID, lock authorized source rows (`FOR UPDATE`) inside one transaction before calculating remaining quantity. Use conditional updates or version checks so `actualQuantityReceived` never exceeds quantity.
  3. Allocate document IDs in the same transaction, write all history in that transaction, and commit only after every row succeeds. Ensure every `catch` rolls back exactly once.
  4. Validate finite positive integer quantities, legal category/tag combinations, source ownership, and sum-of-splits before any write. Reject duplicate IDs in one request.
  5. Record the product decision for externally retried/batch mutations. If an idempotency key is approved later, store caller, operation, key, request hash, final response, and expiry; return the stored response for an identical retry and reject the same key with a different body. Do not claim this deferred feature is implemented for the cPanel release.
* **Security/correctness considerations:** Never silently clamp an invalid request and call it success; report remaining quantity conflict. History `changedBy` must come only from the server user and not dereference a missing `context.req.user`.
* **Acceptance criteria:** two concurrent attempts cannot over-receive or double-spend an item; a forced mid-operation failure leaves no partial rows/history/IDs; and the idempotency/retry product decision is explicitly recorded without claiming an unimplemented key produces a result.
* **Exact targeted validation commands:**
  ```powershell
  Set-Location 'C:\Users\markm\Desktop\FINAL SUPPLY\api'; node --check resolvers\purchaseorder.resolver.js; node --check resolvers\inspectionacceptancereport.resolver.js
  Set-Location 'C:\Users\markm\Desktop\FINAL SUPPLY\stress-test'; node db-stress-test.js; node full-flow-test.js
  ```
  Add a focused integration test that submits two concurrent receipt/split requests and injects a controlled failure after the second write.
* **Estimated scope:** 4–7 files plus tests/migration; 3–6 small commits.
* **Dependencies:** P0-03, P0-04, P0-06, P0-07.
* **Rollback:** Disable the affected mutation at the API boundary if invariants fail; restore only affected test data from backup/transaction audit, not by manually deleting partial rows.

### P1-09 — Paginate APIs, aggregate in SQL, and verify indexes

* **Priority/risk:** P1 high — the main heavy-work performance/capacity improvement.
* **Exact goal:** No production list or dashboard resolver materializes an unbounded table when a paged result or SQL aggregate is sufficient.
* **Files/symbols to inspect/change:** `api/typeDefs/purchaseorder.typeDef.js:234-249`, `inspectionacceptancereport.typeDef.js:175-181`, other typeDefs/resolvers; `app/src/graphql/queries/*`; `app/src/pages/index.tsx:20-78`; migration files.
* **Implementation steps:**
  1. Define a consistent page input/result shape with `limit` capped server-side, stable sort, cursor/offset semantics, `totalCount` only where necessary, and filter fields that match indexes.
  2. Convert large PO, item, IAR, issuance, history, user, signatory, and department lists incrementally; start with dashboard source queries and the largest grids.
  3. Replace `findAll` plus JavaScript sum/count/category/chart processing with SQL `COUNT`, `SUM`, grouped aggregate queries, and bounded date ranges.
  4. Capture `EXPLAIN ANALYZE`/`EXPLAIN` for each final query on a representative sanitized copy. Add only measured composite indexes such as soft-delete/scope/order/filter combinations; verify with `SHOW INDEX`.
  5. Use explicit `attributes`/`select` for list views; avoid loading large text fields or associations a grid does not render. Add DataLoader/batched field resolution only where profiling demonstrates GraphQL N+1.
* **Security/correctness considerations:** Cursor sort must be deterministic (include ID tie-breaker). Pagination must retain ownership filters. Index creation on a large table may lock/write-amplify; schedule it and test migration behavior.
* **Acceptance criteria:** all list endpoints have a capped page size; dashboard receives aggregates rather than whole tables; representative query plans use intended indexes; no visible record is skipped/duplicated while paging.
* **Exact targeted validation commands:**
  ```powershell
  Set-Location 'C:\Users\markm\Desktop\FINAL SUPPLY\app'; npm run build
  Set-Location 'C:\Users\markm\Desktop\FINAL SUPPLY\stress-test'; node full-flow-test.js; node db-stress-test.js
  ```
  Run documented read-only `EXPLAIN` and `SHOW INDEX FROM ...` commands against the staging database for each changed query.
* **Estimated scope:** 8–20 files; split by resource into 3–5 commits.
* **Dependencies:** P0-04, P0-06.
* **Rollback:** Retain the old read query behind a temporary server-side feature flag only during migration; revert an index migration only after assessing live query impact.

### P1-10 — Add server-side input contracts and safe document rendering

* **Priority/risk:** P1 high — data integrity and stored-XSS defense.
* **Exact goal:** Validate business inputs at GraphQL boundaries and guarantee every document HTML interpolation is escaped exactly once.
* **Files/symbols to inspect/change:** `api/utils/sanitize.js`, all mutation resolvers/typeDefs; `app/src/utils/textHelpers.ts`; `app/src/components/printDocumentFiles/*.tsx`; preview files with `dangerouslySetInnerHTML`; affected modal/forms.
* **Implementation steps:**
  1. Choose one runtime schema validator and create named schemas per mutation, with length, enum, date, decimal, integer, array-size, and cross-field rules. Validation must reject rather than silently truncate accounting values.
  2. Keep ORM parameterization; do not replace it with home-grown SQL sanitization. Use a field allowlist for updates, never spread unvalidated GraphQL input into a model.
  3. Decide which fields may contain plain text versus controlled rich text. Store plain text and escape at HTML sink; retain newlines with `nl2br(escapeHtml(value))`, not raw HTML.
  4. Audit every `${...}` in every print template and every `document.write` caller. Centralize escaping in `app/src/utils/textHelpers.ts`; remove template-local inconsistent helpers after compatibility checks.
  5. Keep `dangerouslySetInnerHTML` only where its value is built by the reviewed escape-plus-newline helper; otherwise render ordinary React text with `whiteSpace: 'pre-line'`.
  6. Test a payload containing tags, attributes, quotes, ampersands, and newlines in PO/item/signatory/purpose/details fields and verify it prints as text, not executable markup.
* **Security/correctness considerations:** Stripping tags before storage can destroy legitimate text and does not replace output encoding. Do not log rejected values if they might contain PII. Validate amount server-side from quantity × unit cost where the domain requires it.
* **Acceptance criteria:** invalid inputs return field-safe validation errors; no mass-assignment field reaches Sequelize; XSS probes do not execute in preview, print iframe, or popup; document formatting/newlines remain correct.
* **Exact targeted validation commands:**
  ```powershell
  Set-Location 'C:\Users\markm\Desktop\FINAL SUPPLY\api'; node --check utils\sanitize.js; node --check resolvers\purchaseorder.resolver.js
  Set-Location 'C:\Users\markm\Desktop\FINAL SUPPLY\app'; npm run build
  Set-Location 'C:\Users\markm\Desktop\FINAL SUPPLY\stress-test'; node injection-test.js
  ```
* **Estimated scope:** 10–25 files; split by mutation family/template family into 3–6 commits.
* **Dependencies:** P0-05 and P0-08.
* **Rollback:** Revert a narrowly scoped schema rule that rejects a documented legacy value, then add a migration/normalizer; never re-enable raw HTML interpolation.

### P1-11 — Harden client authentication state, errors, and production build output

* **Priority/risk:** P1 high — avoids credential/PII console leaks and stale browser authorization UX.
* **Exact goal:** The client derives session truth from the API, avoids logging secrets, handles errors/accessibility states consistently, and builds production assets without public source maps unless approved.
* **Files/symbols to inspect/change:** `app/src/apollo/client.ts`, `errorHandling.ts`, `auth/SessionContext.tsx`, `auth/authUtils.ts`, `auth/LoginService.ts`, `router/routes.tsx`, `layouts/dashboard.tsx`, `vite.config.ts`, sign-in/app content.
* **Implementation steps:**
  1. Remove Apollo console logging of operation variables and network errors containing sensitive request content. Surface a generic toast/UI state with correlation ID where available.
  2. On application load, call `authUser`; treat local storage only as optional display cache, clear malformed data safely, and clear UI state when server session is invalid.
  3. On logout, await server logout before local cleanup where possible; do not attempt to clear httpOnly cookies from JavaScript.
  4. Ensure the dashboard and every nested route has an authenticated layout guard and role-aware navigation. Keep API authorization as the source of truth.
  5. Set `build.sourcemap` false for production or configure authenticated error-reporting upload/source-map access. Move the endpoint to `VITE_GRAPHQL_URL` from P0-02.
  6. Add a root React error boundary and route error elements with retry/sign-in behavior; preserve existing loading states but display query errors rather than blank/stale dashboards.
* **Security/correctness considerations:** Never store bearer tokens in localStorage; this app uses a cookie session. UI role checks do not replace P0 authorization. Ensure callback URLs are same-origin to avoid open redirects.
* **Acceptance criteria:** a deleted/expired server session redirects safely after the auth check; password variables never appear in browser logs; a malformed localStorage session does not crash startup; production build does not ship source maps unless explicitly configured.
* **Exact targeted validation commands:**
  ```powershell
  Set-Location 'C:\Users\markm\Desktop\FINAL SUPPLY\app'; npm run build
  ```
  Manually test: expired cookie refresh, corrupted `localStorage.session`, logout in two tabs, an unauthorized API result, and a forced route-render error.
* **Estimated scope:** 6–10 files; 2 small commits.
* **Dependencies:** P0-02, P0-03, P0-05.
* **Rollback:** If the API auth bootstrap endpoint is unavailable, keep the client in a non-privileged signed-out state; do not fall back to trusting stored roles.

### P1-12 — Make heavy client workloads cancellable and usable

* **Priority/risk:** P1 high — heavy data/printing can freeze the browser despite low user count.
* **Exact goal:** Bound, measure, cancel, and progressively render expensive grid/chart/document/export work without inventing a backend queue prematurely.
* **Files/symbols to inspect/change:** `app/src/pages/index.tsx`, largest grid pages (`inventory.tsx`, `purchaseorder.tsx`, issuance pages), `app/src/utils/exportCsvpurchaseorderwithItems.ts`, print modal/template files, Apollo query options.
* **Implementation steps:**
  1. Instrument only safe timings/counts for dashboard aggregation, page load, print-template generation, and CSV export; define a budget (for example UI interaction <100 ms, foreground operation warning at 2 s).
  2. Consume P1-09 paged APIs with server-side DataGrid pagination/filter/sort. Do not render or export all rows until the user explicitly asks for a bounded export.
  3. Memoize expensive derived arrays only after profiling and use stable dependencies. Remove module-global mutable view data such as `pieChartData` in `pages/index.tsx:18,57-67`.
  4. Add `AbortController`/Apollo cancellation semantics where available when a page unmounts or a newer filter supersedes a request. Disable duplicate submit/print/export buttons while work is active and provide cancel/retry UI.
  5. Chunk large client exports/HTML generation or move them to P1-14’s worker decision once measurements exceed the budget. Cap input row counts and show users the selected range.
* **Security/correctness considerations:** Cancellation must not claim an aborted write was rolled back; only cancel idempotent reads/client-side generation. CSV cells must be neutralized against spreadsheet formula injection (`=`, `+`, `-`, `@`) in addition to HTML escaping.
* **Acceptance criteria:** filtering/navigating cannot apply stale query results; duplicate clicks create one operation; representative large grids remain responsive; large export/print reports progress or reject a documented cap rather than hanging.
* **Exact targeted validation commands:**
  ```powershell
  Set-Location 'C:\Users\markm\Desktop\FINAL SUPPLY\app'; npm run build
  Set-Location 'C:\Users\markm\Desktop\FINAL SUPPLY\stress-test'; node full-flow-test.js
  ```
  Run a browser performance recording on a staging-sized dataset and attach the operation timings to the release evidence.
* **Estimated scope:** 5–12 files; 2–4 small commits.
* **Dependencies:** P1-09 and P1-11.
* **Rollback:** Retain a simple non-virtualized view only for a small, documented fallback page size; do not restore unbounded client fetches.

### P1-13 — Add structured observability without PII leakage

* **Priority/risk:** P1 high — current `console.log`/`console.error` is noisy and exposes inputs/operation details.
* **Exact goal:** Produce structured, redacted logs, health checks, and correlation-friendly failure evidence for API/database/heavy-operation failures.
* **Files/symbols to inspect/change:** `api/index.js`, `api/db/connectDB.js`, all resolver console calls, cPanel/Node-app/Apache log documentation, deployment configuration; optional client error boundary.
* **Implementation steps:**
  1. Adopt one structured logger with request/correlation ID middleware. Log method/operation name, duration, status/error code, authenticated user ID hash (if necessary), and bounded row counts; never raw passwords, session IDs, GraphQL variables, SQL text, addresses, or document contents.
  2. Replace ad hoc resolver logs incrementally, beginning with auth, authorization denial, transaction rollback, identifier allocation, and migration events.
  3. Add unauthenticated liveness and dependency-aware readiness endpoints outside GraphQL with no internal details. Readiness must fail when the DB/session store is unavailable.
  4. Capture safe error-rate, rate-limit/body-limit rejection, database pool wait/timeout, transaction rollback, duplicate-ID conflict, and restart evidence where the confirmed host exposes it. Defer external metrics platforms, dashboards, and alerts unless already operated by the host.
  5. Identify the hosting-managed Node/Passenger/Apache stdout, stderr, access, and error logs; document their locations, access restriction, retention/rotation, and restart correlation. Confirm output is captured there and update the runbook with redaction and incident-use rules. Do not assume PM2 logs exist.
* **Security/correctness considerations:** Logs are a sensitive data store. Correlation IDs must be opaque and should not encode email/document data. Health endpoints need their own rate/proxy policy.
* **Acceptance criteria:** one failed request can be traced by correlation ID without exposing PII; readiness changes when dependencies fail; the approved operator can locate redacted current logs and correlate transaction/ID failures and restarts.
* **Exact targeted validation commands:**
  ```powershell
  Set-Location 'C:\Users\markm\Desktop\FINAL SUPPLY\api'; node --check index.js; npm start
  ```
  Use `curl.exe` against local health/readiness endpoints and execute one known validation failure; inspect logs for redaction.
* **Estimated scope:** 4–10 files plus deployment settings; 2 small commits.
* **Dependencies:** P0-02, P0-05.
* **Rollback:** Keep a minimal stderr fallback only if logger initialization fails; do not reintroduce request-variable logging.

### P1-14 — Decide and implement heavy-job execution only when measurements require it

* **Classification:** **DEFER/NOT APPLICABLE** for this cPanel release.
* **Priority/risk:** P1 high conditional — protects runtime/memory if batch document/export work exceeds request/UI budgets.
* **Exact goal:** Do not add a worker or queue for this release. Revisit only for workloads proven too heavy for a request/browser after the host confirms it can supervise a separate persistent worker.
* **Files/symbols to inspect/change:** add `api/jobs/*` and migration(s) only after the decision; affected document/export/batch resolver(s); `app/src` progress UI; PM2 deployment config; P1-12 measurements.
* **Implementation steps:**
  1. Define job candidates from measured evidence (for example >2 s request, >100 MB heap growth, or a document/export above the approved row cap). Record input/output, max runtime, max rows, retry policy, dedupe key, authorization owner, retention, and cancellation semantics.
  2. Prefer a database-backed jobs table and a dedicated worker process for this low-user-count deployment unless a proven shared queue service is already operated. Keep web/API workers separate from CPU-heavy workers.
  3. Submit a job transactionally with an idempotency key; return job ID/status. Authorize status/download/cancel by owner/admin policy.
  4. Enforce a cooperative cancellation flag, timeout, memory cap, bounded concurrency (start at one worker/job), exponential retry only for safe transient errors, and dead-letter/failed status with sanitized diagnostics.
  5. Persist generated output outside the web root with access-controlled, expiring retrieval. If output is sensitive, encrypt at rest according to the approved platform and delete at retention expiry.
* **Security/correctness considerations:** Never queue a mutation that may be executed twice without idempotency. Cancellation cannot undo already committed issuance; define “cancel before start” vs “stop generation only.” Do not put user payloads/secrets into job logs.
* **Acceptance criteria:** a qualifying large task does not block the GraphQL event loop; job progresses, cancels safely, retries safely, and does not exceed configured concurrency/memory; nonowners cannot read/cancel it.
* **Exact targeted validation commands:**
  ```powershell
  Set-Location 'C:\Users\markm\Desktop\FINAL SUPPLY\api'; npm start
  Set-Location 'C:\Users\markm\Desktop\FINAL SUPPLY\stress-test'; node full-flow-test.js
  ```
  Add a job integration test that simulates success, timeout, retry, duplicate submission, owner violation, and cancellation before/after start against non-production infrastructure.
* **Estimated scope:** 8–18 files plus migration/deployment config; 3–5 small commits.
* **Dependencies:** P0-04, P0-05, P0-06, P0-08, P1-12, P1-13.
* **Rollback:** Stop the dedicated worker and leave queued jobs visible but unprocessed; do not rerun unknown partial jobs automatically.

### P1-15 — Deploy safely on cPanel/shared hosting

* **Priority/risk:** required cPanel deployment work. The current PM2/Nginx guidance does not describe a shared-hosting service model; the frontend PM2 file starts Vite development mode.
* **Exact goal:** Publish an immutable static SPA and run one hosting-managed Node API process behind HTTPS, with a documented domain, process, log, restart, migration, and rollback path.
* **Files/symbols to inspect/change:** `app/package.json`, `app/vite.config.ts`, `app/src/apollo/client.ts`, `api/package.json`, `api/index.js`, `api/config.js`, `api/db/connectDB.js`, both `ecosystem.config.cjs` files, `.env.example` files, and the deployment documentation added by this task.
* **Implementation steps:**
  1. Obtain all answers in the cPanel hosting prerequisite gate. Record the chosen topology: **A** same-origin `/graphql` proxy supplied by the administrator, or **B** a distinct API HTTPS domain. Do not proceed with an unverified topology.
  2. Produce `app/dist` using `npm ci` and `npm run build` with the final public `VITE_GRAPHQL_URL`. For topology A use `/graphql`; for topology B use the exact `https://api.<real-domain>/graphql` URL. Inspect the built JavaScript for localhost/private-IP placeholders before publishing. Upload/copy only the resulting static artifact into the frontend document root.
  3. Place the following `.htaccess` in the **frontend static document root only**, adapting `RewriteBase` only if the SPA is intentionally served from a subdirectory. Confirm `mod_rewrite` is enabled. It is only SPA fallback; it must never start, proxy, restart, or supervise Node:

      ```apache
      Options -MultiViews
      RewriteEngine On
      RewriteBase /

      RewriteCond %{REQUEST_FILENAME} -f [OR]
      RewriteCond %{REQUEST_FILENAME} -d
      RewriteRule ^ - [L]

      RewriteRule ^ index.html [L]
      ```

      Do not add `ProxyPass`, `RewriteRule ... http://127.0.0.1`, Passenger directives, Node commands, broad cache rules, or guessed Apache modules to `.htaccess`. Ask the administrator to add any API proxy at the virtual-host/server layer. Keep the API source and `.env` outside the web root.
  4. If the provider offers Setup Node.js App/Passenger, configure its application root to `api/`, startup file to `index.js`, environment to production, and application variables through the provider’s protected environment-variable interface. Respect the port/socket assigned by that service: do not hard-code `4000` or override a provider-assigned `PORT`. Only add an explicit bind host after following the provider’s Node-app documentation. If a different supervised runtime is offered, document the equivalent startup, environment, graceful-stop, restart, and log behavior before use.
  5. Do **not** deploy either existing PM2 ecosystem configuration on cPanel. Preserve them only as historical/local artifacts until a separate cleanup decision. Use one API process initially. The existing Sequelize pool is sized from all CPU cores and can be excessive on a shared account; cap/minimize it only after the host’s MySQL connection limit and the selected process count are known. Never cluster merely to use all cores.
  6. Add and validate a small unauthenticated liveness endpoint (for example `/healthz`, process alive only) and a dependency-aware readiness endpoint (for example `/readyz`, verifies API can use its DB/session dependency without returning secrets). Put neither under GraphQL, rate-limit them separately, and return no stack traces, credentials, SQL, or topology data. The administrator must expose only the intended API health URL; do not expose an internal port.
  7. Identify the cPanel/Passenger/Apache error and access log locations, permissions, retention/rotation, and the documented restart control. Ensure application output is captured there. Do not rely on `api/logs` or PM2 log files unless the confirmed service explicitly writes them. Review logs after every restart without printing environment values, cookies, passwords, GraphQL variables, or database dumps.
  8. Run `npm run migrate:check`, take/verify the pre-release database backup, and run `npm run migrate` **once** from the API application root using the production environment. Never let concurrent Passenger workers or a request path run migrations. Restart only after a successful migration. If the migration fails, stop rollout and use the backup/rollback decision tree.
  9. Test HTTPS and forced redirects, static SPA deep links/refreshes, GraphQL queries, login/logout/session refresh, a privileged action, and a representative document workflow from the public frontend. Test after an API restart. Record the real release time, artifact checksum, migration result, health result, and rollback owner.
* **File-persistence rule:** Repository inspection found no upload route or multipart handler, so no upload directory is required for this release. Do not create one speculatively. If uploads, generated exports, or persistent document files are later introduced, add a separate design before implementation: a non-public storage path or object storage, owner/account permissions, size/type limits, malware scanning policy where required, authenticated download authorization, backup/retention, and a test that files survive the host’s restart/release process. Never store them in `app/dist`, the public document root, or ephemeral process storage.
* **Security/correctness considerations:** Do not enable `SESSION_COOKIE_SECURE=false` to work around an HTTPS/proxy mistake. No API, source map, `.env`, database dump, uploaded document, or log containing sensitive data may be placed in the static document root. cPanel resource limits and Passenger restarts make in-process background work unreliable.
* **Acceptance criteria:** a fresh browser can load a deep link without a 404; the built SPA contains no localhost/LAN API URL; API restart is performed by the confirmed hosting facility and returns ready afterward; all public paths are HTTPS; sessions and authorized GraphQL calls work with the chosen domain topology; health and error logs are locatable by the approved operator; and the fallback `.htaccess` never attempts to run Node.
* **Rollback:** retain the previous static artifact outside the document root and identify the previous Node application release/configuration. On a failed smoke test, put the previous static artifact and prior known-good API release back, restart through the approved host control, and restore the pre-release backup only when the migration/data decision tree requires it. Do not “roll back” by launching Vite or an SSH terminal process.

#### cPanel release smoke test

1. Confirm the approved frontend/API HTTPS URLs and certificate/redirect behavior.
2. From the API application root, run `npm run migrate:check`; take/confirm the backup; run `npm run migrate` once; record the result.
3. Build the SPA using the final `VITE_GRAPHQL_URL`; inspect the output for `localhost`, `127.0.0.1`, known LAN IPs, and `http://` API URLs. Publish the artifact only after it passes.
4. Restart the API through the confirmed cPanel Node-app/administrator mechanism. Locate the current logs and confirm no startup/config/database error.
5. Request public `GET /healthz` and `GET /readyz` over HTTPS. Confirm both return the documented success response and no secrets.
6. Load a non-root SPA route directly and refresh it. Confirm `.htaccess` returns the SPA, while a real asset still returns the asset.
7. Sign in through the public frontend, refresh the page, call a normal GraphQL read, perform one authorized critical workflow, and sign out. Verify that an unprivileged/cross-user action is denied.
8. If frontend/API are separate origins, test an allowed-origin credentialed request and a rejected-origin request; inspect browser cookie behavior. If same-origin proxy is used, test `/graphql` only through the public frontend host.
9. Restart the API once more and repeat readiness plus authenticated read. Record the result.
10. If any smoke test fails, stop rollout, preserve sanitized logs, execute the documented artifact/API rollback, and decide restore only from the migration/backup evidence.

### P2-16 — Establish backup, restore, migration, and incident runbooks

* **Priority/risk:** P2 required before final go-live — database recoverability is unverified.
* **Exact goal:** Make the host-supported backup, restore verification, migration, and incident path operationally repeatable. Point-in-time recovery is used only when the hosting product provides it.
* **Files/symbols to inspect/change:** the cPanel deployment runbook in this plan; `mysql script/` only as historical reference; migration tooling from P0-06; confirmed cPanel/Node-app/Apache documentation.
* **Implementation steps:**
  1. Before the first release and every schema/data migration, identify the cPanel/managed-MySQL backup mechanism, account owner, retention, restore requester, and a non-production restore target. Confirm the API database account has only the application privileges it needs; a migration account may need controlled DDL privileges and must not be embedded in source.
  2. Confirm the real MySQL host and whether server/CA TLS is required; do not assume `127.0.0.1` or disable certificate validation. Document the hosting product’s stated RPO/RTO, backup schedule, retention, and any available point-in-time recovery. If an automated encrypted off-host backup or PITR is unavailable, the owner must explicitly accept the resulting RPO/RTO before launch.
  3. Add a recurring restore drill into an isolated database, execute migration/schema verification, compare record counts/checksums for non-sensitive fixtures, and destroy drill data. If the host cannot provide a recoverable backup/restore path, deployment is blocked.
  4. Write a release order: backup → maintenance/write policy → migrate once → deploy → readiness/smoke checks → observe → rollback/restore decision.
  5. Document incident actions for unauthorized access, duplicate identifier, failed migration, data inconsistency, and secret rotation. Queue backlog is deferred with P1-14.
* **File-persistence rule:** Repository inspection found no upload route or multipart handler, so no upload directory is required for this release. Do not create one speculatively. If uploads, generated exports, or persistent document files are later introduced, add a separate design before implementation: a non-public storage path or object storage, owner/account permissions, size/type limits, malware scanning policy where required, authenticated download authorization, backup/retention, and a test that files survive the host’s restart/release process. Never store them in `app/dist`, the public document root, or ephemeral process storage.
* **Security/correctness considerations:** A backup not restored is not a backup. Do not store dumps/credentials in this repository or log restoration commands containing credentials.
* **Acceptance criteria:** a dated restore drill proves the stated RPO/RTO; migration rollback and full restore decision trees are documented; restore access is audited and least-privileged.
* **Exact targeted validation commands:**
  ```powershell
  Set-Location 'C:\Users\markm\Desktop\FINAL SUPPLY\api'; npm run migrate:check; npm run migrate
  ```
  Run the documented backup/restore commands only in the approved staging drill environment; attach the drill timestamp and outcomes to release evidence.
* **Estimated scope:** 2–4 documentation/automation files plus platform configuration; 1–2 commits.
* **Dependencies:** P0-06 and P1-13.
* **Rollback:** The runbook itself is versioned; restore rollback is the verified pre-release backup, not a schema guess.

### P2-17 — Build a CI quality gate and focused test suite

* **Priority/risk:** P2 high — existing stress scripts do not replace repeatable regression/security tests.
* **Exact goal:** Gate changes on reproducible install, type/build checks, resolver authorization/invariant tests, migrations, and a safe non-production smoke suite.
* **Files/symbols to inspect/change:** root `.github/workflows/` (create), `api/package.json`, `app/package.json`, `stress-test/`, test directories added beside their targets, docs/runbook.
* **Implementation steps:**
  1. Add separate API and app scripts for syntax/type/lint/test only after choosing tools compatible with the current stacks. Do not label `node --check` as comprehensive testing.
  2. Add API integration fixtures for: anonymous/admin/user RBAC, ownership/IDOR, login/logout/session fixation prevention, validation/error masking, document-number concurrency, quantity/split invariants, idempotency, and migration from blank DB.
  3. Add frontend tests for auth bootstrap/error boundary, role navigation, query loading/error/empty states, and escaping/print template output. Add accessibility checks for dialogs, form labels, keyboard focus, color/contrast, and error announcements.
  4. In CI: use `npm ci`, run dependency audit policy, run API checks/tests on disposable MySQL, migrate twice, run app build, and publish sanitized test reports. Keep stress tests manual/staging unless their credentials/data isolation are redesigned.
  5. Require a human-reviewed staging smoke checklist before production: auth/RBAC, new IAR/PAR/ICS/RIS flows, duplicate click/concurrency, print, backup health, readiness, and rollback path.
* **Security/correctness considerations:** CI secrets must come from the CI secret manager; do not use `stress-test/config.js` credentials or production endpoints. Test fixtures must never point to production.
* **Acceptance criteria:** pull requests cannot merge with install/build/migration/auth invariant failures; CI has no secrets in logs; staging smoke is recorded for releases.
* **Exact targeted validation commands:**
  ```powershell
  Set-Location 'C:\Users\markm\Desktop\FINAL SUPPLY\api'; npm ci; npm run migrate:check; npm run migrate
  Set-Location 'C:\Users\markm\Desktop\FINAL SUPPLY\app'; npm ci; npm run build
  Set-Location 'C:\Users\markm\Desktop\FINAL SUPPLY\stress-test'; npm ci; npm run test:quick
  ```
* **Estimated scope:** 8–20 files; 3–6 small commits.
* **Dependencies:** P0-01 through P0-08; frontend portions depend on P1-11.
* **Rollback:** If a new gate is initially flaky, quarantine only that test with an owner/deadline while keeping build/install/security gates enforced.

### P2-18 — Finish accessibility and product-operability review

* **Priority/risk:** P2 medium — ensures production is usable during ordinary and failure states.
* **Exact goal:** Standardize accessible forms/dialogs/tables, empty/loading/error states, print behavior, and operator-facing audit history.
* **Files/symbols to inspect/change:** affected `app/src/pages/*`, modals, `components/confirmationdialog.tsx`, print dialogs/templates, `globalStyle/style.css`, histories/resolvers/typeDefs.
* **Implementation steps:**
  1. Inventory forms and modals. Ensure labels connect to fields, errors are announced, focus is trapped/restored, destructive actions require clear confirmation, and keyboard-only users can operate grids/dialogs.
  2. Add consistent loading, empty, retry, and permission-denied states to query pages. Do not render a blank area on GraphQL error.
  3. Review visual contrast, table headers/scope, document title language, print popup/iframe cleanup, and blocked-popup/print-cancel feedback.
  4. Define which security/business events belong in immutable audit history (actor, action, object, before/after summary, timestamp, correlation ID), with field-level PII redaction and retention. Do not reuse noisy item history as a security audit log without a policy.
* **Security/correctness considerations:** Accessibility text should not expose data a user is unauthorized to see. Audit entries should be append-only at the application/database permission level and cannot store passwords/session data.
* **Acceptance criteria:** keyboard and screen-reader spot checks pass for sign-in, PO receipt, assignment, print, and admin flows; every main page has visible loading/empty/error behavior; audit requirements have an approved retention/immutability design.
* **Exact targeted validation commands:**
  ```powershell
  Set-Location 'C:\Users\markm\Desktop\FINAL SUPPLY\app'; npm run build
  ```
  Perform documented browser keyboard/screen-reader checks on staging; run print smoke tests in supported browsers.
* **Estimated scope:** 8–25 files; split by page workflow into 3–5 commits.
* **Dependencies:** P1-10, P1-11, P1-13.
* **Rollback:** Revert only the affected view commit if a workflow regresses; preserve any security audit migration after data-impact review.

## Release evidence checklist

Before cPanel production approval, attach: confirmed hosting-prerequisite responses; selected topology and exact public domains; Node runtime/startup/restart/log evidence; protected environment-variable inventory (names only); static artifact checksum and proof of no localhost/LAN URL; `.htaccess` SPA deep-link result; HTTPS/certificate/redirect result; CORS and cookie-session result; migration check/ledger result; pre-release backup and restore-drill timestamp; `/healthz` and `/readyz` result; public login/RBAC/document smoke results; final log review; final `git status --short`; and the named change/rollback owner. Do not treat an SSH `npm start`, a Vite dev server, a successful Passenger start alone, or an Apache rewrite as production readiness.

> **Deferred by hosting scope, not dismissed:** multi-process PM2 clustering, Nginx configuration owned by the repository, `.htaccess` Node proxying, Redis/BullMQ, a dedicated worker, Kubernetes/container deployment, external metrics/alerting platforms, and automatic cloud-scale failover are not prerequisites for this low-user-count cPanel launch. They remain future architectural options. The release must still satisfy the security, correctness, migration, backup, HTTPS, configuration, log, and smoke-test gates above.
