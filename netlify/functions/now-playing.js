exports.handler = async function(event, context) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  };

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers
    };
  }

  try {
    const response = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
      headers: {
        'Authorization': `Bearer ${event.headers.authorization || ''}`
      }
    });

    if (response.status === 401) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ 
          auth_url: `https://accounts.spotify.com/authorize?client_id=${process.env.SPOTIFY_CLIENT_ID}&response_type=token&redirect_uri=${encodeURIComponent('https://gleeful-tartufo-15a55b.netlify.app/.netlify/functions/callback')}&scope=${encodeURIComponent('user-read-currently-playing user-read-playback-state')}`
        })
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
