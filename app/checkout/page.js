'use client';

import { Suspense } from 'react';
import CheckoutContent from './CheckoutContent';

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="checkout-loading">Preparing secure checkout…</div>}>
      <CheckoutContent />
    </Suspense>
  );
}
