const fetch = require('node-fetch');

exports.handler = async function(event, context) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type'
  };

  try {
    // Get token
    const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + Buffer.from(
          process.env.SPOTIFY_CLIENT_ID + ':' + process.env.SPOTIFY_CLIENT_SECRET
        ).toString('base64')
      },
      body: 'grant_type=client_credentials'
    });

    const tokenData = await tokenResponse.json();
    console.log('Token data:', tokenData);

    // If we don't get a token, return early
    if (!tokenData.access_token) {
      console.log('No access token received');
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ isPlaying: false, message: 'No token' })
      };
    }

    // Get player state
    const response = await fetch('https://api.spotify.com/v1/me/player', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`
      }
    });

    console.log('Response status:', response.status);
    
    // Return the raw response for debugging
    const responseText = await response.text();
    console.log('Raw response:', responseText);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        isPlaying: true,
        debug: responseText
      })
    };

  } catch (error) {
    console.log('Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Failed fetching data',
        message: error.message
      })
    };
  }
};
