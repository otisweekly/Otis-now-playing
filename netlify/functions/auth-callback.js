exports.handler = async function(event, context) {
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'text/html'
    },
    body: `
      <html>
        <body style="background: #EFEDEF; font-family: -apple-system, system-ui, BlinkMacSystemFont;">
          <h3>Setup Complete!</h3>
          <p>Check your Netlify function logs for your refresh token.</p>
          <p>Add that token to your environment variables and you're all set!</p>
        </body>
      </html>
    `
  };
};
