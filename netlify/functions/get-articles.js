exports.handler = async (event, context) => {
  const SHEET_ID = '1WbU27bSvjaHWCdCl7deU9-iEBTCmlSZe8l99-ppxfS8';
  const API_KEY = 'AIzaSyDzkcT5B5E-JluZz-dHh-EpIzQTpsbLT7s';
  const SHEET_NAME = 'Sheet1';
  
  try {
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${SHEET_NAME}?key=${API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }
    
    const data = await response.json();
    
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ error: error.message }),
    };
  }
};
