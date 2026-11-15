'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/**
 * ScrollReveal
 *
 * Gradually reveals content divs, cards, and sections as they scroll into view.
 * Uses a high-performance IntersectionObserver with Apple-spec spring easing.
 *
 * Features:
 * - Automatically finds content sections, articles, and cards across all pages.
 * - Staggers sibling elements (e.g. grids of cards, list items) for cascading appearance.
 * - Smooth, hardware-accelerated transitions (opacity + translateY only).
 * - Bypasses instantly when prefers-reduced-motion is enabled.
 * - Cleans up and re-observes on route changes.
 */
export default function ScrollReveal() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Respect user's motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    const TARGET_SELECTORS = [
      '.reveal-on-scroll',
      '.glass-card',
      '.template-card',
      '.tool-card',
      '.blog-card',
      '.faq-item',
      '.creator-card',
      '.category-card',
      '.lc-step-card',
      'main > section:not(.lc-hero)',
      '.templates-grid > article',
      '.tools-grid > *',
      '.features-grid > *',
    ];

    // Find all matching elements that haven't already been revealed
    const selector = TARGET_SELECTORS.join(', ');
    const candidates = Array.from(document.querySelectorAll(selector)).filter((el) => {
      // Exclude hero section (handled by hero entrance choreography)
      if (el.closest('.lc-hero')) return false;
      return true;
    });

    if (candidates.length === 0) return;

    // Initialize unrevealed elements with subtle hidden state
    candidates.forEach((el) => {
      if (!el.classList.contains('is-revealed')) {
        el.classList.add('reveal-init');
      }
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target;

            // Check if element has siblings in the same container for staggered reveal
            const parent = el.parentElement;
            if (parent) {
              const siblings = Array.from(parent.children).filter((c) =>
                c.classList.contains('reveal-init') && !c.classList.contains('is-revealed')
              );
              const index = siblings.indexOf(el);
              if (index > 0) {
                // Apply a gentle staggered delay (up to 300ms max)
                const delay = Math.min(index * 0.08, 0.32);
                el.style.transitionDelay = `${delay}s`;
              }
            }

            el.classList.add('is-revealed');
            observer.unobserve(el);
          }
        });
      },
      {
        root: null,
        rootMargin: '0px 0px -40px 0px', // trigger slightly before it enters full view
        threshold: 0.08,
      }
    );

    candidates.forEach((el) => {
      if (!el.classList.contains('is-revealed')) {
        observer.observe(el);
      }
    });

    return () => {
      observer.disconnect();
    };
  }, [pathname]);

  return null;
}

