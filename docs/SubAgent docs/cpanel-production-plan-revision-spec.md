# cPanel/shared-hosting production-plan revision specification

## Purpose and scope

This is a change specification for revising `production-readiness-execution-plan.md`; it is **not** a deployment runbook and does not authorize code changes. The existing plan is not overkill on application correctness and security. Its Nginx/PM2, multi-worker, CI, and queue assumptions are over-specified for a low-user-count cPanel deployment. Preserve the safety blockers, replace host-specific infrastructure instructions, and clearly defer cloud-scale work.

This specification is based on the current repository:

* `app/` is a Vite SPA. `npm run build` emits `app/dist`; production must not run `vite`, `vite preview`, or the frontend PM2 configuration.
* `api/` is an Express/Apollo process whose `start` command is `node index.js`; it uses MySQL-backed sessions and the `PORT` environment variable.
* The API has no health/readiness route and no upload/multipart implementation.
* The frontend has `credentials: 'include'` and the production GraphQL URL is compiled into the Vite bundle.
* `api/config.js` currently rejects every normal production URL in `CORS_ORIGINS`: `o.includes('/')` also matches the `//` in `https://…`. This is a deployment-blocking configuration defect despite P0-02 being marked complete.
* Existing PM2 files are development/cloud-oriented (frontend starts Vite; backend has an obsolete absolute path and one worker per CPU). They are not the cPanel process manager.

Do not state that this host has Passenger, cPanel's **Setup Node.js App**, a reverse-proxy module, SSH, root access, external MySQL, or a background-process manager. Each is a prerequisite to verify with the hosting administrator.

## Required plan edits

### 1. Replace the “Explicit assumptions” deployment assumptions

In `## Architecture and context inventory`, replace assumptions 4 and 5 with the following text. Keep assumptions 1–3 and 6, but update the date/status evidence if the plan is revised later.

> 4. Deployment target is cPanel/shared hosting. The frontend is static hosting and the API needs a hosting-supported persistent Node application (normally cPanel Setup Node.js App/Passenger or an administrator-managed equivalent). A shell command alone is not a durable production process manager.
>
> 5. The frontend and API real HTTPS domains, Node runtime version, assigned API port/socket, public document root, MySQL access method, and any reverse-proxy capability are hosting-administrator inputs. Do not substitute localhost, a LAN IP, ngrok, or a guessed proxy setting for them.
>
> 6. The application has low expected user count but can perform expensive data/document work. Start with one hosting-managed API process and no queue worker. Add a persistent worker, Redis, clustering, or an external queue only after measurements and only if the host can supervise it reliably.

Immediately after the assumptions, add this subsection:

### cPanel deployment model to verify before release

> **Static frontend.** Build `app/` once with the final `VITE_GRAPHQL_URL` and publish only the contents of `app/dist` to the frontend domain’s document root. The Vite environment value is build-time public configuration, not a runtime secret. The cPanel terminal may build it if the required Node version/tools are available; otherwise build the reviewed artifact in a controlled build environment and upload that artifact. Do not publish source, `node_modules`, `.env`, or an archive as the web root.
>
> **API.** Confirm that the host provides a persistent Node service, such as Setup Node.js App backed by Passenger, and supports the required Node version and ESM entry point. Configure `api/index.js` as the startup file, the API directory as the application root outside the public document root, `NODE_ENV=production`, and the port/socket assigned by that facility. Do not use PM2, `npm run dev`, `vite`, a `screen`/`nohup` process, or an interactive terminal session as the assumed production service. If the host does not provide a supported Node application service, the administrator must provide and own an equivalent supervised reverse-proxy/runtime solution or the API must be hosted elsewhere; static cPanel hosting alone cannot run this API.
>
> **Domain topology.** Prefer one HTTPS site with an administrator-provided server-level `/graphql` reverse proxy to the API; then build with `VITE_GRAPHQL_URL=/graphql`. `.htaccess` must not implement that proxy. If the administrator instead maps a distinct API HTTPS domain, build with the exact URL, for example `https://api.example.org/graphql`, and configure exact API CORS origins. Never deploy a localhost, private IP, or plaintext production API URL.
>
> **Restart model.** A Passenger/Node-app restart can terminate requests and clears in-memory rate-limit state. MySQL-backed sessions survive an ordinary API restart; in-process jobs do not. The release procedure must run migrations once, restart through the cPanel Node-app control or the administrator’s documented command, then verify logs and health. Do not expect a terminal process to survive logout, resource enforcement, or a server restart.

