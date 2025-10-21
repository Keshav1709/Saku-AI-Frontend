import {NextRequest, NextResponse} from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
});

export async function GET(request: NextRequest) {
  try {
    // Defensive programming: Check environment variables
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
          {error: 'Stripe secret key is not configured'}, {status: 500});
    }

    const {searchParams} = new URL(request.url);
    const paymentIntentId = searchParams.get('payment_intent');

    if (!paymentIntentId) {
      return NextResponse.json(
          {error: 'Payment intent ID is required'}, {status: 400});
    }

    // Retrieve payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    return NextResponse.json({
      id: paymentIntent.id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      status: paymentIntent.status,
      created: paymentIntent.created,
      payment_method: paymentIntent.payment_method,
    });
  } catch (error) {
    console.error('Error retrieving payment intent:', error);

    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
          {error: `Stripe error: ${error.message}`}, {status: 400});
    }

    return NextResponse.json({error: 'Internal server error'}, {status: 500});
  }
}
