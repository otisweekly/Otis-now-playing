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

  // If no track is playing, return early
  if (response.status === 204 || response.status === 404) {
    return { 
      isPlaying: false,
      title: 'Nothing playing',
      artist: '',
      album: '',
      albumArt: '',
      songUrl: ''
    };
  }

  try {
    const data = await response.json();
    
    // Check if we have valid data
    if (!data || !data.item) {
      return {
        isPlaying: false,
        title: 'Nothing playing',
        artist: '',
        album: '',
        albumArt: '',
        songUrl: ''
      };
    }
    
    return {
      isPlaying: data.is_playing,
      title: data.item.name || 'Unknown track',
      artist: data.item.artists ? data.item.artists.map(({ name }) => name || 'Unknown artist').join(', ') : 'Unknown artist',
      album: data.item.album?.name || 'Unknown album',
      albumArt: data.item.album?.images[0]?.url || '',
      songUrl: data.item.external_urls?.spotify || ''
    };
  } catch (error) {
    console.error('Error parsing response:', error);
    throw new Error('Failed to parse Spotify response');
  }
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

    // Log environment variables (without exposing sensitive data)
    console.log('Environment check:', {
      hasClientId: !!CLIENT_ID,
      hasClientSecret: !!CLIENT_SECRET,
      hasRefreshToken: !!REFRESH_TOKEN
    });

    const tokenResponse = await getAccessToken();
    if (!tokenResponse.access_token) {
      console.error('Token response:', tokenResponse);
      throw new Error('Failed to get access token');
    }

    const song = await getNowPlaying(tokenResponse.access_token);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(song)
    };
  } catch (error) {
    console.error('Error details:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Unable to fetch now playing data',
        details: error.message,
        timestamp: new Date().toISOString()
      })
    };
  }
};
