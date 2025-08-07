# 🌊 German Mastery Hub

An immersive German learning platform with ocean-themed design, featuring articles from Google Sheets, AI-powered podcasts, interactive grammar drills, and an AI conversation teacher.

🌐 **Live Demo**: [https://german.arnavray.ca](https://german.arnavray.ca)

## ✨ Features

### 📚 Level-Based Learning System
- **A2-B1**: Beginner to intermediate content
- **B2**: Upper intermediate material  
- **C1+**: Advanced topics and complex grammar
- Articles automatically categorized by difficulty
- Color-coded grammar highlighting for all parts of speech

### 🎨 Grammar Color Coding
- 🔵 **Blue** - Masculine nouns
- 🩷 **Pink** - Feminine nouns
- 🟦 **Cyan** - Neuter nouns
- 🟣 **Purple** - Verbs (underlined)
- 🟡 **Yellow** - Adjectives
- 🟢 **Green** - Adverbs (italic)
- 🔴 **Magenta** - Prepositions
- 🔷 **Light Blue** - Conjunctions
- 🟨 **Gold** - Pronouns
- 🟪 **Violet** - Articles

### 🎧 Podcast Integration
- Fetches German podcasts from [podcast.arnavray.ca](https://podcast.arnavray.ca)
- 5 Categories:
  - AI & Technology (B2)
  - Finance & Business (B2)
  - Leadership & Strategy (C1+)
  - Science & Innovation (B2)
  - Sunday Specials (A2-B1)
- Podcasts converted to practice articles
- Full transcripts with grammar highlighting

### 💬 AI German Teacher
- Conversational AI for practice
- Grammar correction with explanations
- Progress metrics and fluency scoring
- Works with or without API key (basic/full modes)
- Context-aware responses based on current article

### ✍️ Grammar Drills
- Auto-generated from article content
- Multiple exercise types:
  - Article selection (der/die/das)
  - Vocabulary matching
  - Fill in the blanks
  - Multiple choice questions
- Tracks completion for progress

### 📊 Progress Tracking
- Articles read counter
- Podcasts listened tracker
- Exercises completed
- Daily streak system
- Level-specific progress bars
- Data persists in browser storage

## 🚀 Quick Start

### Prerequisites
- Node.js 14+
- Netlify account (for deployment)
- Google Sheets API key (optional)
- Gemini API key (optional, for AI teacher)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/german-portal-layered.git
cd german-portal-layered
```

2. **Install dependencies**
```bash
npm install
cd netlify/functions
npm install
cd ../..
```

3. **Set up environment variables**

Create a `.env` file in the root directory:
```env
# Google Sheets API (optional - works without it using sample data)
VITE_GOOGLE_SHEET_ID=1WbU27bSvjaHWCdCl7deU9-iEBTCmlSZe8l99-ppxfS8
VITE_GOOGLE_API_KEY=your-google-api-key-here

# Gemini AI (optional - basic responses work without it)
GEMINI_API_KEY=your-gemini-api-key-here
```

4. **Run locally with Netlify Dev**
```bash
netlify dev
```

Or use a simple HTTP server:
```bash
python -m http.server 8000
# Visit http://localhost:8000
```

## 📋 Google Sheets Setup

### Required Columns
Your Google Sheet must have these columns:
- `DATE` - Article date (YYYY-MM-DD)
- `LEVEL` - Optional, auto-detected if missing
- `THEME` - Article topic/theme
- `STATUS` - Must be "Published" to display
- `GERMAN_ARTICLE` - Main German text
- `ENGLISH_TRANSLATION` - English translation
- `VOCABULARY_USED` - Format: "word1 - translation1, word2 - translation2"
- `DEEP_DIVE_GRAMMAR` - Grammar explanations
- `PHRASE_AND_IDIOM` - Common phrases
- `QUOTE_AND_JOKE` - Quotes or humor
- `CONVERSATION_TIME` - Dialog examples
- `GRAMMAR_TOPIC_TAGS` - Comma-separated tags (e.g., "Perfekt,Dativ")
- `DRILL_SENTENCES` - Practice sentences

### Making Your Sheet Public
1. Open your Google Sheet
2. Click "Share" → "Anyone with the link"
3. Set to "Viewer" permissions
4. Sheet will work without API key

### Using Private Sheets
1. Enable Google Sheets API in Google Cloud Console
2. Create API key
3. Add to environment variables
4. Restrict key to Sheets API only

## 🌐 Deployment to Netlify

### Via Netlify CLI
```bash
# Install Netlify CLI globally
npm install -g netlify-cli

# Login to Netlify
netlify login

# Create new site
netlify init

# Deploy
netlify deploy --prod
```

### Via GitHub Integration
1. Push code to GitHub
2. Connect repository to Netlify
3. Configure build settings:
   - Build command: `echo "No build needed"`
   - Publish directory: `.`
4. Add environment variables in Netlify dashboard
5. Deploy!

### Environment Variables in Netlify
1. Go to Site settings → Environment variables
2. Add:
   - `VITE_GOOGLE_SHEET_ID`
   - `VITE_GOOGLE_API_KEY` (optional)
   - `GEMINI_API_KEY` (optional)

## 🎯 Features Breakdown

### Articles System
- Fetches from Google Sheets or uses sample data
- Auto-categorizes into difficulty levels
- Grammar color coding applied automatically
- Navigate with Previous/Next buttons
- Practice exercises for each article

### Podcast Integration
- Click "Load Episode" for each category
- Fetches fresh content from podcast.arnavray.ca
- Converts to article format for practice
- Includes:
  - Play button (uses browser TTS)
  - Full transcript
  - Grammar highlighting
  - Vocabulary extraction

### AI Teacher
- **Without API key**: Basic grammar checking and suggestions
- **With Gemini API**: Full conversational AI
- Features:
  - Real-time grammar correction
  - Fluency scoring (0-100%)
  - Contextual responses
  - Learning suggestions

### Grammar Drills
- Select topics from checkboxes
- Generate custom exercises
- Track completion
- Updates progress automatically

### Progress Tracking
- Stored in browser localStorage
- Tracks:
  - Articles by level
  - Podcast episodes
  - Exercise completion
  - Daily streaks
- Visual progress bars

## 🛠️ Configuration

### Customizing Theme Colors
Edit CSS variables in `index.html`:
```css
:root {
  --ocean-deep: #0a0e27;
  --ocean-mid: #003c40;
  --accent-cyan: #00acc1;
  --accent-blue: #4fc3f7;
  /* ... more colors */
}
```

### Adding New Grammar Rules
Edit `netlify/functions/ai-conversation.js`:
```javascript
const grammarRules = [
  {
    pattern: /your-pattern/i,
    original: 'error text',
    corrected: 'correct text',
    explanation: 'Grammar rule explanation'
  }
];
```

### Modifying Level Detection
Edit `categorizeLevel()` function in `index.html`:
```javascript
function categorizeLevel(article) {
  // Add your detection logic
  if (theme.includes('your-keyword')) {
    return 'C1+';
  }
  // ... more rules
}
```

## 🐛 Troubleshooting

### Articles Not Loading
- Check if Google Sheet is public or API key is set
- Verify STATUS column contains "Published"
- Check browser console for errors
- Site uses sample data if connection fails

### Podcasts Not Loading
- Ensure podcast.arnavray.ca is accessible
- Check for CORS errors in console
- Falls back to sample episodes automatically

### AI Teacher Not Responding
- Works without API key (limited features)
- Add GEMINI_API_KEY for full functionality
- Check network tab for API errors

### Grammar Colors Not Visible
- Clear browser cache
- Toggle dark/light theme
- Check if JavaScript is enabled

## 📁 Project Structure

```
german-portal-layered/
├── index.html                 # Main application file
├── netlify.toml              # Netlify configuration
├── package.json              # Project dependencies
├── .gitignore               # Git ignore file
├── README.md                # This file
└── netlify/
    └── functions/           # Serverless functions
        ├── get-articles.js  # Fetch Google Sheets data
        ├── get-podcasts.js  # Fetch podcast episodes
        ├── ai-conversation.js # AI chat functionality
        └── package.json     # Function dependencies
```

## 🔧 Technology Stack

- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Backend**: Netlify Functions (AWS Lambda)
- **Data Source**: Google Sheets API
- **AI**: Google Gemini API
- **Podcasts**: Integration with podcast.arnavray.ca
- **Hosting**: Netlify
- **Storage**: Browser localStorage

## 📝 API Endpoints

### Netlify Functions
- `/.netlify/functions/get-articles` - Fetches articles from Google Sheets
- `/.netlify/functions/get-podcasts` - Retrieves German podcasts
- `/.netlify/functions/ai-conversation` - Handles AI chat

### External APIs
- Google Sheets API v4
- Google Gemini AI
- podcast.arnavray.ca API

## 🎨 Design Features

- **Ocean Theme**: Matching [arnavray.ca](https://arnavray.ca) aesthetic
- **Animated Backgrounds**: Wave effects and gradients
- **Glassmorphism**: Blur effects on cards
- **Responsive Design**: Mobile-first approach
- **Dark Mode**: Toggle between light/dark themes
- **Accessibility**: ARIA labels and semantic HTML

## 🚦 Testing Checklist

- [ ] Articles load from Google Sheets
- [ ] Articles grouped by level (A2-B1, B2, C1+)
- [ ] Grammar color coding visible
- [ ] Navigation between articles works
- [ ] Practice exercises generate
- [ ] Podcasts load when clicked
- [ ] Podcast transcripts show with colors
- [ ] Grammar drill creates questions
- [ ] AI teacher responds
- [ ] Progress tracking updates
- [ ] Dark/light theme toggle works
- [ ] Mobile responsive design

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 👤 Author

**Arnav Ray**
- Website: [arnavray.ca](https://arnavray.ca)
- GitHub: [@arnav-ray](https://github.com/arnav-ray)
- Podcast Platform: [podcast.arnavray.ca](https://podcast.arnavray.ca)

## 🙏 Acknowledgments

- Google Sheets for data storage
- Netlify for hosting and serverless functions
- Google Gemini for AI capabilities
- The German learning community

## 📞 Support

For issues or questions:
- Open an issue on GitHub
- Email: arnav@arnavray.ca

---

**Built with 💙 for German language learners worldwide**

*Viel Erfolg beim Deutschlernen!* 🇩🇪
