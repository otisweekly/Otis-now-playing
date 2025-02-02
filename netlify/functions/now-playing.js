exports.handler = async function(event, context) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  };

  try {
    const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + Buffer.from(
          process.env.SPOTIFY_CLIENT_ID + ':' + process.env.SPOTIFY_CLIENT_SECRET
        ).toString('base64')
      },
      body: 'grant_type=client_credentials&scope=user-read-currently-playing'
    });

    const tokenData = await tokenResponse.json();
    console.log('Token response:', tokenData); // For debugging

    const response = await fetch('https://api.spotify.com/v1/me/player', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`
      }
    });

    console.log('Player response status:', response.status); // For debugging

    const data = await response.json();
    console.log('Player response:', data); // For debugging

    if (!data || !data.item) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          isPlaying: true,
          debug: data // This will help us see what we're getting back
        })
      };
    }

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
    console.log('Detailed error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Failed fetching data',
        details: error.message
      })
    };
  }
};
