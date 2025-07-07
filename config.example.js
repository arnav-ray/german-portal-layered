// config.example.js
// Copy this file to config.js and add your real credentials
// Remember to add config.js to your .gitignore file!

window.APP_CONFIG = {
    // Replace with your actual Google Sheet ID
    sheetId: 'YOUR_GOOGLE_SHEET_ID_HERE',
    
    // Replace with your actual Google Sheets API key
    apiKey: 'YOUR_GOOGLE_API_KEY_HERE',
    
    // The name of the sheet/tab in your Google Sheet
    sheetName: 'Sheet1'
};

/* 
IMPORTANT SECURITY NOTES:
1. Never commit config.js to version control
2. Add config.js to your .gitignore file
3. Keep your API key secret and never share it
4. Restrict your API key in Google Cloud Console
5. For production, consider using environment variables or server-side proxy instead
*/