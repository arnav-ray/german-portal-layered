// Your Google Sheets ID (you'll get this from your sheet URL)
const SHEET_ID = '1WbU27bSvjaHWCdCl7deU9-iEBTCmlSZe8l99-ppxfS8'; // This should be your sheet ID
const SHEET_NAME = 'Sheet1'; // This should be the name of the sheet/tab
const API_KEY = 'AIzaSyBjd0EF0ghF3hZdpB-0wSbeEBkrSDhG1J8'; // IMPORTANT: Replace with the new, restricted API key you created

// Global variables
let articles = [];
let filteredArticles = []; // For search and navigation
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
        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}. Check API Key and Sheet ID.`);
        }
        const data = await response.json();
        
        if (data.values && data.values.length > 1) {
            articles = parseSheetData(data.values);
            if (articles.length > 0) {
                filteredArticles = [...articles]; // Initialize filtered articles
                displayLatestArticle(); // Display the newest article by default
                setupThemeNavigation();
                setupUI(); // Show navigation and search
            } else {
                 document.getElementById('loading').innerHTML = 'No "Published" articles found in your sheet. Check the "Status" column.';
            }
        } else {
             document.getElementById('loading').innerHTML = 'No data found in the sheet.';
        }
    } catch (error) {
        console.error('Error loading articles:', error);
        document.getElementById('loading').innerHTML = 'Error loading content. Check browser console for details (e.g., API key issues).';
    }
}

// Parse the sheet data into a more usable format
function parseSheetData(rows) {
    const headers = rows[0].map(h => h.trim());
    const data = [];
    
    // Find the index for each required column dynamically
    const themeIndex = headers.indexOf('THEME');
    const germanIndex = headers.indexOf('GERMAN ARTICLE');
    const englishIndex = headers.indexOf('ENGLISH TRANSLATION');
    const vocabIndex = headers.indexOf('VOCABULARY');
    const grammarIndex = headers.indexOf('GRAMMAR');
    const phrasesIndex = headers.indexOf('PHRASE & IDIOM');
    const quotesIndex = headers.indexOf('QUOTE & JOKE');
    const conversationIndex = headers.indexOf('CONVERSATION TIME');
    const statusIndex = headers.indexOf('Status');

    // Loop from the last row upwards to get newest articles first
    for (let i = rows.length - 1; i > 0; i--) {
        const row = rows[i];
        
        // Check if the row has a value in the status column and if it's 'Published'
        if (row[statusIndex] && row[statusIndex].trim() === 'Published') {
            data.push({
                date: row[headers.indexOf('DATE')], 
                theme: row[themeIndex],
                german: row[germanIndex] || '',
                english: row[englishIndex] || '',
                vocabulary: row[vocabIndex] || '',
                grammar: row[grammarIndex] || '',
                phrases: row[phrasesIndex] || '',
                quotes: row[quotesIndex] || '',
                conversation: row[conversationIndex] || '',
            });
        }
    }
    
    return data;
}

// Display the most recent article by default
function displayLatestArticle() {
    if (articles.length > 0) {
        displayArticle(articles[0]);
    }
}

// Helper function to escape special characters for regular expressions
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

// Display an article
function displayArticle(article) {
    currentArticle = article;
    let germanText = article.german;
    
    if (article.vocabulary) {
        const vocabularyWords = article.vocabulary.split(/[,;]/);
        vocabularyWords.forEach(word => {
            let cleanWord = word.trim();
            // We only want the German word itself for highlighting, not the translation part
            if (cleanWord.includes('(')) {
                cleanWord = cleanWord.substring(0, cleanWord.indexOf('(')).trim();
            }

            if (cleanWord) {
                // Use the escape function here
                const escapedWord = escapeRegExp(cleanWord);
                const regex = new RegExp(`\\b${escapedWord}\\b`, 'gi');
                germanText = germanText.replace(regex, `<span class="vocabulary-word" title="Vocabulary: ${word.trim()}">${cleanWord}</span>`);
            }
        });
    }
    
    const displayHTML = `
        <div class="metadata">
            <strong>Theme:</strong> ${article.theme} | 
            <strong>Grammar Focus:</strong> ${article.grammar} |
            <strong>Date:</strong> ${article.date}
        </div>
        <div class="german-text">${germanText}</div>
        <div class="english-text">${article.english}</div>
        ${article.vocabulary ? `<div class="vocabulary-section"><strong>🎯 Key Vocabulary:</strong><div>${article.vocabulary}</div></div>` : ''}
        ${article.phrases ? `<div class="phrases-section"><strong>💬 Phrases & Idioms:</strong><div>${article.phrases}</div></div>` : ''}
        ${article.quotes ? `<div class="quotes-section"><strong>😄 Quote & Joke:</strong><div>${article.quotes}</div></div>` : ''}
        ${article.conversation ? `<div class="conversation-section"><strong>🗣️ Conversation Time:</strong><div>${article.conversation}</div></div>` : ''}
    `;
    
    document.getElementById('article-display').innerHTML = displayHTML;
    document.getElementById('article-display').style.display = 'block';
    document.getElementById('loading').style.display = 'none';
    
    updateArticleCounter();
}

// Set up UI elements after articles load
function setupUI() {
    document.getElementById('search-container').style.display = 'block';
    document.getElementById('nav-buttons').style.display = 'block';
    document.getElementById('article-info').style.display = 'block';
    document.getElementById('theme-nav').style.display = 'block';
}

// Set up theme navigation
function setupThemeNavigation() {
    const themes = [...new Set(articles.map(article => article.theme))];
    const buttonContainer = document.getElementById('theme-buttons');
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
    filteredArticles = articles.filter(article => article.theme === theme);
    if (filteredArticles.length > 0) {
        displayArticle(filteredArticles[0]);
    }
}

// Navigate to next/previous article
function navigateArticle(direction) {
    const currentIndex = filteredArticles.findIndex(a => a.date === currentArticle.date && a.theme === currentArticle.theme);
    if (currentIndex === -1) return;

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
    const searchInput = document.getElementById('search-input');
    const searchTerm = keyword || searchInput.value;

    if (!searchTerm.trim()) {
        resetSearch();
        return;
    }
    
    const searchResults = articles.filter(article => 
        Object.values(article).some(value => value.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    
    if (searchResults.length > 0) {
        filteredArticles = searchResults;
        displayArticle(searchResults[0]);
        showSearchResults(searchResults.length, searchTerm);
    } else {
        alert(`No articles found for "${searchTerm}"`);
    }
}

// Show search results notification
function showSearchResults(count, keyword) {
    const metadata = document.querySelector('.metadata');
    if (metadata) {
        const existingSearch = document.querySelector('.search-results');
        if (existingSearch) existingSearch.remove();

        const searchInfo = document.createElement('div');
        searchInfo.className = 'search-results';
        searchInfo.innerHTML = `<small>🔍 Found ${count} result(s) for "${keyword}" | <a href="#" onclick="event.preventDefault(); resetSearch();">Show all articles</a></small>`;
        metadata.insertAdjacentElement('afterend', searchInfo);
    }
}

// Reset search to show all articles
function resetSearch() {
    filteredArticles = [...articles];
    displayLatestArticle();
    const searchResults = document.querySelector('.search-results');
    if (searchResults) searchResults.remove();
    document.getElementById('search-input').value = '';
}

// Update article counter and info
function updateArticleCounter() {
    const currentIndex = filteredArticles.findIndex(a => a.date === currentArticle.date && a.theme === currentArticle.theme);
    document.getElementById('current-article-number').textContent = currentIndex + 1;
    document.getElementById('total-articles').textContent = filteredArticles.length;
    document.getElementById('current-date').textContent = currentArticle.date;
}

// Add keyboard navigation
document.addEventListener('keydown', function(event) {
    if (document.activeElement !== document.getElementById('search-input')) {
        if (event.key === 'ArrowLeft') navigateArticle('previous');
        if (event.key === 'ArrowRight') navigateArticle('next');
        if (event.key === 'Home') {
            event.preventDefault();
            resetSearch();
        }
    }
});
