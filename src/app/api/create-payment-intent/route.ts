import {NextRequest, NextResponse} from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
});

export async function POST(request: NextRequest) {
  try {
    // Defensive programming: Check environment variables
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
          {error: 'Stripe secret key is not configured'}, {status: 500});
    }

    if (!process.env.NEXTAUTH_SECRET) {
      return NextResponse.json(
          {error: 'NextAuth secret is not configured'}, {status: 500});
    }

    const {amount} = await request.json();

    // Validate amount
    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json(
          {error: 'Invalid amount provided'}, {status: 400});
    }

    // Convert to cents (using the convertToSubcurrency function logic)
    const amountInCents = Math.round(amount * 100);

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'usd',
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        amount: amount.toString(),
      },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);

    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
          {error: `Stripe error: ${error.message}`}, {status: 400});
    }

    return NextResponse.json({error: 'Internal server error'}, {status: 500});
  }
}
