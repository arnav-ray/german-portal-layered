# German Mastery Hub

An immersive German learning platform with ocean-themed design, featuring articles from Google Sheets, AI-powered podcasts, interactive grammar drills, and an AI conversation teacher.

**Live Demo**: [https://german.arnavray.ca](https://german.arnavray.ca)

## Features

### Level-Based Learning System
- **A2-B1**: Beginner to intermediate content
- **B2**: Upper intermediate material
- **C1+**: Advanced topics and complex grammar
- Articles automatically categorized by difficulty
- Color-coded grammar highlighting for all parts of speech

### Grammar Color Coding
- Blue — Masculine nouns
- Pink — Feminine nouns
- Cyan — Neuter nouns
- Purple — Verbs (underlined)
- Yellow — Adjectives
- Green — Adverbs (italic)
- Magenta — Prepositions
- Light Blue — Conjunctions
- Gold — Pronouns
- Violet — Articles

### Podcast Integration
- 5 categories served from `/api/get-podcasts`:
  - AI & Technology (B2)
  - Finance & Business (B2)
  - Leadership & Strategy (C1+)
  - Science & Innovation (B2)
  - Sunday Specials (A2-B1)
- Full transcripts with grammar highlighting

### AI German Teacher
- Conversational AI for practice via `/api/ai-conversation`
- Grammar correction with explanations
- Progress metrics and fluency scoring
- Context-aware responses

### Grammar Drills
- Auto-generated from article content
- Exercise types: article selection, vocabulary matching, fill-in-the-blank, multiple choice
- Completion tracking

### Progress Tracking
- Articles read, podcasts listened, exercises completed
- Daily streak system with level-specific progress bars
- Data persists in browser localStorage

---

## Quick Start

### Prerequisites
- Node.js 18+
- Vercel account (for deployment)
- Google Sheets API key (optional)

### Local Development

1. **Clone the repository**
```bash
git clone https://github.com/arnav-ray/german-portal-layered.git
cd german-portal-layered
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**

Create a `.env` file in the root:
```env
# Google Sheets (required for articles)
GOOGLE_SHEET_ID=your-sheet-id-here

# Google Sheets API v4 key (optional — falls back to CSV export)
VITE_GOOGLE_API_KEY=your-google-api-key-here

# CORS allowed origin (optional — defaults to https://german.arnavray.ca)
ALLOWED_ORIGIN=http://localhost:3000
```

4. **Run locally with Vercel CLI**
```bash
npm install -g vercel
vercel dev
```

Or use a simple HTTP server for the static frontend only:
```bash
python -m http.server 8000
# Visit http://localhost:8000
```

---

## Google Sheets Setup

### Required Columns
| Column | Description |
|--------|-------------|
| `DATE` | Article date (YYYY-MM-DD) |
| `LEVEL` | Difficulty: A2-B1, B2, or C1+ |
| `THEME` | Article topic |
| `STATUS` | Must be `Published` to display |
| `GERMAN_ARTICLE` | Main German text |
| `ENGLISH_TRANSLATION` | English translation |
| `VOCABULARY_USED` | Format: `word1 - translation1, word2 - translation2` |
| `DEEP_DIVE_GRAMMAR` | Grammar explanations |
| `PHRASE_AND_IDIOM` | Common phrases |
| `QUOTE_AND_JOKE` | Quotes or humor |
| `CONVERSATION_TIME` | Dialog examples |
| `GRAMMAR_TOPIC_TAGS` | Comma-separated tags (e.g., `Perfekt,Dativ`) |
| `DRILL_SENTENCES` | Practice sentences |

### Making Your Sheet Public
1. Open your Google Sheet → Share → "Anyone with the link" → Viewer
2. The API will work without an API key using CSV export fallback

---

## Deployment to Vercel

### Via Vercel Dashboard
1. Import `arnav-ray/german-portal-layered` from GitHub
2. **Framework Preset**: Other
3. **Build Command**: *(leave blank)*
4. **Output Directory**: *(leave blank)*
5. Add environment variables (see table below)
6. Deploy

### Environment Variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `GOOGLE_SHEET_ID` | Yes | Google Sheet ID for articles |
| `VITE_GOOGLE_API_KEY` | No | Sheets API v4 key (faster, optional) |
| `ALLOWED_ORIGIN` | No | CORS origin (defaults to `https://german.arnavray.ca`) |

### Custom Domain (german.arnavray.ca)
In Vercel: Project → Settings → Domains → Add `german.arnavray.ca`

Then add this DNS record in GoDaddy:

| Type | Name | Value | TTL |
|------|------|-------|-----|
| CNAME | `german` | `cname.vercel-dns.com` | 600 |

---

## Project Structure

```
german-portal-layered/
├── index.html                  # Main single-page application
├── vercel.json                 # Vercel config (cleanUrls, CORS headers)
├── package.json                # Project dependencies
├── .gitignore
├── LICENSE                     # Apache 2.0
├── README.md
├── netlify.toml.disabled       # Legacy Netlify config (inactive)
└── api/                        # Vercel serverless functions
    ├── ai-conversation.js      # AI chat and grammar checking
    ├── get-articles.js         # Google Sheets article fetcher
    └── get-podcasts.js         # Podcast episode provider
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/ai-conversation` | Grammar check + AI response |
| `GET` | `/api/get-articles` | Fetch articles from Google Sheets |
| `GET` | `/api/get-podcasts?category=<cat>` | Fetch podcast episode by category |

Valid categories: `ai-tech`, `finance-business`, `leadership-strategy`, `science-innovation`, `sunday-specials`

### Example: AI Conversation
```bash
curl -X POST https://german.arnavray.ca/api/ai-conversation \
  -H "Content-Type: application/json" \
  -d '{"message": "Ich habe gegangen zum Supermarkt."}'
```

---

## Technology Stack

- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Backend**: Vercel Serverless Functions (Node.js)
- **Data Source**: Google Sheets API (with CSV export fallback)
- **Hosting**: Vercel
- **Storage**: Browser localStorage

---

## Customisation

### Theme Colors
Edit CSS variables in `index.html`:
```css
:root {
  --ocean-deep: #0a0e27;
  --ocean-mid: #003c40;
  --accent-cyan: #00acc1;
  --accent-blue: #4fc3f7;
}
```

### Grammar Rules (AI Teacher)
Edit `api/ai-conversation.js`:
```javascript
const rules = [
  {
    pattern: /your-pattern/i,
    original: 'error text',
    corrected: 'correct text',
    explanation: 'Grammar rule explanation'
  }
];
```

---

## Troubleshooting

| Problem | Solution |
|---------|---------|
| Articles not loading | Check `GOOGLE_SHEET_ID` env var; verify STATUS = "Published"; site falls back to sample data |
| Podcasts not loading | Check `/api/get-podcasts` response in browser Network tab |
| AI Teacher not responding | Check `/api/ai-conversation` is reachable; works without API key in basic mode |
| Grammar colours not visible | Clear browser cache; check JS is enabled |

---

## Security

This project follows standard web security practices:
- All user-supplied and external data rendered via `innerHTML` is escaped with `escapeHtml()`
- Serverless functions validate input length and method
- CORS headers restrict origins via `ALLOWED_ORIGIN` env var
- Security headers set on all API responses: `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`

---

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

---

## License

Copyright 2024 Arnav Ray

Licensed under the [Apache License, Version 2.0](LICENSE).

---

## Author

**Arnav Ray**
- Website: [arnavray.ca](https://arnavray.ca)
- GitHub: [@arnav-ray](https://github.com/arnav-ray)

---

*Viel Erfolg beim Deutschlernen!*
