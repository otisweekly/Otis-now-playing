exports.handler = async function(event, context) {
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'text/html',
      'Access-Control-Allow-Origin': '*'
    },
    body: `
      <html>
        <body>
          <script>
            if (window.location.hash) {
              const token = new URLSearchParams(window.location.hash.substring(1)).get('access_token');
              window.opener.postMessage({ token }, '*');
              window.close();
            }
          </script>
        </body>
      </html>
    `
  };
};
