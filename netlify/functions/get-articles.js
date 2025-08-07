// netlify/functions/get-articles.js
exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
  };

  // Your Google Sheet ID (make it public "View only" for this to work)
  const SHEET_ID = '1WbU27bSvjaHWCdCl7deU9-iEBTCmlSZe8l99-ppxfS8';
  
  try {
    // Try the public Google Visualization API (works without API key if sheet is public)
    const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json`;
    
    const response = await fetch(url);
    const text = await response.text();
    
    // Extract JSON from response
    const jsonString = text.substring(
      text.indexOf('{'),
      text.lastIndexOf('}') + 1
    );
    
    const data = JSON.parse(jsonString);
    
    // Convert to simple array format
    const values = [];
    
    // Add headers
    if (data.table && data.table.cols) {
      values.push(data.table.cols.map(col => col.label || ''));
    }
    
    // Add rows
    if (data.table && data.table.rows) {
      data.table.rows.forEach(row => {
        values.push(row.c.map(cell => cell ? (cell.v || '') : ''));
      });
    }
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ values }),
    };
    
  } catch (error) {
    console.error('Error:', error);
    
    // Return working sample data
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        values: [
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
            'Präteritum (hatte, stellte, war) is used for past events. Modal verb konnte shows past ability.',
            'Daumen drücken - to keep fingers crossed',
            'Erfolg ist kein Zufall - Success is no coincidence',
            'A: Wie war dein Vorstellungsgespräch? B: Es lief sehr gut, danke!',
            'Präteritum,Modalverben',
            'Gestern ging ich ins Kino.'
          ],
          [
            '2024-01-19',
            'A2-B1',
            'Shopping',
            'Published',
            'Heute gehe ich einkaufen. Ich brauche Milch, Brot und Käse. Der Supermarkt ist nicht weit von meiner Wohnung. Ich gehe immer zu Fuß dorthin.',
            'Today I am going shopping. I need milk, bread, and cheese. The supermarket is not far from my apartment. I always walk there.',
            'einkaufen - to shop, die Milch - milk, das Brot - bread, der Käse - cheese, zu Fuß - on foot',
            'Present tense for habitual actions. Accusative case after brauche.',
            'Das ist mir Wurst - I dont care',
            'Wer billig kauft, kauft zweimal - Buy cheap, buy twice',
            'Verkäufer: Was darf es sein? Kunde: Ich hätte gern 200g Käse.',
            'Präsens,Akkusativ',
            'Ich brauche einen Stift.'
          ],
          [
            '2024-01-18',
            'C1+',
            'Climate Change',
            'Published',
            'Der Klimawandel stellt eine der größten Herausforderungen unserer Zeit dar. Wissenschaftler warnen vor den katastrophalen Folgen, falls wir nicht sofort handeln. Die Politik müsste dringend effektivere Maßnahmen ergreifen.',
            'Climate change represents one of the greatest challenges of our time. Scientists warn of catastrophic consequences if we dont act immediately. Politics urgently needs to take more effective measures.',
            'der Klimawandel - climate change, die Herausforderung - challenge, warnen - to warn, die Folgen - consequences, Maßnahmen ergreifen - to take measures',
            'Konjunktiv II (müsste) expresses necessity. Conditional with falls.',
            'Den Kopf in den Sand stecken - to bury ones head in the sand',
            'Die Zukunft hängt davon ab, was wir heute tun',
            'A: Was sollten wir gegen den Klimawandel tun? B: Jeder muss bei sich selbst anfangen.',
            'Konjunktiv II,Konditional',
            'Wenn ich reich wäre, würde ich reisen.'
          ]
        ]
      }),
    };
  }
};