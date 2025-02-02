exports.handler = async function(event, context) {
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'text/html'
    },
    body: `
      <html>
        <body>
          <script>
            // Get the token from the URL hash
            if (window.location.hash) {
              const token = new URLSearchParams(window.location.hash.substring(1)).get('access_token');
              localStorage.setItem('spotify_token', token);
              if (window.opener) {
                window.opener.postMessage({ token }, '*');
                window.close();
              } else {
                window.location.href = '/';
              }
            }
          </script>
          <p>Authorization successful! You can close this window.</p>
        </body>
      </html>
    `
  };
};
