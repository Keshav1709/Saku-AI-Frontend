'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface PaymentInfo {
  id: string;
  amount: number;
  currency: string;
  status: string;
  created: number;
  payment_method: {
    type: string;
    card?: {
      brand: string;
      last4: string;
    };
  };
}

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const paymentIntentId = searchParams.get('payment_intent');

  useEffect(() => {
    if (paymentIntentId) {
      fetchPaymentInfo(paymentIntentId);
    } else {
      setError('No payment intent ID provided');
      setLoading(false);
    }
  }, [paymentIntentId]);

  const fetchPaymentInfo = async (intentId: string) => {
    try {
      const response = await fetch(`/api/payment-info?payment_intent=${intentId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch payment information');
      }

      const data = await response.json();
      setPaymentInfo(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  const formatAmount = (amount: number) => {
    return (amount / 100).toFixed(2);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading payment information...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto p-6 bg-red-50 border border-red-200 rounded-lg">
          <h2 className="text-xl font-semibold text-red-800 mb-2">Error</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <Link
            href="/payments"
            className="inline-block bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
          >
            Try Again
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
            <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Payment Successful!
          </h1>
          <p className="text-lg text-gray-600">
            Thank you for your payment. Your transaction has been completed successfully.
          </p>
        </div>

        {paymentInfo && (
          <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Payment Details</h2>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Transaction ID:</span>
                <span className="font-mono text-sm text-gray-900">{paymentInfo.id}</span>
              </div>
              
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Amount:</span>
                <span className="font-semibold text-gray-900">
                  ${formatAmount(paymentInfo.amount)} {paymentInfo.currency.toUpperCase()}
                </span>
              </div>
              
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Status:</span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  {paymentInfo.status.charAt(0).toUpperCase() + paymentInfo.status.slice(1)}
                </span>
              </div>
              
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Payment Method:</span>
                <span className="text-gray-900">
                  {paymentInfo.payment_method.card 
                    ? `${paymentInfo.payment_method.card.brand.toUpperCase()} •••• ${paymentInfo.payment_method.card.last4}`
                    : paymentInfo.payment_method.type.toUpperCase()
                  }
                </span>
              </div>
              
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600">Date:</span>
                <span className="text-gray-900">{formatDate(paymentInfo.created)}</span>
              </div>
            </div>
          </div>
        )}

        <div className="text-center space-y-4">
          <Link
            href="/dashboard"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Go to Dashboard
          </Link>
          
          <div>
            <Link
              href="/payments"
              className="text-blue-600 hover:text-blue-800 transition-colors"
            >
              Make Another Payment
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