### 2. Add a cPanel-specific “must verify” gate

After `## Critical deployment blockers`, insert this exact section:

## cPanel hosting prerequisite gate

> Do not schedule production deployment until the administrator confirms in writing:
>
> 1. Whether a supported persistent Node application service exists, its supported Node version, startup-file convention, application root, assigned port/socket behavior, and the documented restart/log locations.
> 2. Whether the frontend and API will use one origin with an administrator-managed `/graphql` proxy, or two named HTTPS domains. If a proxy is requested, confirm that it is server-level configuration, not a `.htaccess` workaround.
> 3. The frontend document root, the API location outside that web root, and which account owns the files/process. Verify writable locations before introducing any generated-file feature.
> 4. TLS certificate coverage and forced HTTPS for every public frontend/API hostname.
> 5. MySQL hostname, database name, account/privileges, connection policy, backup facility/retention, and whether database TLS/CA configuration is required. Use the actual cPanel database names (which may be account-prefixed), not guessed `localhost` values.
> 6. Whether SSH/cPanel Terminal is available for `npm ci`, migration, and restart steps. If not, identify the administrator-owned deployment procedure before release.
>
> A “yes” to cPanel access is not proof of any one of these capabilities. If an item is unavailable, use the stated alternative or stop the rollout; do not silently change the application’s security or process model.

### 3. Replace P1-15 completely

Replace the complete `### P1-15 — Deploy a production web tier and session-safe process model` section with this section, renumbering is not required:

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
* **Security/correctness considerations:** Do not enable `SESSION_COOKIE_SECURE=false` to work around an HTTPS/proxy mistake. No API, source map, `.env`, database dump, uploaded document, or log containing sensitive data may be placed in the static document root. cPanel resource limits and Passenger restarts make in-process background work unreliable.
* **Acceptance criteria:** a fresh browser can load a deep link without a 404; the built SPA contains no localhost/LAN API URL; API restart is performed by the confirmed hosting facility and returns ready afterward; all public paths are HTTPS; sessions and authorized GraphQL calls work with the chosen domain topology; health and error logs are locatable by the approved operator; and the fallback `.htaccess` never attempts to run Node.
* **Rollback:** retain the previous static artifact outside the document root and identify the previous Node application release/configuration. On a failed smoke test, put the previous static artifact and prior known-good API release back, restart through the approved host control, and restore the pre-release backup only when the migration/data decision tree requires it. Do not “roll back” by launching Vite or an SSH terminal process.

### 4. Insert mandatory configuration wording

In P0-02, append the following implementation steps and acceptance criteria. This corrects a current defect; do not mark it complete until these are demonstrated in a staging-like production configuration.

