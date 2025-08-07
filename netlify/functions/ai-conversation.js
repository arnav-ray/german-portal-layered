// netlify/functions/ai-conversation.js
const { GoogleGenerativeAI } = require('@google/generative-ai');

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
    const { message, context: userContext, history } = JSON.parse(event.body || '{}');
    
    if (!message) {
      return {
        statusCode: 400,
        headers: {
          ...headers,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ error: 'Message is required' })
      };
    }

    // Check for Gemini API key
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    
    if (!GEMINI_API_KEY) {
      console.log('Gemini API key not found, using enhanced fallback response');
      
      // Enhanced fallback response with better grammar checking
      return {
        statusCode: 200,
        headers: {
          ...headers,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(generateEnhancedFallbackResponse(message, userContext))
      };
    }

    // Initialize Gemini AI
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    // Build conversation context
    const systemPrompt = `Du bist ein freundlicher und geduldiger Deutschlehrer. Deine Aufgabe:

1. IMMER auf Deutsch antworten
2. Grammatikfehler freundlich korrigieren mit Erklärungen
3. Das Sprachniveau anpassen (aktuell: ${userContext?.article?.LEVEL || 'B2'})
4. Ermutigung und positive Verstärkung geben
5. Auf den Kontext des Artikels oder Podcasts eingehen, wenn vorhanden

${userContext?.article ? `Der Schüler lernt gerade über: "${userContext.article.THEME}"` : ''}

Antworte im JSON-Format:
{
  "text": "Deine hilfreiche Antwort auf Deutsch",
  "corrections": [
    {
      "original": "falscher Text",
      "corrected": "korrigierter Text",
      "explanation": "Erklärung warum und Regel"
    }
  ],
  "metrics": {
    "accuracy": 0-100,
    "fluency": 0-100,
    "grammar_accuracy": 0-100,
    "vocabulary_usage": 0-100
  },
  "suggestions": [
    {
      "type": "Grammar/Vocabulary/Expression",
      "action": "Konkrete Übungsvorschläge"
    }
  ]
}`;

    // Build conversation with context
    let conversationContext = systemPrompt + "\n\n";
    
    if (history && history.length > 0) {
      conversationContext += "Bisheriges Gespräch:\n";
      history.slice(-5).forEach(h => {
        conversationContext += `${h.sender === 'user' ? 'Schüler' : 'Lehrer'}: ${h.text}\n`;
      });
    }
    
    conversationContext += `\nSchüler: ${message}\n\nBitte antworte als hilfreicher Deutschlehrer im JSON-Format:`;

    // Generate response with Gemini
    const result = await model.generateContent(conversationContext);
    const response = await result.response;
    const responseText = response.text();
    
    // Parse response
    let aiResponse;
    try {
      const cleanedResponse = responseText.replace(/```json\n?|\n?```/g, '').trim();
      aiResponse = JSON.parse(cleanedResponse);
    } catch (parseError) {
      console.error('Failed to parse Gemini response:', parseError);
      aiResponse = {
        text: responseText || "Sehr gut! Lass uns weiter üben.",
        corrections: extractGrammarCorrections(message),
        metrics: calculateDetailedMetrics(message),
        suggestions: generateLearningSuggestions(message, userContext)
      };
    }

    return {
      statusCode: 200,
      headers: {
        ...headers,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(aiResponse)
    };
    
  } catch (error) {
    console.error('Error in AI conversation:', error);
    
    return {
      statusCode: 200,
      headers: {
        ...headers,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(generateEnhancedFallbackResponse(
        event.body ? JSON.parse(event.body).message : '',
        event.body ? JSON.parse(event.body).context : null
      ))
    };
  }
};

// Enhanced fallback response with better grammar checking
function generateEnhancedFallbackResponse(message, context) {
  const corrections = extractGrammarCorrections(message);
  const metrics = calculateDetailedMetrics(message);
  const suggestions = generateLearningSuggestions(message, context);
  
  // Generate contextual response
  let responseText = '';
  
  if (context?.article) {
    responseText = `Sehr gut, dass du den Artikel über "${context.article.THEME}" liest! `;
  }
  
  if (corrections.length > 0) {
    responseText += 'Ich habe ein paar kleine Korrekturen für dich. ';
  } else {
    responseText += 'Dein Deutsch wird immer besser! ';
  }
  
  // Add encouraging feedback
  if (metrics.accuracy >= 80) {
    responseText += 'Ausgezeichnet! Du machst große Fortschritte. ';
  } else if (metrics.accuracy >= 60) {
    responseText += 'Gut gemacht! Weiter so! ';
  } else {
    responseText += 'Keine Sorge, Übung macht den Meister! ';
  }
  
  responseText += 'Was möchtest du als Nächstes üben?';
  
  return {
    text: responseText,
    corrections: corrections,
    metrics: metrics,
    suggestions: suggestions
  };
}

// Extract grammar corrections with detailed rules
function extractGrammarCorrections(message) {
  const corrections = [];
  const text = message.toLowerCase();
  
  // Common German grammar mistakes database
  const grammarRules = [
    // Verb conjugation errors
    {
      pattern: /\bich\s+habe\s+gegangen\b/i,
      original: 'ich habe gegangen',
      corrected: 'ich bin gegangen',
      explanation: 'Bewegungsverben (gehen, kommen, fahren) bilden das Perfekt mit "sein", nicht mit "haben".'
    },
    {
      pattern: /\bich\s+bin\s+gemacht\b/i,
      original: 'ich bin gemacht',
      corrected: 'ich habe gemacht',
      explanation: 'Das Verb "machen" bildet das Perfekt mit "haben", nicht mit "sein".'
    },
    // Article errors
    {
      pattern: /\bder\s+frau\b/i,
      original: 'der Frau',
      corrected: 'die Frau (Nominativ) / der Frau (Dativ/Genitiv)',
      explanation: '"Frau" ist feminin. Im Nominativ: die Frau. Im Dativ/Genitiv: der Frau.'
    },
    {
      pattern: /\bein\s+mann\b/i,
      original: 'ein Mann',
      corrected: 'ein Mann',
      explanation: 'Korrekt! "Mann" ist maskulin: ein Mann.'
    },
    // Case errors
    {
      pattern: /\bich\s+helfe\s+du\b/i,
      original: 'ich helfe du',
      corrected: 'ich helfe dir',
      explanation: 'Nach "helfen" steht der Dativ: ich helfe dir (nicht du).'
    },
    {
      pattern: /\bmit\s+mein\s+freund\b/i,
      original: 'mit mein Freund',
      corrected: 'mit meinem Freund',
      explanation: 'Nach "mit" steht der Dativ: meinem (nicht mein).'
    },
    // Word order errors
    {
      pattern: /\bgestern\s+ich\s+war\b/i,
      original: 'gestern ich war',
      corrected: 'gestern war ich',
      explanation: 'Bei Zeitangaben am Satzanfang: Verb an zweiter Position, dann Subjekt.'
    },
    // Modal verb errors
    {
      pattern: /\bich\s+kann\s+zu\s+gehen\b/i,
      original: 'ich kann zu gehen',
      corrected: 'ich kann gehen',
      explanation: 'Nach Modalverben steht der Infinitiv ohne "zu".'
    },
    // Separable verbs
    {
      pattern: /\bich\s+anrufe\b/i,
      original: 'ich anrufe',
      corrected: 'ich rufe an',
      explanation: 'Trennbare Verben: Der Präfix kommt ans Satzende.'
    }
  ];
  
  // Check each rule
  grammarRules.forEach(rule => {
    if (text.match(rule.pattern)) {
      corrections.push({
        original: rule.original,
        corrected: rule.corrected,
        explanation: rule.explanation
      });
    }
  });
  
  // Check for missing capitals on nouns
  const words = message.split(/\s+/);
  words.forEach((word, index) => {
    // Skip first word of sentence
    if (index > 0 && words[index - 1].endsWith('.')) return;
    
    // Common nouns that should be capitalized
    const commonNouns = ['haus', 'mann', 'frau', 'kind', 'arbeit', 'schule', 'auto', 'buch', 'stadt', 'land'];
    if (commonNouns.includes(word.toLowerCase()) && word[0] === word[0].toLowerCase()) {
      corrections.push({
        original: word,
        corrected: word.charAt(0).toUpperCase() + word.slice(1),
        explanation: 'Substantive werden im Deutschen großgeschrieben.'
      });
    }
  });
  
  return corrections.slice(0, 3); // Limit to 3 corrections to not overwhelm
}

// Calculate detailed metrics
function calculateDetailedMetrics(message) {
  const wordCount = message.split(/\s+/).length;
  const corrections = extractGrammarCorrections(message);
  const sentenceCount = (message.match(/[.!?]+/g) || []).length || 1;
  
  // Calculate accuracy based on corrections
  const errorRate = corrections.length / Math.max(sentenceCount, 1);
  const accuracy = Math.max(30, Math.min(95, 100 - (errorRate * 20)));
  
  // Calculate fluency based on sentence length and complexity
  const avgWordsPerSentence = wordCount / sentenceCount;
  const fluency = Math.min(90, 50 + (avgWordsPerSentence * 3));
  
  // Grammar accuracy
  const grammarAccuracy = corrections.length === 0 ? 90 : Math.max(40, 90 - (corrections.length * 15));
  
  // Vocabulary usage based on word variety and length
  const uniqueWords = new Set(message.toLowerCase().split(/\s+/));
  const vocabScore = Math.min(85, 40 + (uniqueWords.size * 3));
  
  return {
    accuracy: Math.round(accuracy),
    fluency: Math.round(fluency),
    grammar_accuracy: Math.round(grammarAccuracy),
    vocabulary_usage: Math.round(vocabScore)
  };
}

// Generate learning suggestions based on errors and context
function generateLearningSuggestions(message, context) {
  const suggestions = [];
  const corrections = extractGrammarCorrections(message);
  const level = context?.article?.LEVEL || 'B2';
  
  // Grammar-based suggestions
  if (corrections.length > 0) {
    const grammarTopics = new Set();
    corrections.forEach(c => {
      if (c.explanation.includes('Perfekt')) grammarTopics.add('Perfekt');
      if (c.explanation.includes('Dativ')) grammarTopics.add('Dativ');
      if (c.explanation.includes('Akkusativ')) grammarTopics.add('Akkusativ');
      if (c.explanation.includes('Modal')) grammarTopics.add('Modalverben');
      if (c.explanation.includes('trennbar')) grammarTopics.add('Trennbare Verben');
    });
    
    grammarTopics.forEach(topic => {
      suggestions.push({
        type: 'Grammar',
        action: `Übe ${topic} mit den Übungen im Grammar Drill Bereich`
      });
    });
  }
  
  // Length-based suggestions
  const wordCount = message.split(/\s+/).length;
  if (wordCount < 10) {
    suggestions.push({
      type: 'Expression',
      action: 'Versuche längere Sätze mit Nebensätzen zu bilden (weil, dass, wenn)'
    });
  }
  
  // Level-appropriate suggestions
  if (level === 'A2-B1') {
    suggestions.push({
      type: 'Vocabulary',
      action: 'Erweitere deinen Wortschatz mit Alltagsthemen aus den A2-B1 Artikeln'
    });
  } else if (level === 'B2') {
    suggestions.push({
      type: 'Grammar',
      action: 'Übe Konjunktiv II und Passiv für B2-Niveau'
    });
  } else if (level === 'C1+') {
    suggestions.push({
      type: 'Expression',
      action: 'Verwende mehr idiomatische Ausdrücke und komplexe Satzstrukturen'
    });
  }
  
  // Context-based suggestions
  if (context?.article?.THEME) {
    suggestions.push({
      type: 'Vocabulary',
      action: `Lerne die Fachvokabeln zum Thema "${context.article.THEME}"`
    });
  }
  
  return suggestions.slice(0, 3); // Limit to 3 suggestions
}
