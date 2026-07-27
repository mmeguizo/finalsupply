# Specification: Hosting Administrator Deployment Questionnaire

## Deliverable

Create `docs\Hosting Administrator Deployment Questionnaire.md` as a short, plain-English form that can be emailed to the hosting administrator. It must use check boxes (`[ ]`) and response blanks. Do not ask the administrator to send passwords, tokens, private keys, database dumps, cookies, or the contents of any `.env` file.

Open with:

> We will publish a static React/Vite frontend separately and run the Node.js API under PM2 on a cPanel account. Please complete the items below before implementation. Reply with the requested command output or named value where shown, but never send credentials or secret values.

Then include a small **Project facts (for reference)** section:

* Frontend: React `19.0.0`, Vite `5.4.8`, TypeScript `5`; build command `npm run build`; output `app/dist` (`app\package.json:5-8`).
* API: ESM Node application; start command `node index.js`; entry point `api\index.js`; Express `4.22.2`, Apollo Server `4.13.0`, Sequelize `6.37.8`, MySQL driver `mysql2 3.14.0` (`api\package.json:5-37`).
* Production environment name/value: `NODE_ENV=production`. The current PM2 production environment is named `production` (`api\ecosystem.config.cjs:44-47`).
* API route: `/graphql`; browser requests include cookies (`credentials: 'include'`) (`api\index.js:119-130`, `app\src\apollo\client.ts:5-10`).
* The repository declares no Node `engines` version. The administrator must confirm the actual supported Node/npm versions, and the release build must use that confirmed version.
* No upload/multipart route exists in this release; no upload directory is needed (`docs\SubAgent docs\cpanel-production-plan-revision-spec.md:116-120`).

## Required questionnaire body

Use this heading before the sections:

> **Please answer every item.** For an unavailable feature, check “not available” and name the supported alternative. Commands below are examples of safe output to return; redact usernames, hostnames, paths, or IDs if your policy requires it, but retain the version/capability/result.

### 1. Account, runtime, and Node versions

* [ ] Confirm the cPanel account type and whether it permits a persistent Node service supervised by **PM2**. If PM2 is not permitted, name the administrator-managed equivalent.
* [ ] Return: `node --version`, `npm --version`, and `pm2 --version`.
* [ ] Confirm whether the reported Node version supports this API’s ESM startup (`node index.js`) and whether it can be selected per cPanel application/account.
* [ ] Confirm the production application root path for the API and that it can remain outside every public document root.
* [ ] Confirm the production OS/platform and whether native dependency builds or `npm ci` are allowed.

### 2. PM2, SSH, deployment permissions, and process lifecycle

* [ ] Confirm SSH/cPanel Terminal access for the deployer, including permission to run `npm ci`, `npm run migrate:check`, `npm run migrate`, and the approved PM2 lifecycle command.
* [ ] Confirm whether PM2 is account-owned or administrator-owned, the PM2 home/startup mechanism, and whether it survives logout, cPanel restarts, and server reboots.
* [ ] Return the approved commands (or equivalents) for: start/reload/restart, status, logs, saving the process list, and boot restoration. Example labels: `pm2 status`, `pm2 logs SUPPLY-API --lines 100`, `pm2 save`.
* [ ] Confirm the initial process count is **one** `SUPPLY-API` process, not cluster mode. State the approved process name.
* [ ] Confirm graceful-stop timeout, restart policy, deployment owner, and the safe release sequence. The API handles `SIGTERM`/`SIGINT` and sends PM2’s ready signal when supported (`api\index.js:141-163`).
* [ ] Confirm writable, non-public locations for Node/PM2 logs and release directories, plus log retention/rotation.

### 3. Domains, DNS, reverse proxy, and ports

* [ ] Provide the exact public HTTPS frontend hostname: `________________________________`.
* [ ] Provide the exact public HTTPS API hostname, or check the same-origin option:
  * [ ] Same origin: proxy frontend `https://________________/graphql` to the internal API.
  * [ ] Separate origin: `https://________________/graphql`.
* [ ] Confirm who creates/changes DNS records and return the required record type/value (for example, A/AAAA/CNAME target), excluding credentials.
* [ ] Confirm the reverse proxy is server/virtual-host configuration, not a `.htaccess` proxy workaround.
* [ ] Provide the unique internal API TCP port or socket assigned to this app: `____________`. Confirm it is not publicly reachable.
* [ ] Confirm the proxy target, expected `Host`/`X-Forwarded-*` forwarding behavior, and a safe proxy request timeout/body-size policy.

### 4. Frontend static document root, SPA fallback, and `.htaccess`

* [ ] Provide the frontend domain’s document-root path: `________________________________`.
* [ ] Confirm only the contents of `app/dist` will be published there; API source, `.env`, `node_modules`, logs, database exports, and deployment archives will not be public.
* [ ] Confirm Apache `mod_rewrite` is enabled and approve this **SPA fallback only**:

  ```apache
  Options -MultiViews
  RewriteEngine On
  RewriteBase /
  RewriteCond %{REQUEST_FILENAME} -f [OR]
  RewriteCond %{REQUEST_FILENAME} -d
  RewriteRule ^ - [L]
  RewriteRule ^ index.html [L]
  ```

