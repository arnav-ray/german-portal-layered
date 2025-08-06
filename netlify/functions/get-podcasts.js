// This function fetches podcast episodes from your podcast.arnavray.ca API
exports.handler = async (event, context) => {
  // Handle CORS preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
      }
    };
  }

  try {
    // Get query parameters
    const params = event.queryStringParameters || {};
    const category = params.category || 'all';
    const language = params.language || 'de'; // Default to German
    const limit = params.limit || '10';

    // Fetch from your podcast API
    const podcastUrl = `https://podcast.arnavray.ca/.netlify/functions/generate-podcast?bunch=${category}&lang=${language}&limit=${limit}`;
    
    console.log('Fetching podcasts from:', podcastUrl);
    
    const response = await fetch(podcastUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch podcasts: ${response.status}`);
    }

    const data = await response.json();

    // Transform the data for the German learning app
    const episodes = data.episode ? [data.episode] : [];
    
    // Add learning metadata
    const enhancedEpisodes = episodes.map(episode => ({
      ...episode,
      learning_metadata: {
        difficulty_level: mapCategoryToLevel(episode.bunch),
        vocabulary_count: extractVocabularyCount(episode.script),
        estimated_study_time: calculateStudyTime(episode.duration),
        grammar_patterns: identifyGrammarPatterns(episode.script)
      }
    }));

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
        'Cache-Control': 'max-age=3600' // Cache for 1 hour
      },
      body: JSON.stringify({
        success: true,
        episodes: enhancedEpisodes,
        category: category,
        language: language
      })
    };

  } catch (error) {
    console.error('Error fetching podcasts:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        success: false,
        error: error.message
      })
    };
  }
};

// Helper function to map podcast categories to German learning levels
function mapCategoryToLevel(category) {
  const levelMap = {
    'sunday-specials': 'A2-B1',
    'ai-tech': 'B2',
    'finance-business': 'B2-C1',
    'leadership-strategy': 'C1',
    'science-innovation': 'B2-C1'
  };
  return levelMap[category] || 'B2';
}

// Extract vocabulary count from script
function extractVocabularyCount(script) {
  if (!script) return 0;
  // Count unique words over 5 characters (likely to be vocabulary words)
  const words = script.match(/\b[A-ZÄÖÜ][a-zäöüß]{4,}\b/g) || [];
  return new Set(words).size;
}

// Calculate study time based on duration
function calculateStudyTime(duration) {
  if (!duration) return '10 min';
  const minutes = parseInt(duration.split(':')[0]) || 5;
  return `${minutes * 2} min`; // Double the listening time for study
}

// Identify grammar patterns in the script
function identifyGrammarPatterns(script) {
  if (!script) return [];
  
  const patterns = [];
  
  // Check for common German grammar patterns
  if (script.match(/\bhabe\b|\bhatte\b|\bhat\b/i)) {
    patterns.push('Perfekt');
  }
  if (script.match(/\bwird\b|\bwurde\b|\bwerden\b/i)) {
    patterns.push('Futur/Passiv');
  }
  if (script.match(/\bwenn\b|\bals\b|\bobwohl\b/i)) {
    patterns.push('Nebensätze');
  }
  if (script.match(/\bkann\b|\bmuss\b|\bsoll\b|\bdarf\b/i)) {
    patterns.push('Modalverben');
  }
  
  return patterns;
}
