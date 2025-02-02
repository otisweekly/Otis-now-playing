const fetch = require('node-fetch');

exports.handler = async function(event, context) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type'
  };

  try {
    // Log environment variables (don't log the full secret!)
    console.log('Client ID exists:', !!process.env.SPOTIFY_CLIENT_ID);
    console.log('Client Secret exists:', !!process.env.SPOTIFY_CLIENT_SECRET);
    
    const auth = Buffer.from(
      process.env.SPOTIFY_CLIENT_ID + ':' + process.env.SPOTIFY_CLIENT_SECRET
    ).toString('base64');
    console.log('Auth string created');

    // Get token
    console.log('Requesting token...');
    const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + auth
      },
      body: 'grant_type=client_credentials'
    });

    console.log('Token response status:', tokenResponse.status);
    const tokenData = await tokenResponse.json();
    console.log('Token data received');

    // Return debug info
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        debug: true,
        clientIdExists: !!process.env.SPOTIFY_CLIENT_ID,
        clientSecretExists: !!process.env.SPOTIFY_CLIENT_SECRET,
        tokenStatus: tokenResponse.status
      })
    };

  } catch (error) {
    console.log('Detailed error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Failed fetching data',
        details: error.toString()
      })
    };
  }
};
