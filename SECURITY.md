# Security Policy

## Supported Versions

| Version | Supported |
|---------|-----------|
| Latest on `main` | Yes |
| Older branches | No |

## Reporting a Vulnerability

Please **do not** open a public GitHub issue for security vulnerabilities.

Email **arnav@arnavray.ca** with:
- A description of the vulnerability
- Steps to reproduce
- Potential impact

You will receive a response within **72 hours**. If confirmed, a fix will be released as soon as practicable and you will be credited (unless you prefer otherwise).

---

## Security Architecture

### Hosting
- Deployed on **Vercel** (serverless, no persistent server process)
- Static frontend served from Vercel CDN
- API functions run in isolated Vercel serverless containers

### Serverless Functions (`api/`)

| Function | Method | Auth | Input validation |
|----------|--------|------|-----------------|
| `ai-conversation` | POST only | None (public) | Message must be a non-empty string, max 2000 chars |
| `get-articles` | GET only | None (public) | No user input |
| `get-podcasts` | GET only | None (public) | `category` validated against allowlist |

**Security headers set on every API response:**
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Access-Control-Allow-Origin: <ALLOWED_ORIGIN env var>` (defaults to `https://german.arnavray.ca`)

### Frontend (`index.html`)

**Content Security Policy** (meta tag):
```
default-src 'self';
script-src 'self' 'unsafe-inline';
style-src 'self' 'unsafe-inline';
connect-src 'self' https://api.dictionaryapi.dev https://docs.google.com https://sheets.googleapis.com;
img-src 'self' data:;
frame-ancestors 'none';
```

**Output encoding:**  
All user-supplied and externally sourced data rendered into `innerHTML` is passed through `escapeHtml()`, which encodes `&`, `<`, `>`, `"`, and `'`. This covers:
- Article fields from Google Sheets (THEME, LEVEL, GERMAN_ARTICLE, translations, vocabulary, etc.)
- Grammar drill sentences and theme name
- Dictionary API definitions
- Vocabulary card content

**Data storage:**  
- All user progress is stored in **browser `localStorage` only**
- No personal data is transmitted to any server
- Users can export or delete all stored data via the Privacy section
- GDPR consent banner is shown on first visit; storage is disabled if declined

**External data sources:**
| Source | Used for | Trust level |
|--------|---------|-------------|
| Google Sheets CSV (author-controlled) | Articles | Trusted but output-encoded |
| `api.dictionaryapi.dev` | Word definitions | Untrusted — output encoded before rendering |
| Vercel Functions (`/api/*`) | AI teacher, podcasts | Same origin |

### Dependency surface

The project has **no npm runtime dependencies** for the frontend. The `api/` functions use only Node.js built-ins and the native `fetch` API (available in Node 18+). There is no `node_modules` shipped to production.

---

## Known Limitations / Accepted Risks

| Item | Risk | Reason accepted |
|------|------|-----------------|
| `unsafe-inline` in CSP | Medium — allows inline script/style injection if XSS is achieved | Required because all JS/CSS is inline in `index.html`; would need a build step to fix |
| `GERMAN_ARTICLE` rendered as `textContent`-safe HTML | Low | Author controls the Google Sheet; content is output-encoded |
| No rate limiting on `/api/ai-conversation` | Low | Function does no external API calls; CPU cost is negligible |
| No authentication on API endpoints | Informational | All content is intentionally public |

---

## Security Changelog

| Date | Change |
|------|--------|
| 2024 | Initial Vercel migration; added security headers to all API functions |
| 2024 | Fixed XSS: `theme` unescaped in `setupGrammarDrill` innerHTML |
| 2024 | Fixed XSS: `data.definition` from dictionary API unescaped in `showWordInfo` |
| 2024 | Fixed XSS: `article.THEME` unescaped in article list buttons |
| 2024 | Fixed XSS: `article.GERMAN_ARTICLE` unescaped in article display |
| 2024 | Fixed XSS: vocabulary card fields (`word`, `article`, `english`, `example`, `translation`) unescaped |
| 2024 | Removed false-positive grammar rule that incorrectly flagged correct German as an error |
| 2024 | Added GET-only method enforcement to `get-articles` |
| 2024 | Removed duplicate CORS headers from `vercel.json` (functions set their own via `ALLOWED_ORIGIN`) |
| 2024 | Removed unused `@google/generative-ai` dependency |
| 2024 | Deleted legacy `netlify/` directory and `netlify.toml.disabled` |