* [ ] If the app is served from a subdirectory, provide its public base path and the required `RewriteBase`.
* [ ] Confirm `.htaccess` must not start Node, supervise PM2, or proxy `/graphql`.

### 5. Backend bind address, proxy, HTTPS, and WebSocket

* [ ] State the required API bind address/port method for PM2. The application currently listens on `PORT` without an explicit host (`api\index.js:158`); do not request a guessed code change.
* [ ] Confirm `PORT` must use the unique internal value above and must not use the historical default `4000` from the PM2 files (`api\ecosystem.config.cjs:42-50`).
* [ ] Confirm HTTPS terminates at the approved proxy and that the proxy forwards enough information for Express proxy trust. Production currently treats `NODE_ENV=production` as behind a proxy (`api\config.js:4-6`).
* [ ] Confirm whether WebSocket upgrade support is required or available. This release uses HTTP GraphQL only; return “not required/not enabled” unless the host requires a different answer.
* [ ] Confirm whether the administrator can publish only `/graphql` (and later approved health endpoints) rather than the raw internal port.

### 6. Environment variables and safe secret supply

* [ ] Confirm the protected mechanism used to set application environment variables (cPanel app UI, protected file outside public root, PM2 ecosystem environment, or administrator procedure).
* [ ] Confirm the deployer may set/update values without placing them in Git or a web-accessible directory.
* [ ] Confirm these **names only** will be available to the API: `NODE_ENV`, `PORT`, `MYSQL_HOST`, `MYSQL_USER`, `MYSQL_PASSWORD`, `MYSQL_DATABASE`, `SESSION_SECRET`, `SESSION_COOKIE_NAME`, `SESSION_COOKIE_SECURE`, `SESSION_COOKIE_SAMESITE`, `CORS_ORIGINS`, `TRUST_PROXY`, `BODY_LIMIT`, `RATE_LIMIT_WINDOW_MS`, `RATE_LIMIT_MAX`, `RATE_LIMIT_LOGIN_MAX`, `GRAPHQL_MAX_DEPTH` (`api\.env.example:1-24`).
* [ ] Confirm the expected non-secret production values: `NODE_ENV=production`; `SESSION_COOKIE_SECURE=true`; `TRUST_PROXY=true` if the approved proxy terminates TLS; and the assigned `PORT`.
* [ ] Confirm `SESSION_SECRET` can be generated/stored privately and is not logged, emailed, or added to source control.
* [ ] Confirm `VITE_GRAPHQL_URL` is supplied at **frontend build time** only and is public. Return exactly one approved value: `/graphql` for same-origin proxy, or `https://<API-host>/graphql` for a separate API domain.

### 7. CORS, frontend origin, cookies, and sessions

* [ ] Return the exact canonical frontend origin for `CORS_ORIGINS` (for example `https://app.example.org`; no path, query, wildcard, localhost, or plaintext HTTP).
* [ ] Confirm the chosen domain topology and cookie behavior:
  * [ ] Same origin: `VITE_GRAPHQL_URL=/graphql`.
  * [ ] Separate HTTPS subdomains: exact CORS origin with credentials; host-only secure cookie; `SameSite=lax`, subject to browser test.
  * [ ] Different sites: identify the third-party-cookie policy and confirm `SameSite=None; Secure` is tested before launch.
* [ ] Confirm proxy/CORS configuration supports credentialed browser requests and never uses `Access-Control-Allow-Origin: *`.
* [ ] Confirm browser login, logout, refresh, and post-PM2-restart session testing can be performed against the final domains. Sessions are stored in MySQL (`api\index.js:66-91`).

### 8. MySQL provisioning, access, backups, and migrations

* [ ] Provide the non-secret MySQL connection details: hostname, port if non-default, database name, and whether access is local-only or network-restricted. Do **not** provide username/password in the reply.
* [ ] Confirm MySQL server version and whether TLS/CA configuration is required for application connections.
* [ ] Confirm the application account’s least-privilege DML permissions and the controlled DDL permissions/account available for release migrations.
* [ ] Confirm the host’s MySQL connection limit for this account/application. Current Sequelize sizing is CPU-derived and can request up to 50 connections (`api\db\connectDB.js:7-32`); this must be known before PM2/process/pool choices are finalized.
* [ ] Confirm the approved operator and sequence: `npm run migrate:check`, verify a pre-release backup, then run `npm run migrate` **once** from `api`. Do not run migrations from PM2 startup or concurrently.
* [ ] Provide backup frequency, retention, restore requester/owner, expected restore time, and a non-production restore-test option. Confirm how a pre-release backup is verified.
* [ ] Confirm whether the account/database names are cPanel-prefixed and return their exact non-secret names.

### 9. Upload storage and permissions

* [ ] Confirm “not applicable for this release—no upload/multipart handler exists.”
* [ ] If the host pre-provisions storage anyway, identify it as unused and confirm it will not be the public web root or ephemeral PM2/release storage.
* [ ] Confirm that any future upload/export design needs separate approval for non-public storage, ownership/permissions, backup/retention, authenticated downloads, and malware/size/type controls.

