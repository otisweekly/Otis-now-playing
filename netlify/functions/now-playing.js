const fetch = require('node-fetch');

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REFRESH_TOKEN = process.env.SPOTIFY_REFRESH_TOKEN;

async function getAccessToken() {
  console.log('Getting access token...');
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

  const data = await response.json();
  console.log('Token response:', {
    status: response.status,
    type: data.token_type,
    expires: data.expires_in
  });
  return data;
}

async function getPlayerState(access_token) {
  console.log('Fetching player state...');
  const response = await fetch('https://api.spotify.com/v1/me/player', {
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  });

  console.log('Player state response status:', response.status);
  
  if (response.status === 204 || response.status === 404) {
    console.log('No active player found');
    return null;
  }

  const data = await response.json();
  console.log('Player state:', {
    isActive: data.is_playing,
    device: data.device?.name,
    deviceType: data.device?.type,
    deviceActive: data.device?.is_active,
    progressMs: data.progress_ms,
    repeatState: data.repeat_state,
    shuffleState: data.shuffle_state
  });
  return data;
}

async function getNowPlaying(access_token) {
  console.log('Fetching now playing...');
  const playerState = await getPlayerState(access_token);
  
  if (!playerState) {
    return { 
      isPlaying: false,
      title: 'No active device found',
      artist: '',
      album: '',
      albumArt: '',
      songUrl: ''
    };
  }

  // If nothing is playing, return early with device info
  if (!playerState.is_playing || !playerState.item) {
    return {
      isPlaying: false,
      title: 'Nothing playing',
      artist: '',
      album: '',
      device: playerState.device?.name || 'Unknown device',
      deviceType: playerState.device?.type || 'Unknown type',
      albumArt: '',
      songUrl: ''
    };
  }

  return {
    isPlaying: true,
    title: playerState.item.name,
    artist: playerState.item.artists.map(({ name }) => name).join(', '),
    album: playerState.item.album?.name,
    device: playerState.device?.name,
    deviceType: playerState.device?.type,
    albumArt: playerState.item.album?.images[0]?.url,
    songUrl: playerState.item.external_urls?.spotify
  };
}

exports.handler = async function(event, context) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Cache-Control': 'no-cache'
  };

  console.log('Function invoked with method:', event.httpMethod);
  console.log('Environment check:', {
    hasClientId: !!CLIENT_ID,
    hasClientSecret: !!CLIENT_SECRET,
    hasRefreshToken: !!REFRESH_TOKEN
  });

  try {
    if (event.httpMethod === 'OPTIONS') {
      return { statusCode: 200, headers, body: '' };
    }

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