> 7. Correct production CORS validation so it accepts only canonical, exact origins (scheme + host + optional port) and rejects localhost, ngrok, credentials, query/fragment, or a pathname other than `/`. Do not reject the `//` in a valid `https://` URL. Parse each value with `new URL`, require `url.origin === suppliedValue` (or an explicitly normalized no-trailing-slash equivalent), and require `https:` in production. Keep `credentials: true`; never use `*`.
>
> 8. Treat `MYSQL_PASSWORD` as required and nonempty in production unless the hosting administrator explicitly documents an account that has no password (which must not be used for a public deployment). Validate an integer provider-assigned `PORT` when TCP is used. Keep a long random `SESSION_SECRET` only in protected hosting configuration, never in `.env.example`.
>
> 9. Document this production variable inventory in the plan, using names only: `NODE_ENV=production`; provider-assigned `PORT` when applicable; `MYSQL_HOST`, `MYSQL_USER`, `MYSQL_PASSWORD`, `MYSQL_DATABASE`; `SESSION_SECRET`; `SESSION_COOKIE_NAME`; `SESSION_COOKIE_SECURE=true`; `SESSION_COOKIE_SAMESITE`; `CORS_ORIGINS`; `TRUST_PROXY`; `BODY_LIMIT`; `RATE_LIMIT_WINDOW_MS`; `RATE_LIMIT_MAX`; `RATE_LIMIT_LOGIN_MAX`; and `GRAPHQL_MAX_DEPTH`. `VITE_GRAPHQL_URL` belongs to the frontend build, is public, and must be one of the two approved topology values above.
>
> 10. For a same-origin proxy, set `VITE_GRAPHQL_URL=/graphql`; the browser does not need cross-origin CORS. For a separate API hostname on the same registrable site (for example `app.example.org` and `api.example.org`), set `CORS_ORIGINS=https://app.example.org`, keep `credentials: 'include'`, keep the API cookie host-only, and use `SESSION_COOKIE_SECURE=true` with `SESSION_COOKIE_SAMESITE=lax`. Confirm this behavior in target browsers. For genuinely cross-site domains, avoid the topology where possible; if it is required, use `SameSite=None` and `Secure`, exact CORS, and test third-party-cookie behavior explicitly before launch.
>
> **Additional P0-02 acceptance criteria:** with `NODE_ENV=production`, a valid `https://frontend.example.org` CORS origin starts successfully, a localhost/path/query/fragment/wildcard origin fails before listening, and a browser can complete the selected HTTPS cookie flow. A separate deployment must prove that the bundled `VITE_GRAPHQL_URL` has no localhost, LAN IP, or `http://` production value.

### 5. Add a small cPanel migration/database release subsection

Under P0-06 and P2-16, replace cloud-specific backup language with the following requirements (retain their safety intent):

> Before the first release and every schema/data migration, identify the cPanel/managed-MySQL backup mechanism, account owner, retention, restore requester, and a non-production restore target. Confirm the API database account has only the application privileges it needs; a migration account may need controlled DDL privileges and must not be embedded in source. Confirm the real MySQL host and whether server/CA TLS is required; do not assume `127.0.0.1` or disable certificate validation. Run `npm run migrate:check`, back up, migrate once, verify the migration ledger, and smoke-test. Perform at least one documented restore drill before go-live. If the host cannot provide a recoverable backup/restore path, deployment is blocked.

### 6. Add the file-persistence rule

Add this paragraph to P1-15 and P2-16:

> Repository inspection found no upload route or multipart handler, so no upload directory is required for this release. Do not create one speculatively. If uploads, generated exports, or persistent document files are later introduced, add a separate design before implementation: a non-public storage path or object storage, owner/account permissions, size/type limits, malware scanning policy where required, authenticated download authorization, backup/retention, and a test that files survive the host’s restart/release process. Never store them in `app/dist`, the public document root, or ephemeral process storage.

### 7. Revise the release evidence checklist

Replace the final `## Release evidence checklist` paragraph with:

> Before cPanel production approval, attach: confirmed hosting-prerequisite responses; selected topology and exact public domains; Node runtime/startup/restart/log evidence; protected environment-variable inventory (names only); static artifact checksum and proof of no localhost/LAN URL; `.htaccess` SPA deep-link result; HTTPS/certificate/redirect result; CORS and cookie-session result; migration check/ledger result; pre-release backup and restore-drill timestamp; `/healthz` and `/readyz` result; public login/RBAC/document smoke results; final log review; final `git status --short`; and the named change/rollback owner. Do not treat an SSH `npm start`, a Vite dev server, a successful Passenger start alone, or an Apache rewrite as production readiness.

