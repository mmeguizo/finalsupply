# Hosting Administrator Deployment Questionnaire

> We will publish a static React/Vite frontend separately and run the Node.js API under PM2 on a cPanel account. Please complete the items below before implementation. Reply with the requested command output or named value where shown, but never send credentials or secret values.

## Project facts (for reference)

- **Frontend:** React 19.0.0, Vite 5.4.8, TypeScript 5. Build with `npm run build`; publish `app/dist`.
- **API:** ESM Node app, started with `node index.js` from `api`; Express 4.22.2, Apollo Server 4.13.0, Sequelize 6.37.8, and `mysql2` 3.14.0.
- **Production:** `NODE_ENV=production`; the current PM2 production environment is named `production`.
- **Browser/API:** GraphQL is at `/graphql`; browser requests send cookies (`credentials: 'include'`).
- **Versions:** The repository declares no Node `engines` version. Confirm supported Node/npm versions; the release build must use them.
- **Uploads:** This release has no upload/multipart route, so it needs no upload directory.

**Please answer every item.** For an unavailable feature, check “not available” and name the supported alternative. Commands below are examples of safe output to return; redact usernames, hostnames, paths, or IDs if your policy requires it, but retain the version/capability/result.

## 1. Account, runtime, and Node versions

- [ ] Confirm cPanel account type and whether it permits a persistent Node service supervised by **PM2**. If not, name the administrator-managed equivalent: `________________`.
- [ ] Return safe output: `node --version`, `npm --version`, `pm2 --version`.
- [ ] Confirm that Node supports ESM startup (`node index.js`) and whether that Node version can be selected per cPanel application/account.
- [ ] Confirm the API production root is outside every public document root: `________________`.
- [ ] Confirm OS/platform and whether native dependency builds and `npm ci` are allowed.

## 2. PM2, SSH, deployment permissions, and process lifecycle

- [ ] Confirm deployer SSH/cPanel Terminal access and permission for `npm ci`, `npm run migrate:check`, `npm run migrate`, and approved PM2 lifecycle commands.
- [ ] Confirm whether PM2 is account- or administrator-owned; state its home/startup mechanism and whether it survives logout, cPanel restarts, and server reboots.
- [ ] Provide approved equivalents for start/reload/restart, status, logs, save, and boot restoration (for example: `pm2 status`, `pm2 logs SUPPLY-API --lines 100`, `pm2 save`).
- [ ] Confirm initial process count is **one**, not cluster mode; approved process name: `________________` (expected: `SUPPLY-API`).
- [ ] Confirm graceful-stop timeout, restart policy, deployment owner, and safe release sequence. The API handles `SIGTERM`/`SIGINT` and sends PM2 ready when supported.
- [ ] Confirm non-public writable release and Node/PM2-log locations, plus log rotation/retention: `________________`.

## 3. Domains, DNS, reverse proxy, and ports

- [ ] Exact public HTTPS frontend hostname: `________________________________`.
- [ ] Choose one API topology:
  - [ ] Same origin: proxy `https://________________/graphql` to the internal API.
  - [ ] Separate origin: `https://________________/graphql`.
- [ ] Confirm DNS owner and required A/AAAA/CNAME record target (no credentials): `________________`.
- [ ] Confirm reverse proxy is server/virtual-host configuration, **not** a `.htaccess` proxy workaround.
- [ ] Unique internal API TCP port or socket: `____________`; confirm it is not publicly reachable.
- [ ] Confirm proxy target, `Host`/`X-Forwarded-*` forwarding, and safe request timeout/body-size policy.

## 4. Frontend static document root, SPA fallback, and `.htaccess`

- [ ] Frontend document-root path: `________________________________`.
- [ ] Confirm only `app/dist` contents are public; API source, `.env`, `node_modules`, logs, database exports, and release archives remain private.
- [ ] Confirm `mod_rewrite` is enabled and approve this **SPA fallback only**:

```apache
Options -MultiViews
RewriteEngine On
RewriteBase /
RewriteCond %{REQUEST_FILENAME} -f [OR]
RewriteCond %{REQUEST_FILENAME} -d
RewriteRule ^ - [L]
RewriteRule ^ index.html [L]
```

- [ ] If hosted under a subdirectory, provide public base path and required `RewriteBase`: `________________`.
- [ ] Confirm `.htaccess` will not start Node, supervise PM2, or proxy `/graphql`.

## 5. Backend bind address, proxy, HTTPS, and WebSocket

