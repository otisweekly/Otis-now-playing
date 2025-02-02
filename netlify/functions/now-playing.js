exports.handler = async function(event, context) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  };

  // If we don't have an authorization token, redirect to Spotify login
  if (!event.headers.authorization) {
    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const scope = 'user-read-currently-playing user-read-playback-state';
    const redirectUri = 'https://gleeful-tartufo-15a55b.netlify.app/.netlify/functions/callback';
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        needsAuth: true,
        authUrl: `https://accounts.spotify.com/authorize?response_type=token&client_id=${clientId}&scope=${encodeURIComponent(scope)}&redirect_uri=${encodeURIComponent(redirectUri)}`
      })
    };
  }

  try {
    const response = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
      headers: {
        'Authorization': event.headers.authorization,
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
    console.log('Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed fetching data' })
    };
  }
};
