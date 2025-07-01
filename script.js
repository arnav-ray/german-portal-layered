// Temporary hardcoded data for testing
const TEST_ARTICLES = [
    {
        date: '2025-07-01',
        theme: 'Job Interview',
        grammar: 'Perfect tense',
        german: 'Heute habe ich ein wichtiges Vorstellungsgespräch gehabt. Ich habe meinen Lebenslauf vorbereitet und bin pünktlich angekommen. Der Arbeitgeber hat mir viele Fragen über meine Erfahrung gestellt. Ich habe alle Fragen beantwortet und bin sehr nervös gewesen. Am Ende habe ich gefragt, wann ich eine Antwort bekommen werde. Das Gespräch ist sehr gut gelaufen.',
        english: 'Today I had an important job interview. I prepared my CV and arrived on time. The employer asked me many questions about my experience. I answered all questions and was very nervous. At the end I asked when I would get an answer. The conversation went very well.',
        vocabulary: 'Vorstellungsgespräch, Lebenslauf, Arbeitgeber, Erfahrung, nervös, pünktlich'
    },
    {
        date: '2025-07-02',
        theme: 'Apartment Hunting',
        grammar: 'Dative case',
        german: 'Gestern bin ich mit dem Makler zu einer Wohnung gefahren. Die Wohnung gefällt mir sehr gut. Sie liegt in der Nähe vom Zentrum und hat einen großen Balkon. Der Makler hat mir alle Zimmer gezeigt. Ich habe ihm viele Fragen gestellt. Die Miete ist etwas teuer, aber die Lage ist perfekt.',
        english: 'Yesterday I went to an apartment with the real estate agent. I like the apartment very much. It is close to the center and has a large balcony. The agent showed me all the rooms. I asked him many questions. The rent is a bit expensive, but the location is perfect.',
        vocabulary: 'Makler, Wohnung, Zentrum, Balkon, Zimmer, Miete, Lage'
    }
];

// Global variables
let articles = TEST_ARTICLES;
let currentArticle = null;

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    console.log('Page loaded, starting app...');
    loadArticles();
});

// Load articles (using test data for now)
function loadArticles() {
    console.log('Loading articles...', articles);
    displayTodayArticle();
    setupThemeNavigation();
}

// Display today's article
function displayTodayArticle() {
    const today = new Date().toISOString().split('T')[0];
    console.log('Looking for article for date:', today);
    
    // First try to find today's article, then fallback to any article
    currentArticle = articles.find(article => article.date === today);
    
    if (!currentArticle && articles.length > 0) {
        console.log('No article for today, using first available article');
        currentArticle = articles[0];
    }
    
    if (currentArticle) {
        console.log('Displaying article:', currentArticle);
        displayArticle(currentArticle);
    } else {
        console.log('No articles available');
        document.getElementById('loading').innerHTML = 'No articles available. Please add some content to your Google Sheet.';
    }
}

// Display an article
function displayArticle(article) {
    console.log('Displaying article:', article.theme);
    
    const vocabularyWords = article.vocabulary.split(', ');
    let germanText = article.german;
    
    // Highlight vocabulary words
    vocabularyWords.forEach(word => {
        const cleanWord = word.trim();
        // More flexible regex that handles German characters
        const regex = new RegExp(`\\b${cleanWord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
        germanText = germanText.replace(regex, `<span class="vocabulary-word" title="Click for translation">${cleanWord}</span>`);
    });
    
    const displayHTML = `
        <div class="metadata">
            <strong>Theme:</strong> ${article.theme} | 
            <strong>Grammar Focus:</strong> ${article.grammar} |
            <strong>Date:</strong> ${article.date}
        </div>
        <div class="german-text">${germanText}</div>
        <div class="english-text">${article.english}</div>
        <div style="margin-top: 20px;">
            <strong>Key Vocabulary:</strong> ${article.vocabulary}
        </div>
    `;
    
    document.getElementById('article-display').innerHTML = displayHTML;
    document.getElementById('article-display').style.display = 'block';
    document.getElementById('loading').style.display = 'none';
    document.getElementById('theme-nav').style.display = 'block';
}

// Set up theme navigation
function setupThemeNavigation() {
    const themes = [...new Set(articles.map(article => article.theme))];
    const buttonContainer = document.getElementById('theme-buttons');
    
    console.log('Setting up themes:', themes);
    
    themes.forEach(theme => {
        const button = document.createElement('button');
        button.className = 'theme-btn';
        button.textContent = theme;
        button.onclick = () => showArticlesByTheme(theme);
        buttonContainer.appendChild(button);
    });
}

// Show articles by theme
function showArticlesByTheme(theme) {
    console.log('Showing articles for theme:', theme);
    const themeArticles = articles.filter(article => article.theme === theme);
    if (themeArticles.length > 0) {
        displayArticle(themeArticles[0]);
    }
}

// TODO: Once Google Sheets is working, replace this with the API version
/*
async function loadArticlesFromGoogleSheets() {
    const SHEET_ID = '1WbU27bSvjaHWCdCl7deU9-iEBTCmlSZe8l99-ppxfS8';
    const SHEET_NAME = 'Sheet1';
    const API_KEY = 'AIzaSyBjd0EF0ghF3hZdpB-0wSbeEBkrSDhG1J8';
    
    try {
        const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${SHEET_NAME}?key=${API_KEY}`;
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.values && data.values.length > 1) {
            articles = parseSheetData(data.values);
            displayTodayArticle();
            setupThemeNavigation();
        }
    } catch (error) {
        console.error('Error loading articles from Google Sheets:', error);
        // Fallback to test data
        loadArticles();
    }
}

function parseSheetData(rows) {
    const articles = [];
    
    for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (row.length >= 7 && row[6] === 'Published') {
            articles.push({
                date: row[0],
                theme: row[1],
                grammar: row[2],
                german: row[3],
                english: row[4],
                vocabulary: row[5]
            });
        }
    }
    
    return articles;
}
*/
