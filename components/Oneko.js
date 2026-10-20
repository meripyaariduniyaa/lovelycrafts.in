'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { isOnekoAllowed } from '@/lib/oneko-config';

export { isOnekoAllowed };

export default function Oneko() {
  const pathname = usePathname();

  useEffect(() => {
    // If current route is not an allowed page, ensure any existing cat is removed and do nothing
    if (!isOnekoAllowed(pathname)) {
      const existingEl = document.getElementById('oneko');
      if (existingEl) existingEl.remove();
      const existingScript = document.getElementById('oneko-script');
      if (existingScript) existingScript.remove();
      return;
    }

    // Don't spawn duplicate oneko cats
    if (document.getElementById('oneko') || document.getElementById('oneko-script')) return;

    const script = document.createElement('script');
    script.id = 'oneko-script';
    script.src = '/oneko/oneko.js';
    script.async = true;
    script.dataset.cat = '/oneko/oneko.gif';
    document.body.appendChild(script);

    return () => {
      const el = document.getElementById('oneko');
      if (el) el.remove();
      if (script.parentNode) script.parentNode.removeChild(script);
    };
  }, [pathname]);

  return null;
}
