const fetch = require('node-fetch');

// Your Spotify credentials - store these in Netlify environment variables
const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REFRESH_TOKEN = process.env.SPOTIFY_REFRESH_TOKEN;

async function getAccessToken() {
  const basic = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');
  
  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basic}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: REFRESH_TOKEN,
    }),
  });

  return response.json();
}

async function getNowPlaying(access_token) {
  const response = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  });

  if (response.status === 204) {
    return { isPlaying: false };
  }

  const data = await response.json();
  
  return {
    isPlaying: data.is_playing,
    title: data.item.name,
    artist: data.item.artists.map(({ name }) => name).join(', '),
    album: data.item.album.name,
    albumArt: data.item.album.images[0]?.url,
    songUrl: data.item.external_urls.spotify
  };
}

exports.handler = async function(event, context) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Cache-Control': 'no-cache'
  };

  try {
    // Handle preflight requests
    if (event.httpMethod === 'OPTIONS') {
      return {
        statusCode: 200,
        headers,
        body: ''
      };
    }

    const { access_token } = await getAccessToken();
    const song = await getNowPlaying(access_token);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(song)
    };
  } catch (error) {
    console.log('Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Unable to fetch now playing data',
        details: error.message 
      })
    };
  }
};