## Classification table for every existing plan task

Use this table to replace the existing “priority equals deployment order” implication. “Must” means complete or re-verify before this release; a task marked completed still requires its listed production acceptance evidence.

| Existing task | Classification | Revision direction |
|---|---|---|
| P0-01 reproducible installation/dependency integrity | **MUST BEFORE DEPLOY** | Re-run clean API/app installs and production audit policy on the actual supported Node version. Do not require zero non-exploitable moderate findings, but document remaining findings and compensating controls. |
| P0-02 fail-fast config | **MUST BEFORE DEPLOY** | Keep; add the CORS parser correction, cPanel variable inventory, domain/cookie tests, and provider `PORT` rule above. |
| P0-03 RBAC | **MUST BEFORE DEPLOY** | Preserve. Re-run anonymous/user/admin smoke checks after public deployment. |
| P0-04 ownership/anti-IDOR | **MUST BEFORE DEPLOY** | Preserve. Re-run cross-user read/mutation checks in staging before public data is exposed. |
| P0-05 perimeter controls | **MUST BEFORE DEPLOY** | Preserve headers, body/depth/rate/error safeguards. Keep one API process initially; do not add Redis/shared rate-limit infrastructure merely for cPanel. |
| P0-06 tracked migrations | **MUST BEFORE DEPLOY** | Preserve; replace PM2 wording with one cPanel-terminal/admin-managed migration execution and tested backup/restore. |
| P0-07 atomic document IDs | **MUST BEFORE DEPLOY** | Preserve; one API process reduces but does not remove the need for database atomicity. |
| P0-08 transactional writes | **MUST BEFORE DEPLOY** | Preserve. The deferred idempotency product decision remains documented; do not claim its implementation. |
| P1-09 pagination/SQL aggregates/index verification | **RECOMMENDED POST-LAUNCH** | Measure on representative data first. Promote only the measured slow/unbounded path to must-fix if it threatens cPanel memory/time limits. |
| P1-10 server contracts/safe document rendering | **MUST BEFORE DEPLOY** | Preserve XSS/output-encoding and critical server validation work; do not defer a known unsafe print/preview sink. Broader validation coverage may follow by workflow. |
| P1-11 client auth/errors/build output | **MUST BEFORE DEPLOY** | At minimum remove sensitive Apollo variable logging, validate server session on startup, use production source-map policy, and build static assets. Nice-to-have UI refinements can follow. |
| P1-12 cancellable client workloads | **RECOMMENDED POST-LAUNCH** | Measure and cap the heaviest visible workflow; do not add broad cancellation architecture before evidence. |
| P1-13 structured observability | **REQUIRED FOR CPANEL DEPLOYMENT** | Require redacted stdout/stderr capture, log location/retention, correlation-friendly errors, and health/readiness endpoints. Defer external metrics/alerts/dashboard integration. |
| P1-14 dedicated heavy-job execution | **DEFER/NOT APPLICABLE** | No persistent worker/queue on this release. Revisit only after measurement and confirmation that the host can supervise a separate worker. |
| P1-15 production web tier/process model | **REQUIRED FOR CPANEL DEPLOYMENT** | Replace in full with the cPanel section above. |
| P2-16 backup/restore/migration/incident runbook | **MUST BEFORE DEPLOY** | Require a host-supported backup and one restore drill; defer point-in-time recovery/automated encrypted off-host backup only if the hosting product cannot provide it and the owner accepts the stated RPO/RTO. |
| P2-17 CI and focused tests | **RECOMMENDED POST-LAUNCH** | Retain local clean-build/migration/security smoke evidence now. Add CI and comprehensive automated tests after deployment rather than blocking cPanel launch on new infrastructure. |
| P2-18 accessibility/product-operability | **RECOMMENDED POST-LAUNCH** | Preserve basic sign-in/critical workflow error-state and keyboard smoke checks now; schedule the complete audit after launch. |