- [ ] State the host-required PM2 bind-address/port method. The app currently listens on `PORT` without an explicit host; do not request a guessed code change.
- [ ] Confirm `PORT` is the private value above, not historical default `4000`.
- [ ] Confirm TLS ends at the approved proxy and it forwards enough information for Express proxy trust; production uses proxy trust with `NODE_ENV=production`.
- [ ] WebSocket upgrade support: [ ] not required/not enabled  [ ] available  [ ] not available; details: `________________`. This release uses HTTP GraphQL only.
- [ ] Confirm only `/graphql` (and later approved health endpoints) can be published, never the raw internal port.

## 6. Environment variables and safe secret supply

- [ ] Confirm protected environment-variable mechanism: [ ] cPanel app UI [ ] protected file outside public root [ ] PM2 environment [ ] administrator procedure: `________________`.
- [ ] Confirm deployer can update values without Git or a web-accessible directory.
- [ ] Confirm these **names only** will be available: `NODE_ENV`, `PORT`, `MYSQL_HOST`, `MYSQL_USER`, `MYSQL_PASSWORD`, `MYSQL_DATABASE`, `SESSION_SECRET`, `SESSION_COOKIE_NAME`, `SESSION_COOKIE_SECURE`, `SESSION_COOKIE_SAMESITE`, `CORS_ORIGINS`, `TRUST_PROXY`, `BODY_LIMIT`, `RATE_LIMIT_WINDOW_MS`, `RATE_LIMIT_MAX`, `RATE_LIMIT_LOGIN_MAX`, `GRAPHQL_MAX_DEPTH`.
- [ ] Confirm non-secret production values: `NODE_ENV=production`, `SESSION_COOKIE_SECURE=true`, `TRUST_PROXY=true` when the proxy terminates TLS, and assigned `PORT`.
- [ ] Confirm `SESSION_SECRET` is privately generated/stored and never logged, emailed, or committed.
- [ ] Return exactly one public build-time `VITE_GRAPHQL_URL`: [ ] `/graphql`  [ ] `https://<API-host>/graphql`. It is supplied at frontend build time only.

## 7. CORS, frontend origin, cookies, and sessions

- [ ] Exact canonical `CORS_ORIGINS` frontend origin (HTTPS only; no path, query, wildcard, localhost, or plaintext HTTP): `________________`.
- [ ] Choose and confirm cookie model:
  - [ ] Same origin: `VITE_GRAPHQL_URL=/graphql`.
  - [ ] Separate HTTPS subdomains: exact credentialed CORS origin; host-only secure cookie; `SameSite=lax`, browser-tested.
  - [ ] Different sites: third-party-cookie policy identified; `SameSite=None; Secure` tested before launch.
- [ ] Confirm proxy/CORS supports credentialed requests and never sends `Access-Control-Allow-Origin: *`.
- [ ] Confirm final-domain tests for login, logout, refresh, and sessions after PM2 restart. Sessions are stored in MySQL.

## 8. MySQL provisioning, access, backups, and migrations

- [ ] Provide non-secret connection facts: hostname, non-default port, database name, local-only/network-restricted access. **Do not provide username/password.**
- [ ] Confirm MySQL version and whether application connections need TLS/CA configuration.
- [ ] Confirm least-privilege application DML permissions and controlled DDL migration authority/account.
- [ ] Confirm account/application MySQL connection limit. Sequelize can request up to 50 connections; this informs PM2/process/pool choices.
- [ ] Confirm operator/sequence: run `npm run migrate:check`; verify a pre-release backup; run `npm run migrate` **once** from `api`. Never run migrations from PM2 startup or concurrently.
- [ ] Provide backup frequency, retention, restore owner/requester, expected restore time, non-production restore-test option, and how the pre-release backup is verified.
- [ ] Confirm whether cPanel prefixes account/database names; return exact non-secret names: `________________`.

## 9. Upload storage and permissions

- [ ] Confirm: “not applicable for this release—no upload/multipart handler exists.”
- [ ] If storage is pre-provisioned, identify it as unused and confirm it is neither public web root nor ephemeral PM2/release storage.
- [ ] Confirm any future upload/export feature needs separate approval for private storage, permissions, backup/retention, authenticated downloads, and malware/size/type controls.

## 10. SSL, headers, firewall, logging, and monitoring

