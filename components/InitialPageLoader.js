'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import HeartLoader from './HeartLoader';

// Exclude payment processing and dedicated-loading routes from global entrance loader
const skipInitialLoaderRoutes = ['/checkout', '/invoice'];

export default function InitialPageLoader() {
  const pathname = usePathname() || '/';
  const [show, setShow] = useState(true);

  const shouldSkip = skipInitialLoaderRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );

  if (!show || shouldSkip) return null;

  // Contextual loading message based on landing route
  let message = 'Made with love from the bottom of Heart';
  if (pathname.startsWith('/p/')) {
    message = 'A little surprise is on its way...';
  } else if (pathname.startsWith('/templates')) {
    message = 'Preparing your experience...';
  } else if (pathname.startsWith('/create')) {
    message = 'Creating something special...';
  }

  return (
    <HeartLoader
      message={message}
      loading={false}
      onComplete={() => setShow(false)}
    />
  );
}