## Classification table for every existing verified finding

Add finding IDs in the revised plan so completion status is auditable. The following table classifies the findings currently listed under “Verified findings”; “completed” means re-verify, not assume.

| ID / existing finding | Classification | Required plan treatment |
|---|---|---|
| F01 undeclared `cors` / clean install risk | **MUST BEFORE DEPLOY** | Verify actual clean install and runtime import; retain declared dependency. |
| F02 known production dependency vulnerabilities | **MUST BEFORE DEPLOY** | Re-audit, resolve critical/exploitable direct issues, document remaining moderate findings; no blind force upgrades. |
| F03 automatic `sync({ alter: true })` | **MUST BEFORE DEPLOY** | Verify startup has no DDL and migration runner is used. |
| F04 broken migration runner | **MUST BEFORE DEPLOY** | Verify ledger/check/migrate from a clean non-production DB and release database. |
| F05 unauthenticated role operations | **MUST BEFORE DEPLOY** | Re-test anonymous denial. |
| F06 user-administration privilege escalation | **MUST BEFORE DEPLOY** | Re-test user/admin boundaries. |
| F07 insecure cookie/CORS/port settings | **MUST BEFORE DEPLOY** | Include the current CORS-validation bug, exact domain config, provider port, TLS, and cookies. |
| F08 missing ownership enforcement | **MUST BEFORE DEPLOY** | Re-test cross-user access on deployed API. |
| F09 unbounded lists/client aggregation | **RECOMMENDED POST-LAUNCH** | Measure/cap the most expensive route before or immediately after launch. |
| F10 process-local document IDs | **MUST BEFORE DEPLOY** | Verify atomic DB allocation under concurrent requests. |
| F11 error leakage/no GraphQL boundary policy | **MUST BEFORE DEPLOY** | Re-test safe production errors, limits, and no raw variables in logs. |
| F12 unused sanitization/print XSS risk | **MUST BEFORE DEPLOY** | Audit all current HTML sinks and add/verify output encoding. |
| F13 hard-coded frontend endpoint, source maps, variable logging | **MUST BEFORE DEPLOY** | Build with final HTTPS URL, prevent sensitive logging, and apply source-map policy. |
| F14 non-unique email | **MUST BEFORE DEPLOY** | Verify migration/normalized uniqueness and registration policy. |
| F15 stale/corrupt local session state | **MUST BEFORE DEPLOY** | Ensure server session is authoritative and malformed storage cannot crash/mislead. |
| F16 Vite dev/PM2 cluster/absolute path | **REQUIRED FOR CPANEL DEPLOYMENT** | Do not use either PM2 configuration; use static build plus hosting-managed one-process API. |
| F17 unverified production indexes | **RECOMMENDED POST-LAUNCH** | Inspect indexes and plans before performance changes; promote to must if a release workflow is demonstrably unsafe/too slow. |
| F18 no upload route/multipart handler | **DEFER/NOT APPLICABLE** | Record that uploads are absent; apply the file-persistence rule only if feature scope changes. |

## cPanel release smoke test to add verbatim

Add this ordered checklist after P1-15. It is deliberately small enough for shared hosting:

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

## Deferred work wording

Add this final note to the revised plan:

> **Deferred by hosting scope, not dismissed:** multi-process PM2 clustering, Nginx configuration owned by the repository, `.htaccess` Node proxying, Redis/BullMQ, a dedicated worker, Kubernetes/container deployment, external metrics/alerting platforms, and automatic cloud-scale failover are not prerequisites for this low-user-count cPanel launch. They remain future architectural options. The release must still satisfy the security, correctness, migration, backup, HTTPS, configuration, log, and smoke-test gates above.
