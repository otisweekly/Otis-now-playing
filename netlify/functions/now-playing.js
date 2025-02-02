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
      body: 'grant_type=client_credentials'
    });

    const tokenData = await tokenResponse.json();

    const response = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`
      }
    });

    // Log the full response for debugging
    console.log('Response status:', response.status);
    const responseText = await response.text();
    console.log('Response body:', responseText);

    try {
      const data = JSON.parse(responseText);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          isPlaying: true,
          track: data.item ? data.item.name : 'Unknown Track',
          artist: data.item && data.item.artists ? data.item.artists[0].name : 'Unknown Artist'
        })
      };
    } catch (e) {
      console.log('Parse error:', e);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          isPlaying: true,
          debug: responseText
        })
      };
    }
  } catch (error) {
    console.log('Error:', error);
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
