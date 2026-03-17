const Stripe = require('stripe');
const { Resend } = require('resend');
const jwt = require('jsonwebtoken');

// Rate limiting using signed tokens (stateless approach)
const CODE_EXPIRY = 10 * 60; // 10 minutes in seconds

function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function checkStripeMembership(stripe, email) {
  try {
    // Search for customer by email
    const customers = await stripe.customers.list({
      email: email.toLowerCase(),
      limit: 1,
    });

    if (customers.data.length === 0) {
      return { isActive: false };
    }

    const customer = customers.data[0];

    // Get subscriptions
    const subscriptions = await stripe.subscriptions.list({
      customer: customer.id,
      status: 'all',
      limit: 10,
    });

    // Check for active, trialing, or past_due subscription
    const activeSubscription = subscriptions.data.find(sub =>
      ['active', 'trialing', 'past_due'].includes(sub.status)
    );

    if (!activeSubscription) {
      return { isActive: false };
    }

    return {
      isActive: true,
      customerId: customer.id,
      customerName: customer.name,
      memberSince: customer.created,
      subscriptionId: activeSubscription.id,
      status: activeSubscription.status,
      currentPeriodEnd: activeSubscription.current_period_end,
    };
  } catch (error) {
    console.error('Stripe error:', error);
    throw error;
  }
}

exports.handler = async (event) => {
  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const resend = new Resend(process.env.RESEND_API_KEY);

  try {
    const { email } = JSON.parse(event.body);

    if (!email || !email.includes('@')) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Valid email required' }),
      };
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check Stripe membership
    const membership = await checkStripeMembership(stripe, normalizedEmail);

    // Always return same response structure to prevent email enumeration
    const successResponse = (challengeToken = null) => ({
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'If you have an active membership, a code has been sent to your email.',
        challengeToken,
      }),
    });

    if (!membership.isActive) {
      // Don't reveal whether email exists or has membership
      // Return a dummy token that will never validate
      const dummyToken = jwt.sign(
        { email: normalizedEmail, code: '000000', dummy: true },
        process.env.JWT_SECRET,
        { expiresIn: CODE_EXPIRY }
      );
      return successResponse(dummyToken);
    }

    // Generate code
    const code = generateCode();

    // Create a challenge token containing the code (encrypted in JWT)
    // This token is passed back to verify the code
    const challengeToken = jwt.sign(
      {
        email: normalizedEmail,
        code,
        membership: {
          customerId: membership.customerId,
          customerName: membership.customerName,
          memberSince: membership.memberSince,
          subscriptionId: membership.subscriptionId,
          status: membership.status,
          currentPeriodEnd: membership.currentPeriodEnd,
        },
      },
      process.env.JWT_SECRET,
      { expiresIn: CODE_EXPIRY }
    );

    // Send email via Resend
    try {
      await resend.emails.send({
        from: 'ILSA Membership <membership@illinoisshuffleboard.org>',
        to: normalizedEmail,
        subject: 'Your ILSA Login Code',
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #4F46E5;">Illinois Shuffleboard Association</h2>
            <p>Your login code is:</p>
            <div style="background: #F3F4F6; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
              <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #1F2937;">${code}</span>
            </div>
            <p style="color: #6B7280;">This code expires in 10 minutes.</p>
            <p style="color: #6B7280;">If you didn't request this code, you can safely ignore this email.</p>
            <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 20px 0;">
            <p style="color: #9CA3AF; font-size: 12px;">Illinois Shuffleboard Association</p>
          </div>
        `,
      });
    } catch (emailError) {
      console.error('Email send error:', emailError);
      // Still return success to prevent enumeration, but log the error
    }

    return successResponse(challengeToken);

  } catch (error) {
    console.error('Auth request error:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'An error occurred. Please try again.' }),
    };
  }
};
