// netlify/functions/get-podcasts.js
exports.handler = async (event, context) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
  };
  
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers };
  }

  try {
    const params = event.queryStringParameters || {};
    const category = params.category || 'all';
    const date = params.date || new Date().toISOString().split('T')[0];
    
    // Fetch German podcasts from podcast.arnavray.ca
    const podcastUrl = `https://podcast.arnavray.ca/.netlify/functions/generate-podcast?bunch=${category}&lang=de`;
    
    console.log('Fetching German podcast from:', podcastUrl);
    
    const response = await fetch(podcastUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch podcast: ${response.status}`);
    }

    const data = await response.json();
    
    // If successful, return the episode
    if (data.success && data.episode) {
      // Enhance episode with learning metadata
      const enhancedEpisode = {
        ...data.episode,
        id: `${category}-de-${date}`,
        language: 'de',
        learning_metadata: {
          difficulty_level: mapCategoryToLevel(category),
          grammar_focus: extractGrammarTopics(data.episode.script),
          vocabulary_count: countVocabulary(data.episode.script),
          estimated_study_time: calculateStudyTime(data.episode.duration)
        }
      };
      
      return {
        statusCode: 200,
        headers: {
          ...headers,
          'Content-Type': 'application/json',
          'Cache-Control': 'max-age=3600'
        },
        body: JSON.stringify({
          success: true,
          episodes: [enhancedEpisode]
        })
      };
    }
    
    // If no episode from external API, generate a sample one
    const sampleEpisode = generateSampleEpisode(category, date);
    
    return {
      statusCode: 200,
      headers: {
        ...headers,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        success: true,
        episodes: [sampleEpisode]
      })
    };

  } catch (error) {
    console.error('Error in get-podcasts:', error);
    
    // Return a sample episode on error
    const fallbackEpisode = generateSampleEpisode('ai-tech', new Date().toISOString().split('T')[0]);
    
    return {
      statusCode: 200,
      headers: {
        ...headers,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        success: true,
        episodes: [fallbackEpisode],
        note: 'Using sample data due to connection issue'
      })
    };
  }
};

// Map category to German level
function mapCategoryToLevel(category) {
  const levelMap = {
    'sunday-specials': 'A2-B1',
    'ai-tech': 'B2',
    'finance-business': 'B2',
    'leadership-strategy': 'C1+',
    'science-innovation': 'B2'
  };
  return levelMap[category] || 'B2';
}

// Extract grammar topics from script
function extractGrammarTopics(script) {
  const topics = [];
  
  // Check for various grammar patterns
  if (script.includes('hätte') || script.includes('wäre') || script.includes('würde')) {
    topics.push('Konjunktiv II');
  }
  if (script.includes('wurde') || script.includes('worden')) {
    topics.push('Passiv');
  }
  if (script.includes('hatte') || script.includes('war')) {
    topics.push('Präteritum');
  }
  if (script.includes('habe') || script.includes('bin') || script.includes('ist')) {
    topics.push('Perfekt');
  }
  
  return topics.length > 0 ? topics.join(', ') : 'Konversation';
}

// Count unique vocabulary
function countVocabulary(script) {
  if (!script) return 0;
  const words = script.match(/\b[A-ZÄÖÜ][a-zäöüß]{4,}\b/g) || [];
  return new Set(words).size;
}

// Calculate study time
function calculateStudyTime(duration) {
  if (!duration) return '15 min';
  const minutes = parseInt(duration.split(':')[0]) || 5;
  return `${minutes * 2} min`;
}

// Generate sample episode for testing
function generateSampleEpisode(category, date) {
  const titles = {
    'ai-tech': 'KI Revolution: ChatGPT und die Zukunft',
    'finance-business': 'Deutsche Wirtschaft im Wandel',
    'leadership-strategy': 'Führung in der digitalen Ära',
    'science-innovation': 'Durchbruch in der Quantenphysik',
    'sunday-specials': 'Deutsches Kulturgut: Bier und Brot'
  };
  
  const scripts = {
    'ai-tech': `Markus Weber: Willkommen zu AI & Tech Daily! Ich bin Markus Weber, und bei mir ist Dr. Anna Fischer. Heute sprechen wir über die neuesten Entwicklungen in der KI-Welt!

Dr. Anna Fischer: Danke Markus! Die Schlagzeilen sind wirklich beeindruckend. ChatGPT hat wieder für Aufsehen gesorgt mit neuen Funktionen, die unsere Arbeitsweise revolutionieren könnten.

Markus Weber: Absolut faszinierend! Erzähl uns mehr darüber, Anna. Was macht diese neuen Features so besonders?

Dr. Anna Fischer: Nun, die Fähigkeit, komplexe Datenanalysen durchzuführen und dabei menschenähnliche Erklärungen zu liefern, ist bahnbrechend. Unternehmen könnten ihre Prozesse dramatisch verbessern.

Markus Weber: Das klingt nach Science-Fiction, ist aber Realität! Welche Auswirkungen siehst du für den deutschen Markt?

Dr. Anna Fischer: Deutsche Unternehmen müssen schnell handeln, um wettbewerbsfähig zu bleiben. Die Digitalisierung wartet nicht!`,
    
    'finance-business': `Markus Weber: Guten Tag bei Finance & Business Daily! Die deutsche Wirtschaft steht vor großen Herausforderungen.

Dr. Klaus Hoffmann: In der Tat, Markus. Die Inflationsrate und die Energiepreise bereiten vielen Unternehmen Kopfschmerzen.

Markus Weber: Wie können sich Unternehmen in dieser Situation behaupten?

Dr. Klaus Hoffmann: Innovation und Effizienz sind der Schlüssel. Wer jetzt in nachhaltige Technologien investiert, wird langfristig profitieren.`
  };
  
  return {
    id: `${category}-de-${date}`,
    bunch: category,
    language: 'de',
    date: date,
    title: titles[category] || 'Täglicher Podcast',
    description: 'Aktuelle Nachrichten und Analysen auf Deutsch',
    script: scripts[category] || scripts['ai-tech'],
    duration: '5:00',
    articles: [
      {
        title: 'Hauptartikel des Tages',
        description: 'Wichtige Entwicklungen im Bereich ' + category,
        link: 'https://example.com',
        source: 'podcast.arnavray.ca',
        score: 10
      }
    ],
    totalScore: 10,
    hosts: {
      main: 'Markus Weber',
      expert: 'Dr. Expert'
    },
    learning_metadata: {
      difficulty_level: mapCategoryToLevel(category),
      grammar_focus: 'Präsens, Perfekt, Modalverben',
      vocabulary_count: 25,
      estimated_study_time: '10 min'
    }
  };
}
