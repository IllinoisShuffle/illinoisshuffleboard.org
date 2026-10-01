const jwt = require('jsonwebtoken');
const Stripe = require('stripe');

function parseCookies(cookieHeader) {
  const cookies = {};
  if (!cookieHeader) return cookies;

  cookieHeader.split(';').forEach(cookie => {
    const [name, ...rest] = cookie.split('=');
    cookies[name.trim()] = rest.join('=').trim();
  });

  return cookies;
}

exports.handler = async (event) => {
  // Only allow GET
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    // Get session token from cookie
    const cookies = parseCookies(event.headers.cookie);
    const sessionToken = cookies.ilsa_session;

    if (!sessionToken) {
      return {
        statusCode: 401,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Not authenticated', redirectUrl: '/login/' }),
      };
    }

    // Verify session token
    let session;
    try {
      session = jwt.verify(sessionToken, process.env.JWT_SECRET);
    } catch (jwtError) {
      return {
        statusCode: 401,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Session expired', redirectUrl: '/login/' }),
      };
    }

    // Fetch fresh data from Stripe
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    const customer = await stripe.customers.retrieve(session.membership.customerId);

    const subscriptions = await stripe.subscriptions.list({
      customer: session.membership.customerId,
      status: 'all',
      limit: 10,
    });

    // Find the active subscription
    const activeSubscription = subscriptions.data.find(sub =>
      ['active', 'trialing', 'past_due'].includes(sub.status)
    );

    if (!activeSubscription) {
      return {
        statusCode: 403,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error: 'Membership not active',
          message: 'Your membership is no longer active. Please renew to continue.',
          redirectUrl: '/join/',
        }),
      };
    }

    // Format dates for display
    const memberSince = new Date(customer.created * 1000);
    const nextBillDate = new Date(activeSubscription.current_period_end * 1000);

    // Get subscription details
    const subscriptionItem = activeSubscription.items.data[0];
    const planName = subscriptionItem?.price?.nickname || 'Annual Membership';
    const planAmount = subscriptionItem?.price?.unit_amount || 2500;

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: session.email,
        name: customer.name || session.email.split('@')[0],
        memberSince: memberSince.toISOString(),
        memberSinceFormatted: memberSince.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
        nextBillDate: nextBillDate.toISOString(),
        nextBillDateFormatted: nextBillDate.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
        status: activeSubscription.status,
        statusDisplay: activeSubscription.status === 'active' ? 'Active' :
                       activeSubscription.status === 'trialing' ? 'Trial' :
                       activeSubscription.status === 'past_due' ? 'Past Due' : activeSubscription.status,
        plan: planName,
        amount: (planAmount / 100).toFixed(2),
        billingPortalUrl: 'https://billing.stripe.com/p/login/4gw9CrbW48PG2GIcMM',
      }),
    };

  } catch (error) {
    console.error('Member data error:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'An error occurred. Please try again.' }),
    };
  }
};
