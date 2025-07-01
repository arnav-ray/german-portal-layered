// Your Google Sheets ID (you'll get this from your sheet URL)
const SHEET_ID = '1WbU27bSvjaHWCdCl7deU9-iEBTCmlSZe8l99-ppxfS8'; // Replace this
const SHEET_NAME = 'Sheet1'; // Replace this
const API_KEY = 'AIzaSyBjd0EF0ghF3hZdpB-0wSbeEBkrSDhG1J8'; // We'll set this up next

// Global variables
let articles = [];
let currentArticle = null;
let filteredArticles = []; // For search functionality

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
            filteredArticles = [...articles]; // Initialize filtered articles
            displayTodayArticle();
            setupThemeNavigation();
            setupUI(); // Show navigation and search
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
        // Check if row has enough columns and status is "Published"
        if (row.length >= 10 && row[9] === 'Published') {
            articles.push({
                date: row[0],
                theme: row[1],
                german: row[2],
                english: row[3],
                vocabulary: row[4] || '',
                grammar: row[5] || '',
                phrases: row[6] || '',
                quotes: row[7] || '',
                conversation: row[8] || '',
                status: row[9]
            });
        }
    }
    
    // Sort articles by date (newest first)
    articles.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    return articles;
}

// Display today's article
function displayTodayArticle() {
    const today = new Date().toISOString().split('T')[0];
    currentArticle = articles.find(article => article.date === today) || articles[0];
    
    if (currentArticle) {
        displayArticle(currentArticle);
        updateArticleCounter();
    } else {
        document.getElementById('loading').innerHTML = 'No article available for today.';
    }
}

// Display an article
function displayArticle(article) {
    let germanText = article.german;
    
    // Highlight vocabulary words if they exist
    if (article.vocabulary) {
        const vocabularyWords = article.vocabulary.split(/[,;]/);
        vocabularyWords.forEach(word => {
            const cleanWord = word.trim();
            if (cleanWord) {
                const regex = new RegExp(`\\b${cleanWord}\\b`, 'gi');
                germanText = germanText.replace(regex, `<span class="vocabulary-word" title="Vocabulary word">${cleanWord}</span>`);
            }
        });
    }
    
    const displayHTML = `
        <div class="metadata">
            <strong>Theme:</strong> ${article.theme} | 
            <strong>Grammar Focus:</strong> ${article.grammar} |
            <strong>Date:</strong> ${formatDate(article.date)}
        </div>
        
        <div class="german-text">${germanText}</div>
        
        <div class="english-text">${article.english}</div>
        
        ${article.vocabulary ? `
            <div class="vocabulary-section">
                <strong>🎯 Key Vocabulary:</strong>
                <div>${article.vocabulary}</div>
            </div>
        ` : ''}
        
        ${article.phrases ? `
            <div class="phrases-section">
                <strong>💬 Phrases & Idioms:</strong>
                <div>${article.phrases}</div>
            </div>
        ` : ''}
        
        ${article.quotes ? `
            <div class="quotes-section">
                <strong>😄 Quote & Joke:</strong>
                <div>${article.quotes}</div>
            </div>
        ` : ''}
        
        ${article.conversation ? `
            <div class="conversation-section">
                <strong>🗣️ Conversation Time:</strong>
                <div>${article.conversation}</div>
            </div>
        ` : ''}
    `;
    
    document.getElementById('article-display').innerHTML = displayHTML;
    document.getElementById('article-display').style.display = 'block';
    document.getElementById('loading').style.display = 'none';
    document.getElementById('theme-nav').style.display = 'block';
    
    // Update current article reference
    currentArticle = article;
    updateArticleCounter();
}

// Set up theme navigation
function setupThemeNavigation() {
    const themes = [...new Set(articles.map(article => article.theme))];
    const buttonContainer = document.getElementById('theme-buttons');
    
    // Clear existing buttons
    buttonContainer.innerHTML = '';
    
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
        // Show the most recent article of that theme
        displayArticle(themeArticles[0]);
        
        // Update filtered articles to this theme for navigation
        filteredArticles = themeArticles;
        updateArticleCounter();
    }
}

