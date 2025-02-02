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
    console.log('Token response:', tokenData);

    // Get currently playing
    const response = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`
      }
    });

    console.log('Spotify response status:', response.status);

    // If nothing is playing
    if (response.status === 204) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ isPlaying: false })
      };
    }

    // Parse response data
    const responseText = await response.text();
    console.log('Raw response:', responseText);
    
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.log('Parse error:', e);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ isPlaying: false })
      };
    }

    // Check if we have valid data
    if (!data || !data.item) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ isPlaying: false })
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        isPlaying: true,
        track: data.item.name || 'Unknown Track',
        artist: data.item.artists?.[0]?.name || 'Unknown Artist'
      })
    };
  } catch (error) {
    console.log('Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed fetching data' })
    };
  }
};
