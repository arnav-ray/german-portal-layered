// netlify/functions/ai-conversation.js
const { GoogleGenerativeAI } = require('@google/generative-ai');

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

    // Check for Gemini API key
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    
    if (!GEMINI_API_KEY) {
      console.log('Gemini API key not found, using fallback response');
      // Fallback to simple response if no API key
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(generateFallbackResponse(message, userContext))
      };
    }

    // Initialize Gemini AI
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    // Build conversation context
    const systemPrompt = `Du bist ein freundlicher Deutschlehrer. Deine Aufgabe ist es:
1. Auf Deutsch zu antworten
2. Grammatikfehler zu korrigieren (mit Erklärungen)
3. Dem Schüler beim Deutschlernen zu helfen
4. Das Niveau anzupassen (aktuell: ${userContext?.userLevel || 'B2'})

Wenn der Schüler Fehler macht, korrigiere sie freundlich und erkläre warum.
Antworte im JSON-Format:
{
  "text": "Deine Antwort auf Deutsch",
  "corrections": [
    {
      "original": "falscher Text",
      "corrected": "korrigierter Text",
      "explanation": "Erklärung auf Deutsch"
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
      "action": "Konkrete Verbesserungsvorschläge"
    }
  ]
}`;

    // Build conversation history for context
    let conversationContext = systemPrompt + "\n\n";
    
    if (userContext?.podcast) {
      conversationContext += `Der Schüler hat gerade den Podcast "${userContext.podcast.title}" gehört.\n`;
    }
    
    if (history && history.length > 0) {
      conversationContext += "Bisheriger Gesprächsverlauf:\n";
      history.slice(-5).forEach(h => {
        conversationContext += `${h.sender === 'user' ? 'Schüler' : 'Lehrer'}: ${h.text}\n`;
      });
    }
    
    conversationContext += `\nSchüler: ${message}\n\nBitte antworte als Deutschlehrer im JSON-Format:`;

    // Generate response with Gemini
    const result = await model.generateContent(conversationContext);
    const response = await result.response;
    const responseText = response.text();
    
    // Try to parse as JSON, with fallback
    let aiResponse;
    try {
      // Remove any markdown code blocks if present
      const cleanedResponse = responseText.replace(/```json\n?|\n?```/g, '').trim();
      aiResponse = JSON.parse(cleanedResponse);
    } catch (parseError) {
      console.error('Failed to parse Gemini response as JSON:', parseError);
      // Fallback: create structured response from plain text
      aiResponse = {
        text: responseText,
        corrections: extractCorrections(message),
        metrics: calculateMetrics(message),
        suggestions: generateSuggestions(message)
      };
    }

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(aiResponse)
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
        corrections: [],
        metrics: { accuracy: 75, fluency: 75, grammar_accuracy: 75, vocabulary_usage: 75 },
        suggestions: []
      })
    };
  }
};

// Fallback response when no API key is available
function generateFallbackResponse(message, context) {
  const corrections = extractCorrections(message);
  
  let responseText = 'Vielen Dank für deine Nachricht! ';
  
  if (context?.podcast) {
    responseText += `Ich hoffe, der Podcast "${context.podcast.title}" war interessant. `;
  }
  
  if (corrections.length > 0) {
    responseText += 'Ich habe einige kleine Korrekturen für dich. ';
  }
  
  responseText += 'Wie kann ich dir beim Deutschlernen helfen?';
  
  return {
    text: responseText,
    corrections: corrections,
    metrics: calculateMetrics(message),
    suggestions: generateSuggestions(message)
  };
}

// Helper function to extract common grammar corrections
function extractCorrections(message) {
  const corrections = [];
  
  // Common German grammar mistakes
  const patterns = [
    {
      regex: /\bich\s+habe\s+gegangen\b/i,
      original: 'ich habe gegangen',
      corrected: 'ich bin gegangen',
      explanation: 'Bewegungsverben bilden das Perfekt mit "sein".'
    },
    {
      regex: /\bich\s+bin\s+gemacht\b/i,
      original: 'ich bin gemacht',
      corrected: 'ich habe gemacht',
      explanation: '"Machen" bildet das Perfekt mit "haben".'
    },
    {
      regex: /\bder\s+Frau\b/,
      original: 'der Frau',
      corrected: 'die Frau',
      explanation: '"Frau" ist feminin (Nominativ: die Frau).'
    },
    {
      regex: /\bein\s+Haus\b/,
      original: 'ein Haus',
      corrected: 'ein Haus',
      explanation: 'Korrekt! "Haus" ist Neutrum (ein Haus).'
    }
  ];
  
  patterns.forEach(pattern => {
    if (message.match(pattern.regex)) {
      corrections.push({
        original: pattern.original,
        corrected: pattern.corrected,
        explanation: pattern.explanation
      });
    }
  });
  
  return corrections;
}

// Calculate simple metrics based on message
function calculateMetrics(message) {
  const wordCount = message.split(/\s+/).length;
  const corrections = extractCorrections(message);
  
  return {
    accuracy: Math.max(70, Math.min(95, 100 - (corrections.length * 10))),
    fluency: Math.min(90, 60 + wordCount * 2),
    grammar_accuracy: corrections.length === 0 ? 95 : 75,
    vocabulary_usage: Math.min(85, 70 + Math.floor(wordCount / 2))
  };
}

// Generate learning suggestions
function generateSuggestions(message) {
  const suggestions = [];
  const wordCount = message.split(/\s+/).length;
  const corrections = extractCorrections(message);
  
  if (corrections.length > 0) {
    suggestions.push({
      type: 'Grammar',
      action: 'Übe die korrigierten Strukturen mit ähnlichen Sätzen'
    });
  }
  
  if (wordCount < 10) {
    suggestions.push({
      type: 'Expression',
      action: 'Versuche längere, komplexere Sätze zu bilden'
    });
  }
  
  suggestions.push({
    type: 'Vocabulary',
    action: 'Integriere neue Wörter aus Podcasts in deine Antworten'
  });
  
  return suggestions;
}