// Navigate to next/previous article
function navigateArticle(direction) {
    const currentIndex = filteredArticles.findIndex(article => 
        article.date === currentArticle.date && article.theme === currentArticle.theme
    );
    
    let newIndex;
    
    if (direction === 'next') {
        newIndex = (currentIndex + 1) % filteredArticles.length;
    } else {
        newIndex = currentIndex === 0 ? filteredArticles.length - 1 : currentIndex - 1;
    }
    
    displayArticle(filteredArticles[newIndex]);
}

// Search articles by keyword
function searchArticles(keyword) {
    if (!keyword.trim()) {
        filteredArticles = [...articles];
        displayArticle(articles[0]);
        return;
    }
    
    const searchResults = articles.filter(article => 
        article.german.toLowerCase().includes(keyword.toLowerCase()) ||
        article.english.toLowerCase().includes(keyword.toLowerCase()) ||
        article.theme.toLowerCase().includes(keyword.toLowerCase()) ||
        article.vocabulary.toLowerCase().includes(keyword.toLowerCase()) ||
        article.phrases.toLowerCase().includes(keyword.toLowerCase())
    );
    
    if (searchResults.length > 0) {
        filteredArticles = searchResults;
        displayArticle(searchResults[0]);
        
        // Clear search input
        document.getElementById('search-input').value = '';
        
        // Show search results count
        showSearchResults(searchResults.length, keyword);
    } else {
        alert(`No articles found for "${keyword}"`);
    }
}

// Show search results notification
function showSearchResults(count, keyword) {
    const metadata = document.querySelector('.metadata');
    if (metadata) {
        const searchInfo = document.createElement('div');
        searchInfo.className = 'search-results';
        searchInfo.innerHTML = `<small>🔍 Found ${count} result(s) for "${keyword}" | <a href="#" onclick="resetSearch()">Show all articles</a></small>`;
        searchInfo.style.marginTop = '10px';
        searchInfo.style.padding = '8px';
        searchInfo.style.backgroundColor = '#d4edda';
        searchInfo.style.borderRadius = '3px';
        
        // Remove existing search results
        const existingSearch = metadata.querySelector('.search-results');
        if (existingSearch) {
            existingSearch.remove();
        }
        
        metadata.appendChild(searchInfo);
    }
}

// Reset search to show all articles
function resetSearch() {
    filteredArticles = [...articles];
    displayTodayArticle();
    
    // Remove search results notification
    const searchResults = document.querySelector('.search-results');
    if (searchResults) {
        searchResults.remove();
    }
}

// Setup UI elements after articles load
function setupUI() {
    document.getElementById('search-container').style.display = 'block';
    document.getElementById('nav-buttons').style.display = 'block';
    document.getElementById('article-info').style.display = 'block';
    updateArticleCounter();
}

// Update article counter and info
function updateArticleCounter() {
    const currentIndex = filteredArticles.findIndex(article => 
        article.date === currentArticle.date && article.theme === currentArticle.theme
    );
    
    document.getElementById('current-article-number').textContent = currentIndex + 1;
    document.getElementById('total-articles').textContent = filteredArticles.length;
    document.getElementById('current-date').textContent = formatDate(currentArticle.date);
}

// Format date for display
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Add keyboard navigation
document.addEventListener('keydown', function(event) {
    // Only if search input is not focused
    if (document.activeElement !== document.getElementById('search-input')) {
        switch(event.key) {
            case 'ArrowLeft':
                navigateArticle('previous');
                break;
            case 'ArrowRight':
                navigateArticle('next');
                break;
            case 'Home':
                displayTodayArticle();
                break;
        }
    }
});

// Add tooltip functionality for vocabulary words
document.addEventListener('click', function(event) {
    if (event.target.classList.contains('vocabulary-word')) {
        const word = event.target.textContent;
        // You could add a dictionary lookup here or show more info
        console.log(`Clicked vocabulary word: ${word}`);
    }
});