// Your Google Sheets ID (you'll get this from your sheet URL)
const SHEET_ID = '1WbU27bSvjaHWCdCl7deU9-iEBTCmlSZe8l99-ppxfS8'; // Replace this
const SHEET_NAME = 'Sheet1'; // Replace this
const API_KEY = 'AIzaSyBjd0EF0ghF3hZdpB-0wSbeEBkrSDhG1J8'; // We'll set this up next

// Global variables
let articles = [];
let currentArticle = null;

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    loadArticles();
});

// Load articles from Google Sheets
async function loadArticles() {
    try {
        const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${SHEET_NAME}?key=${API_KEY}`;
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.values) {
            articles = parseSheetData(data.values);
            displayTodayArticle();
            setupThemeNavigation();
        }
    } catch (error) {
        console.error('Error loading articles:', error);
        document.getElementById('loading').innerHTML = 'Error loading content. Please try again later.';
    }
}

// Parse the sheet data into usable format
function parseSheetData(rows) {
    const headers = rows[0];
    const articles = [];
    
    for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (row.length >= 6 && row[6] === 'Published') { // Only published articles
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

// Display today's article
function displayTodayArticle() {
    const today = new Date().toISOString().split('T')[0];
    currentArticle = articles.find(article => article.date === today) || articles[0];
    
    if (currentArticle) {
        displayArticle(currentArticle);
    } else {
        document.getElementById('loading').innerHTML = 'No article available for today.';
    }
}

// Display an article
function displayArticle(article) {
    const vocabularyWords = article.vocabulary.split(', ');
    let germanText = article.german;
    
    // Highlight vocabulary words
    vocabularyWords.forEach(word => {
        const cleanWord = word.trim();
        const regex = new RegExp(`\\b${cleanWord}\\b`, 'gi');
        germanText = germanText.replace(regex, `<span class="vocabulary-word">${cleanWord}</span>`);
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
    const themeArticles = articles.filter(article => article.theme === theme);
    if (themeArticles.length > 0) {
        // For now, show the first article of that theme
        displayArticle(themeArticles[0]);
    }
}