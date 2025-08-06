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
    const params = event.queryStringParameters || {};
    const category = params.category || 'all';
    const language = params.language || 'de';
    const date = params.date;
    const limit = params.limit || '20'; // Fetch more to allow filtering

    // Construct the URL to your podcast API
    let podcastUrl = `https://podcast.arnavray.ca/.netlify/functions/get-episodes?lang=${language}&limit=${limit}`;
    if (category !== 'all') {
      podcastUrl += `&bunch=${category}`;
    }
    if (date) {
        // The podcast API seems to filter by date implicitly if provided
        podcastUrl += `&date=${date}`;
    }
    
    console.log('Fetching podcasts from:', podcastUrl);
    
    const response = await fetch(podcastUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch podcasts: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    // The API returns episodes in an `episodes` array
    const episodes = data.episodes || [];
    
    // Add learning metadata to each episode
    const enhancedEpisodes = episodes.map(episode => ({
      ...episode,
      learning_metadata: {
        difficulty_level: mapCategoryToLevel(episode.bunch),
        vocabulary_count: extractVocabularyCount(episode.script),
        estimated_study_time: calculateStudyTime(episode.duration)
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
      })
    };

  } catch (error) {
    console.error('Error fetching podcasts:', error);
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: false, error: error.message })
    };
  }
};

// Helper functions
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

function extractVocabularyCount(script) {
  if (!script) return 0;
  const words = script.match(/\b[A-ZÄÖÜ][a-zäöüß]{4,}\b/g) || [];
  return new Set(words).size;
}

function calculateStudyTime(duration) {
  if (!duration) return '10 min';
  const minutes = parseInt(duration.split(':')[0]) || 5;
  return `${minutes * 2} min`;
}
