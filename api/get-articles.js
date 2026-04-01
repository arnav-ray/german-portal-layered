// api/get-articles.js — Vercel serverless function
module.exports = async function handler(req, res) {
  const allowedOrigin = process.env.ALLOWED_ORIGIN || 'https://german.arnavray.ca';

  res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const SHEET_ID = process.env.GOOGLE_SHEET_ID;
  const API_KEY = process.env.VITE_GOOGLE_API_KEY;

  if (!SHEET_ID) {
    console.error('GOOGLE_SHEET_ID environment variable is not set');
    return res.status(500).json({ success: false, error: 'Server configuration error' });
  }

  // Method 1: Try Google Sheets API v4 with API key (if available)
  if (API_KEY) {
    try {
      const apiUrl = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/Sheet1?key=${API_KEY}`;
      const response = await fetch(apiUrl);

      if (response.ok) {
        const data = await response.json();
        return res.status(200).json({
          success: true,
          method: 'sheets_api_v4',
          values: data.values,
        });
      } else {
        console.error('Sheets API error:', response.status);
      }
    } catch (error) {
      console.error('Method 1 error:', error.message);
    }
  }

  // Method 2: Try Google Visualization API (works for public sheets)
  try {
    const vizUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json`;
    const response = await fetch(vizUrl);

    if (response.ok) {
      const text = await response.text();

      let jsonString = text;
      if (text.includes('google.visualization.Query.setResponse')) {
        jsonString = text.substring(text.indexOf('(') + 1, text.lastIndexOf(')'));
      } else if (text.includes('/*O_o*/')) {
        jsonString = text.substring(text.indexOf('{'), text.lastIndexOf('}') + 1);
      }

      const data = JSON.parse(jsonString);
      const values = [];

      if (data.table?.cols) {
        values.push(data.table.cols.map(col => col.label || ''));
      }

      if (data.table?.rows) {
        data.table.rows.forEach(row => {
          const rowData = row.c.map(cell => {
            if (!cell) return '';
            if (cell.v !== undefined) {
              if (typeof cell.v === 'object' && cell.f) return cell.f;
              return String(cell.v);
            }
            return '';
          });
          values.push(rowData);
        });
      }

      return res.status(200).json({
        success: true,
        method: 'visualization_api',
        values,
      });
    } else {
      console.error('Viz API failed:', response.status);
    }
  } catch (error) {
    console.error('Method 2 error:', error.message);
  }

  // Method 3: Try CSV export
  try {
    const csvUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv`;
    const response = await fetch(csvUrl);

    if (response.ok) {
      const csvText = await response.text();
      const lines = csvText.split('\n');
      const values = lines.map(line => {
        const cells = [];
        let current = '';
        let inQuotes = false;

        for (let i = 0; i < line.length; i++) {
          const char = line[i];
          if (char === '"') {
            inQuotes = !inQuotes;
          } else if (char === ',' && !inQuotes) {
            cells.push(current.trim());
            current = '';
          } else {
            current += char;
          }
        }
        cells.push(current.trim());
        return cells;
      });

      return res.status(200).json({
        success: true,
        method: 'csv_export',
        values,
      });
    } else {
      console.error('CSV export failed:', response.status);
    }
  } catch (error) {
    console.error('Method 3 error:', error.message);
  }

  // All methods failed — return fallback sample data
  return res.status(200).json({
    success: false,
    method: 'fallback',
    error: 'All fetch methods failed. Using sample data.',
    values: [
      ['DATE', 'LEVEL', 'THEME', 'STATUS', 'GERMAN_ARTICLE', 'ENGLISH_TRANSLATION', 'VOCABULARY_USED', 'DEEP_DIVE_GRAMMAR', 'PHRASE_AND_IDIOM', 'QUOTE_AND_JOKE', 'CONVERSATION_TIME', 'GRAMMAR_TOPIC_TAGS', 'DRILL_SENTENCES'],
      [
        '2024-01-20', 'B2', 'Job Interview', 'Published',
        'Ich hatte gestern ein wichtiges Vorstellungsgespräch bei einer großen Firma. Der Personaler stellte mir viele Fragen über meine Berufserfahrung.',
        'I had an important job interview at a large company yesterday. The HR manager asked me many questions about my work experience.',
        'das Vorstellungsgespräch - job interview, der Personaler - HR manager, die Berufserfahrung - work experience',
        'Präteritum (simple past) is used for completed actions.',
        'Daumen drücken - to keep fingers crossed',
        'Erfolg ist kein Zufall - Success is no coincidence',
        'A: Wie war dein Vorstellungsgespräch? B: Es lief gut!',
        'Präteritum,Modalverben',
        'Gestern ging ich ins Kino.'
      ],
      [
        '2024-01-19', 'A2-B1', 'Shopping', 'Published',
        'Heute gehe ich einkaufen. Ich brauche Milch, Brot und Käse. Der Supermarkt ist nicht weit von meiner Wohnung.',
        'Today I am going shopping. I need milk, bread, and cheese. The supermarket is not far from my apartment.',
        'einkaufen - to shop, die Milch - milk, das Brot - bread, der Käse - cheese',
        'Present tense for planned actions.',
        'Das ist mir Wurst - I dont care',
        'Wer billig kauft, kauft zweimal',
        'Verkäufer: Was darf es sein?',
        'Präsens,Akkusativ',
        'Ich brauche einen Stift.'
      ]
    ]
  });
};
