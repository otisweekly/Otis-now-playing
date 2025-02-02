const fetch = require('node-fetch');

exports.handler = async function(event, context) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type'
  };

  try {
    console.log('Function started');
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: 'Test response' })
    };
  } catch (error) {
    console.log('Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.toString() })
    };
  }
};
