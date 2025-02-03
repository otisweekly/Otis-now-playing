// netlify/functions/now-playing.js
const fetch = require('node-fetch');

exports.handler = async function(event, context) {
  const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
  const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
  const REFRESH_TOKEN = process.env.SPOTIFY_REFRESH_TOKEN;

  try {
    // Get access token
    const authResponse = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: 'Basic ' + Buffer.from(CLIENT_ID + ':' + CLIENT_SECRET).toString('base64')
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: REFRESH_TOKEN
      })
    });

    const auth = await authResponse.json();

    // Get currently playing
    const response = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
      headers: {
        Authorization: `Bearer ${auth.access_token}`
      }
    });

    // If no track is playing, return simple message
    if (response.status === 204) {
      return {
        statusCode: 200,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ isPlaying: false })
      };
    }

    const data = await response.json();
    
    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({
        isPlaying: true,
        title: data.item.name,
        artist: data.item.artists.map(artist => artist.name).join(', ')
      })
    };

  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Failed to fetch now playing' })
    };
  }
};