### 10. SSL, headers, firewall, logging, and monitoring

* [ ] Confirm valid TLS certificate coverage and forced HTTP-to-HTTPS redirect for every public frontend/API hostname. Return certificate renewal owner and expiry-monitoring method.
* [ ] Confirm proxy/server security headers do not break the application and identify any mandatory headers imposed by the host. The API already uses Helmet (`api\index.js:36-39`).
* [ ] Confirm firewall/WAF/rate-limit rules permit normal HTTPS GraphQL `POST /graphql`, credentialed requests, and approved deployment SSH, while the internal API port remains blocked publicly.
* [ ] Provide the safe locations/commands for application stdout/stderr, PM2 logs, web access/error logs, and the retention/rotation policy.
* [ ] Confirm monitoring/alerts for PM2 process crashes/restarts, disk/quota pressure, memory/CPU limits, TLS expiry, and database availability; name the alert recipient/escalation path.

### 11. Resource and process limits

* [ ] Provide account limits: CPU, RAM, PM2/Node process count, execution/runtime limits, file/inode quota, bandwidth, and maximum open files/processes/connections if enforced.
* [ ] Confirm the permitted Node heap setting and whether the existing PM2 `--max-old-space-size=2048` is allowed. Do not assume it is safe on shared hosting (`api\ecosystem.config.cjs:66-69`).
* [ ] Confirm maximum reverse-proxy request/idle timeout and MySQL connection limit.
* [ ] Confirm whether long-running report/document operations have a host timeout or require an operational cap. This release starts with one API process and no queue worker.

### 12. Support, incident response, and rollback

* [ ] Name the administrator/support contact, hours, escalation route, and expected response time for outage, PM2 failure, proxy/DNS/TLS issue, database restore, and resource-limit events.
* [ ] Confirm who may restart PM2, change proxy/DNS/TLS settings, restore MySQL, and roll back a release.
* [ ] Confirm the rollback procedure: retain previous static `app/dist` artifact and previous API release outside public web root; restore them; run the approved PM2 restart; restore database only under the documented migration/data decision.
* [ ] Confirm release evidence the administrator will provide or retain: Node/npm/PM2 version output, selected topology/domains/internal port, PM2 status after restart, log location, TLS/redirect result, database backup identifier, and migration operator/result—never secrets.

## Blocking vs confirmation-only instructions

End the questionnaire with two check-box sections. Use the following exact distinction:

### Blocking before implementation/release

> These answers are required before final frontend build values, PM2 setup, proxy configuration, or database release work can be chosen. An unavailable item needs a documented supported alternative; otherwise deployment stops.

* [ ] Persistent PM2-permitted Node runtime (or administrator-owned equivalent), supported Node/npm versions, application root, and durable startup/restart/log procedure.
* [ ] Exact frontend/API HTTPS domains, DNS ownership, and one confirmed topology: server-level same-origin `/graphql` proxy or named separate API domain.
* [ ] Unique private API port/socket, bind/proxy behavior, and firewall rule that prevents direct public access.
* [ ] Frontend document root, API location outside public root, and SPA fallback/mod_rewrite confirmation.
* [ ] Protected environment-variable method and the exact build-time `VITE_GRAPHQL_URL`; never use `localhost`, a LAN address, or production `http://`.
* [ ] Exact CORS origin and HTTPS cookie/session model compatible with `credentials: 'include'`.
* [ ] MySQL host/database/access policy, migration authority, connection limit, verified backup/restore path, and required database TLS/CA policy.
* [ ] TLS coverage/forced HTTPS, approved logs/restart access, and resource limits sufficient for one API process.

### Confirmation-only before go-live

> These do not determine the architecture, but must be recorded and verified during release acceptance.

* [ ] PM2 log rotation/retention, monitoring dashboard/alerts, support contacts, escalation targets, and operating hours.
* [ ] WebSocket capability recorded as “not required” unless a later feature needs it.
* [ ] Upload storage recorded as “not applicable for this release.”
* [ ] Final PM2 status, artifact checksum, smoke-test results (deep link, login/logout, authorized GraphQL action, session after restart), and rollback owner.

## Source and scope notes for the author

Keep the questionnaire focused on administrator-owned facts. It must not promise that cPanel has Passenger, root access, server-level proxy modules, or PM2 persistence; those are questions. Although the planned deployment uses PM2, the revised production plan warns that both existing PM2 ecosystem files are development/cloud-oriented: the root file starts the Vite dev server and clusters the API, while `api\ecosystem.config.cjs` uses an obsolete absolute path. The administrator must therefore confirm the host-specific PM2 procedure; do not instruct them to deploy either file unchanged (`docs\SubAgent docs\cpanel-production-plan-revision-spec.md:13-16, 85-89`).

Do not claim health endpoints exist: they are recommended future work, but the current API exposes only GraphQL. Do not include credentials in examples. The questionnaire should be approximately 3–5 printed pages and retain the listed headings so the reply can be audited against the production plan.
