// netlify/functions/get-articles.js - DEBUG VERSION
exports.handler = async (event, context) => {
  console.log('=== GET-ARTICLES FUNCTION STARTED ===');
  
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

  const SHEET_ID = '1WbU27bSvjaHWCdCl7deU9-iEBTCmlSZe8l99-ppxfS8';
  const API_KEY = process.env.VITE_GOOGLE_API_KEY;
  
  console.log('Sheet ID:', SHEET_ID);
  console.log('API Key exists:', !!API_KEY);
  
  // Debug info to return
  const debugInfo = {
    timestamp: new Date().toISOString(),
    sheetId: SHEET_ID,
    hasApiKey: !!API_KEY,
    method: event.httpMethod,
    attempts: []
  };

  // Method 1: Try Google Sheets API v4 with API key (if available)
  if (API_KEY) {
    console.log('Attempting Method 1: Sheets API v4 with API key');
    debugInfo.attempts.push('Method 1: Sheets API v4');
    
    try {
      const apiUrl = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/Sheet1?key=${API_KEY}`;
      console.log('Fetching from:', apiUrl.replace(API_KEY, 'API_KEY_HIDDEN'));
      
      const response = await fetch(apiUrl);
      console.log('API Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Success! Got', data.values?.length || 0, 'rows');
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            success: true,
            method: 'sheets_api_v4',
            debug: debugInfo,
            values: data.values
          }),
        };
      } else {
        const error = await response.text();
        console.log('API Error:', error);
        debugInfo.attempts.push(`API error: ${response.status}`);
      }
    } catch (error) {
      console.error('Method 1 error:', error.message);
      debugInfo.attempts.push(`Method 1 failed: ${error.message}`);
    }
  }

  // Method 2: Try Google Visualization API (works for public sheets)
  console.log('Attempting Method 2: Google Visualization API');
  debugInfo.attempts.push('Method 2: Visualization API');
  
  try {
    const vizUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json`;
    console.log('Fetching from:', vizUrl);
    
    const response = await fetch(vizUrl);
    console.log('Viz API Response status:', response.status);
    
    if (response.ok) {
      const text = await response.text();
      console.log('Response text length:', text.length);
      console.log('First 200 chars:', text.substring(0, 200));
      
      // Remove the JavaScript wrapper
      let jsonString = text;
      
      // Handle different response formats
      if (text.includes('google.visualization.Query.setResponse')) {
        // Format: google.visualization.Query.setResponse({...});
        jsonString = text.substring(
          text.indexOf('(') + 1,
          text.lastIndexOf(')')
        );
      } else if (text.includes('/*O_o*/')) {
        // Format: /*O_o*/\ngoogle.visualization.Query.setResponse({...});
        jsonString = text.substring(
          text.indexOf('{'),
          text.lastIndexOf('}') + 1
        );
      }
      
      console.log('Attempting to parse JSON...');
      const data = JSON.parse(jsonString);
      console.log('Parse successful! Table has', data.table?.rows?.length || 0, 'rows');
      
      // Convert to values array
      const values = [];
      
      // Add headers
      if (data.table?.cols) {
        const headers = data.table.cols.map(col => col.label || '');
        values.push(headers);
        console.log('Headers:', headers);
      }
      
      // Add data rows
      if (data.table?.rows) {
        data.table.rows.forEach((row, index) => {
          const rowData = row.c.map(cell => {
            if (!cell) return '';
            // Handle different value types
            if (cell.v !== undefined) {
              if (typeof cell.v === 'object' && cell.f) {
                return cell.f; // Formatted value
              }
              return String(cell.v);
            }
            return '';
          });
          values.push(rowData);
          
          // Log first few rows for debugging
          if (index < 3) {
            console.log(`Row ${index}:`, rowData.slice(0, 4));
          }
        });
      }
      
      console.log('Total values rows:', values.length);
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          method: 'visualization_api',
          debug: debugInfo,
          values: values
        }),
      };
    } else {
      console.log('Viz API failed with status:', response.status);
      debugInfo.attempts.push(`Viz API failed: ${response.status}`);
    }
  } catch (error) {
    console.error('Method 2 error:', error.message);
    debugInfo.attempts.push(`Method 2 failed: ${error.message}`);
  }

  // Method 3: Try CSV export (another public sheet method)
  console.log('Attempting Method 3: CSV Export');
  debugInfo.attempts.push('Method 3: CSV Export');
  
  try {
    const csvUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv`;
    console.log('Fetching from:', csvUrl);
    
    const response = await fetch(csvUrl);
    console.log('CSV Response status:', response.status);
    
    if (response.ok) {
      const csvText = await response.text();
      console.log('CSV text length:', csvText.length);
      console.log('First 200 chars:', csvText.substring(0, 200));
      
      // Parse CSV
      const lines = csvText.split('\n');
      const values = lines.map(line => {
        // Simple CSV parser - handles basic cases
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
      
      console.log('Parsed', values.length, 'rows from CSV');
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          method: 'csv_export',
          debug: debugInfo,
          values: values
        }),
      };
    } else {
      console.log('CSV export failed with status:', response.status);
      debugInfo.attempts.push(`CSV export failed: ${response.status}`);
    }
  } catch (error) {
    console.error('Method 3 error:', error.message);
    debugInfo.attempts.push(`Method 3 failed: ${error.message}`);
  }

  // All methods failed - return sample data with debug info
  console.log('All methods failed! Returning sample data with debug info');
  
  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      success: false,
      method: 'fallback',
      debug: debugInfo,
      error: 'All fetch methods failed. Using sample data.',
      values: [
        // Headers
        ['DATE', 'LEVEL', 'THEME', 'STATUS', 'GERMAN_ARTICLE', 'ENGLISH_TRANSLATION', 'VOCABULARY_USED', 'DEEP_DIVE_GRAMMAR', 'PHRASE_AND_IDIOM', 'QUOTE_AND_JOKE', 'CONVERSATION_TIME', 'GRAMMAR_TOPIC_TAGS', 'DRILL_SENTENCES'],
        // Sample data
        [
          '2024-01-20',
          'B2',
          'Job Interview',
          'Published',
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
          '2024-01-19',
          'A2-B1',
          'Shopping',
          'Published',
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
    }),
  };
};
