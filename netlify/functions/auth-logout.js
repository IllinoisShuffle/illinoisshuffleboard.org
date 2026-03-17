exports.handler = async (event) => {
  // Allow both POST and GET for convenience
  if (event.httpMethod !== 'POST' && event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  // Determine cookie attributes based on environment
  const isProduction = process.env.SITE_URL && process.env.SITE_URL.includes('illinoisshuffleboard.org');
  const cookieDomain = isProduction ? '.illinoisshuffleboard.org' : '';
  const secure = isProduction ? 'Secure; ' : '';

  // Clear the session cookie by setting it to empty with immediate expiry
  const cookie = `ilsa_session=; HttpOnly; ${secure}SameSite=Lax; Path=/; Max-Age=0${cookieDomain ? `; Domain=${cookieDomain}` : ''}`;

  // Check if this is an API call or a page navigation
  const acceptHeader = event.headers.accept || '';
  const isApiCall = acceptHeader.includes('application/json');

  if (isApiCall) {
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Set-Cookie': cookie,
      },
      body: JSON.stringify({
        success: true,
        message: 'Logged out successfully',
      }),
    };
  }

  // For browser navigation, redirect to login page
  return {
    statusCode: 302,
    headers: {
      'Location': '/login/',
      'Set-Cookie': cookie,
    },
    body: '',
  };
};
