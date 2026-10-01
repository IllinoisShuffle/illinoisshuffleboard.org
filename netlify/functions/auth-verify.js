const jwt = require('jsonwebtoken');

const SESSION_EXPIRY = 7 * 24 * 60 * 60; // 7 days in seconds

exports.handler = async (event) => {
  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { challengeToken, code } = JSON.parse(event.body);

    if (!challengeToken || !code) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Challenge token and code required' }),
      };
    }

    // Verify and decode the challenge token
    let challenge;
    try {
      challenge = jwt.verify(challengeToken, process.env.JWT_SECRET);
    } catch (jwtError) {
      if (jwtError.name === 'TokenExpiredError') {
        return {
          statusCode: 400,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ error: 'Code expired. Please request a new one.' }),
        };
      }
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Invalid request. Please try again.' }),
      };
    }

    // Check if it's a dummy token (non-member tried to log in)
    if (challenge.dummy) {
      return {
        statusCode: 401,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Invalid code. Please try again.' }),
      };
    }

    // Verify the code matches
    if (challenge.code !== code.trim()) {
      return {
        statusCode: 401,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Invalid code. Please try again.' }),
      };
    }

    // Code is valid - create session JWT
    const sessionToken = jwt.sign(
      {
        email: challenge.email,
        membership: challenge.membership,
      },
      process.env.JWT_SECRET,
      { expiresIn: SESSION_EXPIRY }
    );

    // Determine cookie attributes based on environment
    const isProduction = process.env.SITE_URL && process.env.SITE_URL.includes('illinoisshuffleboard.org');
    const cookieDomain = isProduction ? '.illinoisshuffleboard.org' : '';
    const secure = isProduction ? 'Secure; ' : '';

    // Set the session cookie
    const cookie = `ilsa_session=${sessionToken}; HttpOnly; ${secure}SameSite=Lax; Path=/; Max-Age=${SESSION_EXPIRY}${cookieDomain ? `; Domain=${cookieDomain}` : ''}`;

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Set-Cookie': cookie,
      },
      body: JSON.stringify({
        success: true,
        message: 'Login successful',
        redirectUrl: '/member/',
      }),
    };

  } catch (error) {
    console.error('Auth verify error:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'An error occurred. Please try again.' }),
    };
  }
};
