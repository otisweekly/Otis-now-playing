exports.handler = async function(event, context) {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const redirectUri = 'https://gleeful-tartufo-15a55b.netlify.app/.netlify/functions/callback';
  const scope = 'user-read-currently-playing user-read-playback-state';
  
  const authUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=token&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}`;

  if (!event.headers.authorization) {
    return {
      statusCode: 302,
      headers: {
        'Location': authUrl,
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    };
  }

  try {
    const response = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
      headers: {
        'Authorization': event.headers.authorization
      }
    });

    if (response.status === 204) {
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type'
        },
        body: JSON.stringify({ isPlaying: false })
      };
    }

    const data = await response.json();
    
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type'
      },
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
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type'
      },
      body: JSON.stringify({ error: 'Failed fetching data' })
    };
  }
};
