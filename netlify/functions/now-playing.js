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
  // Log the full player state for debugging
  console.log('Full player state:', JSON.stringify(data, null, 2));
  
  return data;
}

async function getCurrentlyPlaying(access_token) {
  console.log('Fetching currently playing track...');
  const response = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  });

  console.log('Currently playing response status:', response.status);
  
  if (response.status === 204 || response.status === 404) {
    console.log('No track currently playing');
    return null;
  }

  const data = await response.json();
  console.log('Currently playing data:', JSON.stringify(data, null, 2));
  return data;
}

async function getNowPlaying(access_token) {
  const playerState = await getPlayerState(access_token);
  const currentTrack = await getCurrentlyPlaying(access_token);
  
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

  if (!currentTrack || !currentTrack.item) {
    return {
      isPlaying: playerState.is_playing || false,
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
    isPlaying: currentTrack.is_playing,
    title: currentTrack.item.name,
    artist: currentTrack.item.artists.map(({ name }) => name).join(', '),
    album: currentTrack.item.album?.name,
    device: playerState.device?.name,
    deviceType: playerState.device?.type,
    albumArt: currentTrack.item.album?.images[0]?.url,
    songUrl: currentTrack.item.external_urls?.spotify
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
