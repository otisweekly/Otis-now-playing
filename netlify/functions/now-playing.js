const fetch = require('node-fetch');

exports.handler = async function(event, context) {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET'
  };

  try {
    // Get access token (we'll set this up in Netlify environment variables)
    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

    // Get auth token
    const authResponse = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + Buffer.from(clientId + ':' + clientSecret).toString('base64')
      },
      body: 'grant_type=client_credentials'
    });

    const authData = await authResponse.json();

    // Get currently playing
    const response = await fetch('https://api.spotify.com/v1/users/elliothasse/player/currently-playing', {
      headers: {
        'Authorization': `Bearer ${authData.access_token}`
      }
    });

    if (response.status === 204) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ isPlaying: false })
      };
    }

    const data = await response.json();
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        isPlaying: true,
        track: data.item.name,
        artist: data.item.artists[0].name
      })
    };
  } catch (error) {
    console.log('error', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed fetching data' })
    };
  }
};
