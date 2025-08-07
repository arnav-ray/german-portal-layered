// netlify/functions/ai-conversation.js
exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
  };

  try {
    const { message } = JSON.parse(event.body || '{}');
    
    if (!message) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'No message provided' })
      };
    }

    // Simple grammar checking without external API
    const corrections = checkGrammar(message);
    const response = generateResponse(message, corrections);
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(response)
    };
    
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        text: 'Entschuldigung, es gab einen Fehler. Bitte versuche es noch einmal.',
        corrections: [],
        metrics: { accuracy: 75, fluency: 75, grammar_accuracy: 75, vocabulary_usage: 75 },
        suggestions: []
      })
    };
  }
};

function checkGrammar(message) {
  const corrections = [];
  const text = message.toLowerCase();
  
  // Common German grammar mistakes
  const rules = [
    {
      pattern: /\bich\s+habe\s+gegangen\b/i,
      original: 'ich habe gegangen',
      corrected: 'ich bin gegangen',
      explanation: 'Bewegungsverben bilden das Perfekt mit "sein"'
    },
    {
      pattern: /\bich\s+bin\s+gemacht\b/i,
      original: 'ich bin gemacht',
      corrected: 'ich habe gemacht',
      explanation: '"machen" bildet das Perfekt mit "haben"'
    },
    {
      pattern: /\bmit\s+mein\s+/i,
      original: 'mit mein',
      corrected: 'mit meinem/meiner',
      explanation: 'Nach "mit" steht der Dativ'
    },
    {
      pattern: /\bfür\s+mich\s+/i,
      original: 'für mich',
      corrected: 'für mich',
      explanation: 'Korrekt! Nach "für" steht der Akkusativ'
    }
  ];
  
  rules.forEach(rule => {
    if (text.match(rule.pattern)) {
      corrections.push({
        original: rule.original,
        corrected: rule.corrected,
        explanation: rule.explanation
      });
    }
  });
  
  // Check capitalization of nouns
  const words = message.split(/\s+/);
  const commonNouns = ['haus', 'mann', 'frau', 'kind', 'schule', 'arbeit', 'auto', 'buch'];
  
  words.forEach(word => {
    if (commonNouns.includes(word.toLowerCase()) && word[0] === word[0].toLowerCase()) {
      corrections.push({
        original: word,
        corrected: word.charAt(0).toUpperCase() + word.slice(1),
        explanation: 'Substantive werden großgeschrieben'
      });
    }
  });
  
  return corrections.slice(0, 3); // Max 3 corrections
}

function generateResponse(message, corrections) {
  const responses = [
    'Sehr gut! Dein Deutsch wird immer besser.',
    'Ausgezeichnet! Weiter so!',
    'Gut gemacht! Lass uns weiter üben.',
    'Prima! Du machst Fortschritte.',
    'Toll! Dein Deutsch ist schon sehr gut.'
  ];
  
  let text = responses[Math.floor(Math.random() * responses.length)];
  
  if (corrections.length > 0) {
    text = 'Gut versucht! Ich habe ein paar kleine Korrekturen für dich. ';
  }
  
  // Add contextual response based on keywords
  const lower = message.toLowerCase();
  if (lower.includes('hallo') || lower.includes('guten tag')) {
    text = 'Hallo! Schön, dass du hier bist. Wie kann ich dir beim Deutschlernen helfen?';
  } else if (lower.includes('wie geht')) {
    text = 'Mir geht es gut, danke! Ich bin immer bereit, dir beim Deutschlernen zu helfen.';
  } else if (lower.includes('hilfe') || lower.includes('helfen')) {
    text = 'Natürlich helfe ich dir gerne! Du kannst mir Fragen stellen oder einfach auf Deutsch schreiben.';
  } else if (lower.includes('danke')) {
    text = 'Gern geschehen! Es macht mir Spaß, dir zu helfen.';
  }
  
  // Calculate simple metrics
  const wordCount = message.split(/\s+/).length;
  const metrics = {
    accuracy: Math.max(50, Math.min(95, 100 - (corrections.length * 15))),
    fluency: Math.min(90, 60 + wordCount * 2),
    grammar_accuracy: corrections.length === 0 ? 90 : Math.max(50, 90 - (corrections.length * 20)),
    vocabulary_usage: Math.min(85, 60 + wordCount)
  };
  
  // Generate suggestions
  const suggestions = [];
  
  if (corrections.length > 0) {
    suggestions.push({
      type: 'Grammar',
      action: 'Übe die korrigierten Strukturen mit ähnlichen Sätzen'
    });
  }
  
  if (wordCount < 10) {
    suggestions.push({
      type: 'Expression',
      action: 'Versuche längere Sätze zu schreiben'
    });
  }
  
  suggestions.push({
    type: 'Vocabulary',
    action: 'Lerne neue Wörter aus den Artikeln und Podcasts'
  });
  
  return {
    text,
    corrections,
    metrics,
    suggestions: suggestions.slice(0, 3)
  };
}