- [ ] Confirm valid TLS and forced HTTP-to-HTTPS redirect for each public hostname; give certificate renewal owner and expiry-monitoring method.
- [ ] Confirm proxy/server headers will not break the app; list mandatory host headers. The API uses Helmet.
- [ ] Confirm firewall/WAF/rate limits allow HTTPS GraphQL `POST /graphql`, credentialed requests, and approved deployment SSH, while blocking public access to the internal API port.
- [ ] Provide safe locations/commands for app stdout/stderr, PM2 logs, web access/error logs, and retention/rotation policy.
- [ ] Confirm alerts for PM2 crashes/restarts, disk/quota, memory/CPU, TLS expiry, and database availability; give alert recipient/escalation path.

## 11. Resource and process limits

- [ ] Provide account CPU, RAM, Node/PM2 process count, runtime limit, file/inode quota, bandwidth, and enforced open-file/process/connection limits.
- [ ] Confirm permitted Node heap setting and whether existing `--max-old-space-size=2048` is allowed; do not assume this is safe on shared hosting.
- [ ] Confirm maximum proxy request/idle timeout and MySQL connection limit.
- [ ] Confirm host timeout/operational cap for long report/document operations. This release starts with one API process and no queue worker.

## 12. Support, incident response, and rollback

- [ ] Name support contact, hours, escalation route, and expected response time for outage, PM2, proxy/DNS/TLS, restore, and resource-limit events.
- [ ] Confirm who may restart PM2, change proxy/DNS/TLS, restore MySQL, and roll back a release.
- [ ] Confirm rollback: retain previous static `app/dist` artifact and API release outside public root; restore them; run approved PM2 restart; restore database only under documented migration/data decision.
- [ ] Confirm retained/provided release evidence: Node/npm/PM2 output, topology/domains/internal port, PM2 status after restart, log location, TLS/redirect result, backup ID, and migration operator/result—never secrets.

## Response template

```text
Administrator / date:
Account type and supported Node/npm/PM2 versions:
PM2 owner, startup, approved lifecycle commands, and process name:
API root and private log/release locations:
Frontend hostname/document root:
API topology, hostname (if separate), private port/socket, proxy target:
DNS owner and record requirements:
Approved VITE_GRAPHQL_URL and CORS_ORIGINS:
Environment-variable mechanism (names only; no values/secrets):
MySQL non-secret facts, limits, backup/restore, migration authority:
TLS, firewall/WAF, monitoring, resource limits:
Support/escalation and rollback owner:
Unavailable features and supported alternatives:
```

## Intended deployment flow

The frontend is built once with the approved public `VITE_GRAPHQL_URL`; only the resulting `app/dist` files go in the frontend document root. Apache serves those static files and sends frontend deep links to `index.html`.

The API source and its protected environment stay outside the public root. PM2 runs one private `SUPPLY-API` Node process. A server-level HTTPS reverse proxy sends only `/graphql` to its private port/socket and forwards proxy headers; browsers never access that port directly. Do not deploy the existing PM2 ecosystem files unchanged: they are development/cloud-oriented, including a Vite dev server, clustering, and an obsolete absolute path. The administrator must provide the host-specific PM2 procedure.

## Blocking before implementation/release

> These answers are required before final frontend build values, PM2 setup, proxy configuration, or database release work can be chosen. An unavailable item needs a documented supported alternative; otherwise deployment stops.

- [ ] Persistent PM2-permitted Node runtime (or administrator-owned equivalent), supported Node/npm versions, application root, and durable startup/restart/log procedure.
- [ ] Exact frontend/API HTTPS domains, DNS ownership, and one confirmed topology: server-level same-origin `/graphql` proxy or named separate API domain.
- [ ] Unique private API port/socket, bind/proxy behavior, and firewall rule that prevents direct public access.
- [ ] Frontend document root, API location outside public root, and SPA fallback/mod_rewrite confirmation.
- [ ] Protected environment-variable method and exact build-time `VITE_GRAPHQL_URL`; never `localhost`, LAN address, or production `http://`.
- [ ] Exact CORS origin and HTTPS cookie/session model compatible with `credentials: 'include'`.
- [ ] MySQL host/database/access policy, migration authority, connection limit, verified backup/restore path, and database TLS/CA policy.
- [ ] TLS coverage/forced HTTPS, approved logs/restart access, and resource limits sufficient for one API process.

## Confirmation-only before go-live

> These do not determine the architecture, but must be recorded and verified during release acceptance.

- [ ] PM2 log rotation/retention, monitoring dashboard/alerts, support contacts, escalation targets, and operating hours.
- [ ] WebSocket capability recorded as “not required” unless a later feature needs it.
- [ ] Upload storage recorded as “not applicable for this release.”
- [ ] Final PM2 status, artifact checksum, smoke-test results (deep link, login/logout, authorized GraphQL action, session after restart), and rollback owner.
