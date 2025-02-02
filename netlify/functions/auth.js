// netlify/functions/auth.js
const fetch = require('node-fetch');

exports.handler = async (event, context) => {
  // Handle the initial authorization request
  if (!event.queryStringParameters.code) {
    const scope = 'user-read-currently-playing user-read-playback-state user-modify-playback-state';
    const redirectUri = 'https://gleeful-tartufo-15a55b.netlify.app/.netlify/functions/auth';
    
    const params = new URLSearchParams({
      client_id: process.env.SPOTIFY_CLIENT_ID,
      response_type: 'code',
      redirect_uri: redirectUri,
      scope: scope,
    });

    return {
      statusCode: 302,
      headers: {
        Location: `https://accounts.spotify.com/authorize?${params.toString()}`
      }
    };
  }

  // Handle the callback with auth code
  try {
    const code = event.queryStringParameters.code;
    const redirectUri = 'https://gleeful-tartufo-15a55b.netlify.app/.netlify/functions/auth';
    
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: 'Basic ' + Buffer.from(
          `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
        ).toString('base64')
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: redirectUri
      })
    });

    const data = await response.json();
    
    // Display the refresh token
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'text/html'
      },
      body: `
        <html>
          <body>
            <h1>Your Refresh Token</h1>
            <p style="word-break: break-all;">
              <strong>${data.refresh_token}</strong>
            </p>
            <p>Copy this token and save it as your SPOTIFY_REFRESH_TOKEN in Netlify's environment variables.</p>
          </body>
        </html>
      `
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to get refresh token' })
    };
  }
};
