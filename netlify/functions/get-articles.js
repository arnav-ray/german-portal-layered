// netlify/functions/get-articles.js
exports.handler = async (event, context) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  // Handle preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  // Get credentials from environment variables
  const SHEET_ID = process.env.VITE_GOOGLE_SHEET_ID || '1WbU27bSvjaHWCdCl7deU9-iEBTCmlSZe8l99-ppxfS8';
  const API_KEY = process.env.VITE_GOOGLE_API_KEY;
  const SHEET_NAME = 'Sheet1';
  
  // Validate environment variables
  if (!API_KEY) {
    console.log('Using direct sheet access without API key - will try public sheet');
    
    // Try to access the public sheet directly
    try {
      // For public sheets, we can try a different approach
      // Note: This requires the sheet to be publicly viewable
      const publicUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${SHEET_NAME}`;
      
      const response = await fetch(publicUrl);
      const text = await response.text();
      
      // Parse the Google Visualization API response
      // Remove the wrapper function
      const jsonString = text.substring(
        text.indexOf('(') + 1,
        text.lastIndexOf(')')
      );
      
      const data = JSON.parse(jsonString);
      
      // Transform to expected format
      const rows = [];
      
      // Add headers
      if (data.table && data.table.cols) {
        rows.push(data.table.cols.map(col => col.label || ''));
      }
      
      // Add data rows
      if (data.table && data.table.rows) {
        data.table.rows.forEach(row => {
          rows.push(row.c.map(cell => cell ? (cell.v || '') : ''));
        });
      }
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ values: rows }),
      };
    } catch (error) {
      console.error('Error fetching public sheet:', error);
      
      // Return sample data as fallback
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          values: getSampleSheetData()
        }),
      };
    }
  }
  
  try {
    // Try with API key if available
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${SHEET_NAME}?key=${API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }
    
    const data = await response.json();
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(data),
    };
  } catch (error) {
    console.error('Error fetching sheet:', error);
    
    // Return sample data as fallback
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        values: getSampleSheetData(),
        error: 'Using sample data - configure API key for real data'
      }),
    };
  }
};

// Sample data matching your sheet structure
function getSampleSheetData() {
  return [
    // Headers
    ['DATE', 'LEVEL', 'THEME', 'STATUS', 'GERMAN_ARTICLE', 'ENGLISH_TRANSLATION', 'VOCABULARY_USED', 'DEEP_DIVE_GRAMMAR', 'PHRASE_AND_IDIOM', 'QUOTE_AND_JOKE', 'CONVERSATION_TIME', 'GRAMMAR_TOPIC_TAGS', 'DRILL_SENTENCES'],
    // Sample articles
    [
      '2024-01-20',
      'B2',
      'Job Interview',
      'Published',
      'Ich hatte gestern ein wichtiges Vorstellungsgespräch bei einer großen Firma. Der Personaler stellte mir viele Fragen über meine Berufserfahrung. Ich war nervös, aber ich konnte alle Fragen gut beantworten.',
      'I had an important job interview at a large company yesterday. The HR manager asked me many questions about my work experience. I was nervous, but I could answer all questions well.',
      'das Vorstellungsgespräch - job interview, der Personaler - HR manager, die Berufserfahrung - work experience, nervös - nervous',
      'Präteritum (hatte, stellte, war) is used for past events. Modal verb "konnte" shows past ability.',
      'Daumen drücken - to keep fingers crossed',
      'Erfolg ist kein Zufall - Success is no coincidence',
      'A: Wie war dein Vorstellungsgespräch? B: Es lief sehr gut, danke!',
      'Präteritum,Modalverben',
      'Gestern {ging} ich ins Kino. Ich {hatte} keine Zeit. Er {konnte} nicht kommen.'
    ],
    [
      '2024-01-19',
      'A2-B1',
      'Shopping',
      'Published',
      'Heute gehe ich einkaufen. Ich brauche Milch, Brot und Käse. Der Supermarkt ist nicht weit von meiner Wohnung. Ich gehe immer zu Fuß dorthin.',
      'Today I am going shopping. I need milk, bread, and cheese. The supermarket is not far from my apartment. I always walk there.',
      'einkaufen - to shop, die Milch - milk, das Brot - bread, der Käse - cheese, zu Fuß - on foot',
      'Present tense for habitual actions. Accusative case after "brauche" (Ich brauche Milch).',
      'Das ist mir Wurst - I don\'t care (literally: that\'s sausage to me)',
      'Wer billig kauft, kauft zweimal - Buy cheap, buy twice',
      'Verkäufer: Was darf es sein? Kunde: Ich hätte gern 200g Käse.',
      'Präsens,Akkusativ',
      'Ich {brauche} einen Stift. Er {geht} zur Schule. Wir {kaufen} Brot.'
    ],
    [
      '2024-01-18',
      'C1+',
      'Climate Change',
      'Published',
      'Der Klimawandel stellt eine der größten Herausforderungen unserer Zeit dar. Wissenschaftler warnen vor den katastrophalen Folgen, falls wir nicht sofort handeln. Die Politik müsste dringend effektivere Maßnahmen ergreifen.',
      'Climate change represents one of the greatest challenges of our time. Scientists warn of catastrophic consequences if we don\'t act immediately. Politics urgently needs to take more effective measures.',
      'der Klimawandel - climate change, die Herausforderung - challenge, warnen - to warn, die Folgen - consequences, Maßnahmen ergreifen - to take measures',
      'Konjunktiv II (müsste) expresses necessity/urgency. Conditional clause with "falls". Comparative form "effektivere".',
      'Den Kopf in den Sand stecken - to bury one\'s head in the sand',
      'Die Zukunft hängt davon ab, was wir heute tun - The future depends on what we do today',
      'A: Was sollten wir gegen den Klimawandel tun? B: Jeder muss bei sich selbst anfangen.',
      'Konjunktiv II,Komparativ,Konditional',
      'Wenn ich reich {wäre}, {würde} ich reisen. Er {müsste} mehr lernen.'
    ],
    [
      '2024-01-17',
      'B2',
      'Technology & AI',
      'Published',
      'Künstliche Intelligenz wird immer wichtiger in unserem Alltag. Viele Menschen haben Angst, dass Roboter ihre Arbeitsplätze übernehmen könnten. Experten meinen jedoch, dass KI neue Möglichkeiten schaffen wird.',
      'Artificial intelligence is becoming increasingly important in our daily life. Many people fear that robots could take over their jobs. However, experts believe that AI will create new opportunities.',
      'künstliche Intelligenz - artificial intelligence, der Alltag - daily life, übernehmen - to take over, die Möglichkeit - opportunity, schaffen - to create',
      'Future tense with "werden". Modal verb "könnten" (Konjunktiv II) for possibility. Subordinate clause with "dass".',
      'Auf dem neuesten Stand sein - to be up to date',
      'Die Maschine kann den Menschen nicht ersetzen - The machine cannot replace humans',
      'A: Hast du ChatGPT schon ausprobiert? B: Ja, es ist beeindruckend!',
      'Futur,Konjunktiv II,Nebensätze',
      'KI {wird} die Welt verändern. Roboter {könnten} Jobs übernehmen.'
    ],
    [
      '2024-01-16',
      'A2-B1',
      'Family Weekend',
      'Published',
      'Am Wochenende besuche ich meine Eltern. Meine Mutter kocht immer mein Lieblingsessen. Nach dem Mittagessen spielen wir Karten oder gehen spazieren. Es ist schön, Zeit mit der Familie zu verbringen.',
      'On the weekend I visit my parents. My mother always cooks my favorite food. After lunch we play cards or go for a walk. It\'s nice to spend time with family.',
      'das Wochenende - weekend, die Eltern - parents, das Lieblingsessen - favorite food, Karten spielen - to play cards, spazieren gehen - to go for a walk',
      'Present tense for regular activities. Infinitive constructions with "zu" (Zeit zu verbringen).',
      'Blut ist dicker als Wasser - Blood is thicker than water',
      'Familie ist nicht wichtig, sie ist alles - Family is not important, it is everything',
      'Kind: Was machen wir heute? Mutter: Wir backen einen Kuchen zusammen!',
      'Präsens,Infinitiv mit zu',
      'Es ist schön, hier {zu sein}. Ich habe Zeit, {zu lesen}.'
    ]
  ];
}
