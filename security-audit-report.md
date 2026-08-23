# Security Audit — build-your-first-ai-companion — 2026-08-23

Scope: full repo (first-time audit)
Stack: TypeScript, Next.js 15 (App Router), React 19, Convex (anonymous local dev), npm
Layers run: vibe-security, fallow (skipped — no diff baseline), secrets (grep; gitleaks N/A), deps (npm audit), iac/ci (none present)
Result: 0 Critical, 1 High, 2 Medium, 3 Low

---

[SEC-001] Transitive high-severity vulnerabilities in Next.js dependency tree (postcss, sharp)
Severity: HIGH | Confidence: HIGH
CWE: CWE-1395 | OWASP: A06:2021
Location: package-lock.json (next → postcss, next → sharp)
Sources: npm audit

WHAT: `npm audit --audit-level=high` reports 3 high-severity issues in transitive dependencies: PostCSS XSS/path-traversal/source-map disclosures (GHSA-qx2v-qp2m-jg93 and related) and sharp/libvips CVEs (GHSA-f88m-g3jw-g9cj). Both are pulled in via `next@15.5.x`.
IMPACT: PostCSS issues primarily affect build-time CSS processing; sharp affects Next.js `Image` optimization at runtime. Exploitability on this mostly static landing page is limited, but a compromised or malicious CSS pipeline input could affect builds; sharp/image paths matter if untrusted images are ever processed.
EVIDENCE:
```
postcss <=8.5.22 — high (via next)
sharp <0.35.0 — high (via next)
fix available via npm audit fix --force → next@16.3.2 (breaking)
```
FIX:
    Track Next.js security releases; upgrade Next when a patched 15.x or planned 16.x is validated.
    Do not run `npm audit fix --force` blindly — it jumps major versions.
    Re-run `npm audit --audit-level=high` after upgrades.

---

[SEC-002] Public Convex query without authentication guard (pattern violation)
Severity: MEDIUM | Confidence: HIGH
CWE: CWE-862 | OWASP: A01:2021
Location: convex/health.ts:3-8
Sources: vibe-security (database-security.md — Convex)

WHAT: `health.ping` is a public `query` with no `ctx.auth.getUserIdentity()` check. It currently returns only `{ ok: true }`, but establishes a pattern where future data-bearing queries may ship without auth.
IMPACT: Today: negligible (no sensitive data). When tables and mutations are added: unauthenticated read/write if the same pattern continues.
EVIDENCE:
```ts
export const ping = query({
  args: {},
  handler: async () => {
    return { ok: true as const };
  },
});
```
FIX:
    For health checks that must stay public, document intent in-file.
    Before adding user/data functions: require `ctx.auth.getUserIdentity()` (or use `internalQuery` for server-only callers).
    Convert `ping` to `internalQuery` if only used from Convex cron/actions later.

---

[SEC-003] No Convex access-control baseline before backend expansion
Severity: MEDIUM | Confidence: MEDIUM
Location: convex/schema.ts:1-3
Sources: vibe-security (database-security.md — Convex)

WHAT: Schema is empty and no auth provider is configured (intentional for now). No project convention yet for public vs internal functions or ownership checks on mutations.
IMPACT: Low today; high risk of accidental open-data exposure when features are added quickly without auth guards.
EVIDENCE:
```ts
export default defineSchema({});
```
FIX:
    Before first real table: define auth approach (Convex Auth or external IdP).
    Template new `query`/`mutation` files with auth checks from day one.
    Use `internalMutation`/`internalQuery` for privileged operations.

---

[SEC-004] No security CI pipeline
Severity: LOW | Confidence: HIGH
Location: .github/ (missing)
Sources: security-audit (ci-pipeline.md)

WHAT: No GitHub Actions (or other CI) workflow for gitleaks, dependency audit, or Fallow on push/PR.
IMPACT: Regressions (committed secrets, new vulnerable deps, unauthenticated Convex functions) won't be caught automatically.
FIX:
    Add `.github/workflows/security.yml` per security-audit skill (gitleaks + `npm audit --audit-level=high` + optional Fallow on diff).

---

[SEC-005] Missing HTTP security headers in Next.js config
Severity: LOW | Confidence: MEDIUM
Location: next.config.ts:1-5
Sources: vibe-security (web attack surface — defense in depth)

WHAT: `next.config.ts` is empty — no `Content-Security-Policy`, `X-Frame-Options`, `Referrer-Policy`, or `Permissions-Policy` headers.
IMPACT: Slightly wider XSS/clickjacking surface if user-generated or third-party content is added later. Minimal for current static birthday page.
EVIDENCE:
```ts
const nextConfig: NextConfig = {};
export default nextConfig;
```
FIX:
    Add `headers()` in `next.config.ts` with baseline CSP and frame protections before shipping user content or embeds.

---

[SEC-006] Build/runtime hard-fail when Convex env is unset
Severity: LOW | Confidence: HIGH
Location: src/app/ConvexClientProvider.tsx:6-12
Sources: vibe-security (secrets-and-env.md)

WHAT: Client bundle throws at module init if `NEXT_PUBLIC_CONVEX_URL` is missing. Correct for local dev; CI/production must inject the var or builds fail.
IMPACT: Operational — not a direct exploit. Error message hints at setup steps (informational only).
EVIDENCE:
```ts
if (!convexUrl) {
  throw new Error(
    "Missing NEXT_PUBLIC_CONVEX_URL. Run `npx convex dev --once` to generate .env.local.",
  );
}
```
FIX:
    Document required env vars in `.env.example` (done).
    Set `NEXT_PUBLIC_CONVEX_URL` in deployment platform secrets/env for production builds.

---

## Expected / not findings

- **NEXT_PUBLIC_CONVEX_URL in client bundle** — required for Convex browser client; not a secret (vibe-security secrets-and-env.md).
- **Anonymous local Convex (`127.0.0.1:3210`)** — dev-only agent mode; not exposed to internet until claimed/deployed.
- **No auth/login** — user-requested scope; flagged as future risk above, not a current bug.

## Layers skipped

| Layer | Reason |
| --- | --- |
| gitleaks | Not installed on host; manual grep found no secret patterns |
| fallow security | Single-commit repo; `--changed-since HEAD~1` invalid; no `review:fallow:security` script |
| IaC/container | No Dockerfile, Terraform, or K8s manifests |

## Secret scan (grep fallback)

Patterns searched: `sk_live_`, `AKIA`, `ghp_`, `glpat-`, PEM private keys, embedded DB passwords — **no matches** in tracked source. `.env.local` is gitignored (`.env*` with `!.env.example`). No `.env` files tracked by git.

## Attack paths

None critical today. **Future chain (SEC-002 + SEC-003):** add `messages` table with public `query`/`mutation` and no auth → unauthenticated read/write of birthday messages. Mitigate before feature work.

## Summary

SEC-001 HIGH package-lock.json — upgrade Next/postcss/sharp when patched release available
SEC-002 MEDIUM convex/health.ts:3 — add auth pattern before data functions; document or internalize ping
SEC-003 MEDIUM convex/schema.ts:1 — establish Convex auth + internal/public conventions before first table
SEC-004 LOW .github/ — add security CI workflow
SEC-005 LOW next.config.ts:3 — add baseline security headers before user content
SEC-006 LOW src/app/ConvexClientProvider.tsx:8 — ensure prod env vars in deploy pipeline
