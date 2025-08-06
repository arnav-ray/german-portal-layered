// netlify/functions/ai-conversation.js
exports.handler = async (event, context) => {
  // Handle CORS preflight
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
    const { message, context: userContext, history } = JSON.parse(event.body || '{}');
    
    if (!message) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ error: 'Message is required' })
      };
    }

    // Simulate AI response with grammar corrections
    const response = generateAIResponse(message, userContext, history);
    
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(response)
    };
    
  } catch (error) {
    console.error('Error in AI conversation:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        error: 'Failed to process conversation',
        text: 'Entschuldigung, es gab einen Fehler. Bitte versuchen Sie es erneut.',
        corrections: []
      })
    };
  }
};

function generateAIResponse(message, context, history) {
  // Basic grammar checking patterns
  const corrections = [];
  
  // Check for common German grammar mistakes
  if (message.match(/\bich\s+habe\s+gegangen\b/i)) {
    corrections.push({
      original: 'ich habe gegangen',
      corrected: 'ich bin gegangen',
      explanation: 'Bewegungsverben bilden das Perfekt mit "sein", nicht mit "haben".'
    });
  }
  
  if (message.match(/\bich\s+bin\s+gemacht\b/i)) {
    corrections.push({
      original: 'ich bin gemacht',
      corrected: 'ich habe gemacht',
      explanation: '"Machen" bildet das Perfekt mit "haben".'
    });
  }
  
  // Check for article errors
  if (message.match(/\bder\s+Frau\b/)) {
    corrections.push({
      original: 'der Frau',
      corrected: 'die Frau',
      explanation: '"Frau" ist feminin und benötigt den Artikel "die" im Nominativ.'
    });
  }
  
  // Generate contextual response
  let responseText = '';
  
  if (context?.podcast) {
    responseText = `Sehr gut! Ich sehe, dass du den Podcast "${context.podcast.title}" gehört hast. `;
  }
  
  if (corrections.length > 0) {
    responseText += 'Ich habe einige kleine Korrekturen für dich. Das ist völlig normal beim Deutschlernen! ';
  }
  
  // Add topic-specific responses
  if (message.toLowerCase().includes('podcast')) {
    responseText += 'Die Podcasts sind eine ausgezeichnete Möglichkeit, dein Hörverständnis zu verbessern. Hast du schon versucht, die Geschwindigkeit anzupassen?';
  } else if (message.toLowerCase().includes('grammatik') || message.toLowerCase().includes('grammar')) {
    responseText += 'Grammatik kann herausfordernd sein, aber mit Übung wird es einfacher. Möchtest du ein bestimmtes Thema üben?';
  } else if (message.toLowerCase().includes('vokabeln') || message.toLowerCase().includes('vocabulary')) {
    responseText += 'Ein guter Wortschatz ist die Grundlage für fließendes Sprechen. Ich empfehle, täglich 10 neue Wörter zu lernen.';
  } else {
    // Default conversational responses
    const responses = [
      'Das ist interessant! Erzähl mir mehr darüber.',
      'Sehr gut formuliert! Dein Deutsch wird immer besser.',
      'Eine ausgezeichnete Frage! Lass uns das gemeinsam erkunden.',
      'Das verstehe ich. Wie können wir das weiter vertiefen?'
    ];
    responseText += responses[Math.floor(Math.random() * responses.length)];
  }
  
  // Calculate simple metrics
  const wordCount = message.split(/\s+/).length;
  const metrics = {
    accuracy: Math.max(70, Math.min(95, 100 - (corrections.length * 10))),
    fluency: Math.min(90, 60 + wordCount * 2),
    grammar_accuracy: corrections.length === 0 ? 95 : 75,
    vocabulary_usage: Math.min(85, 70 + Math.floor(wordCount / 2))
  };
  
  // Generate suggestions
  const suggestions = [];
  if (corrections.length > 0) {
    suggestions.push({
      type: 'Grammar',
      action: 'Review the corrections above and practice similar sentence structures'
    });
  }
  if (wordCount < 10) {
    suggestions.push({
      type: 'Expression',
      action: 'Try to use longer, more complex sentences to express your thoughts'
    });
  }
  suggestions.push({
    type: 'Vocabulary',
    action: 'Incorporate new words from recent podcasts or articles into your responses'
  });
  
  return {
    text: responseText,
    corrections: corrections,
    metrics: metrics,
    suggestions: suggestions
  };
}
