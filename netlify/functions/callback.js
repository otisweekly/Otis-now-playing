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
          <script>
            if (window.location.hash) {
              const token = new URLSearchParams(window.location.hash.substring(1)).get('access_token');
              // Store token and redirect back to main site
              localStorage.setItem('spotify_token', token);
              window.location.href = 'https://otisweekly.com'; // Replace with your actual domain
            }
          </script>
        </head>
        <body>
          <p>Authorizing...</p>
        </body>
      </html>
    `
  };
};
