exports.handler = async function(event, context) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  };

  // First, redirect to Spotify auth if we don't have a token
  if (!event.headers.authorization) {
    const scope = 'user-read-currently-playing user-read-playback-state';
    const redirectUri = 'https://gleeful-tartufo-15a55b.netlify.app/.netlify/functions/callback';
    const authUrl = `https://accounts.spotify.com/authorize?client_id=${process.env.SPOTIFY_CLIENT_ID}&response_type=token&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}`;
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ auth_url: authUrl })
    };
  }

  try {
    // Use the provided token to get currently playing
    const response = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
      headers: {
        'Authorization': event.headers.authorization
      }
    });

    if (response.status === 401) {
      // Token expired, need to reauthorize
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ needsAuth: true })
      };
    }

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
