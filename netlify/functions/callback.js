exports.handler = async function(event, context) {
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'text/html',
    },
    body: `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Spotify Authorization</title>
        </head>
        <body>
          <script>
            if (window.location.hash) {
              const token = new URLSearchParams(window.location.hash.substring(1)).get('access_token');
              window.opener.postMessage({ token: token }, '*');
              window.close();
            }
          </script>
          <p>Authorization successful! You can close this window.</p>
        </body>
      </html>
    `
  };
};
