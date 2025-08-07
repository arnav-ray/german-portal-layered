// netlify/functions/get-podcasts.js
exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
  };

  const category = event.queryStringParameters?.category || 'ai-tech';
  
  // Sample podcast data that actually works
  const podcasts = {
    'ai-tech': {
      title: 'KI Revolution in Deutschland',
      script: `Markus: Willkommen zum Tech-Podcast! Heute sprechen wir über künstliche Intelligenz in Deutschland.

Anna: Danke Markus! Die Entwicklung ist wirklich beeindruckend. Viele deutsche Unternehmen nutzen jetzt KI für ihre Prozesse.

Markus: Genau! Besonders im Bereich der Automatisierung sehen wir große Fortschritte. Die Technologie verändert unsere Arbeitswelt komplett.

Anna: Ja, aber wir müssen auch über die Herausforderungen sprechen. Datenschutz ist in Deutschland besonders wichtig.

Markus: Das stimmt. Die DSGVO gibt uns strenge Regeln. Aber das ist auch gut so - wir brauchen verantwortungsvolle KI.`,
      level: 'B2'
    },
    'finance-business': {
      title: 'Deutsche Wirtschaft Heute',
      script: `Klaus: Guten Tag! Die deutsche Wirtschaft steht vor großen Herausforderungen.

Maria: Ja, die Inflation und die Energiepreise bereiten vielen Unternehmen Kopfschmerzen.

Klaus: Trotzdem gibt es auch positive Entwicklungen. Der Export läuft wieder besser.

Maria: Das stimmt. Besonders die Automobilindustrie erholt sich langsam.`,
      level: 'B2'
    },
    'leadership-strategy': {
      title: 'Führung im digitalen Zeitalter',
      script: `Thomas: Führungskräfte müssen heute ganz anders denken als früher.

Sarah: Absolut! Remote Work hat alles verändert. Teams sind global verteilt.

Thomas: Die Kommunikation ist der Schlüssel. Ohne klare Kommunikation funktioniert nichts.`,
      level: 'C1+'
    },
    'science-innovation': {
      title: 'Wissenschaft und Forschung',
      script: `Dr. Weber: Die Forschung in Deutschland ist weltweit führend.

Prof. Schmidt: Besonders in der Medizin und Biotechnologie sind wir stark.

Dr. Weber: Die Zusammenarbeit zwischen Universitäten und Industrie funktioniert sehr gut.`,
      level: 'B2'
    },
    'sunday-specials': {
      title: 'Deutsches Wochenende',
      script: `Lisa: Was machst du am Wochenende?

Tom: Ich gehe wandern! Das Wetter soll schön werden.

Lisa: Super Idee! Ich bleibe zu Hause und lese ein Buch. Manchmal ist Entspannung das Beste.`,
      level: 'A2-B1'
    }
  };

  const podcast = podcasts[category] || podcasts['ai-tech'];
  
  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      success: true,
      episodes: [{
        id: `${category}-${new Date().toISOString().split('T')[0]}`,
        title: podcast.title,
        date: new Date().toISOString().split('T')[0],
        duration: '5 min',
        script: podcast.script,
        description: `German learning podcast about ${category}`,
        learning_metadata: {
          difficulty_level: podcast.level,
          grammar_focus: 'Conversation, Present tense',
          vocabulary_count: 30,
          estimated_study_time: '10 min'
        }
      }]
    })
  };
};