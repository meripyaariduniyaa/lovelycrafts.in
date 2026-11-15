'use client';

import { useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export default function HomeScrollChoreography() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Respect prefers-reduced-motion: if enabled, skip GSAP animations
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    let handlePointerMove = null;
    let handlePointerLeave = null;
    let showcaseEl = null;

    const ctx = gsap.context(() => {
      // 1. Hero entrance: Staggered reveal of .lc-eyebrow, #home-title, .lc-hero-description, .lc-hero-actions, and .lc-hero-showcase
      const heroSelectors = [
        '.lc-hero .lc-eyebrow',
        '#home-title',
        '.lc-hero-description',
        '.lc-hero-actions',
        '.lc-hero-showcase',
      ];

      gsap.fromTo(
        heroSelectors.join(', '),
        {
          opacity: 0,
          y: 28,
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.85,
          stagger: 0.09,
          ease: 'power3.out',
        }
      );

      // 2. Subtle interactive tilt and ambient float on .lc-gift-card
      const giftCard = document.querySelector('.lc-gift-card');
      showcaseEl = document.querySelector('.lc-hero-showcase');

      if (giftCard) {
        // Subtle ambient vertical floating motion
        gsap.to(giftCard, {
          y: -8,
          duration: 3,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        });

        // Ambient floating notes
        const noteTop = document.querySelector('.lc-floating-note-top');
        const noteBottom = document.querySelector('.lc-floating-note-bottom');

        if (noteTop) {
          gsap.to(noteTop, {
            y: -5,
            duration: 2.6,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut',
            delay: 0.2,
          });
        }

        if (noteBottom) {
          gsap.to(noteBottom, {
            y: 5,
            duration: 3.2,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut',
            delay: 0.5,
          });
        }

        // Interactive 3D tilt on mousemove
        if (showcaseEl) {
          handlePointerMove = (e) => {
            const rect = showcaseEl.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;

            const nx = Math.max(-1, Math.min(1, x / (rect.width / 2)));
            const ny = Math.max(-1, Math.min(1, y / (rect.height / 2)));

            const rotX = -ny * 7;
            const rotY = nx * 7;

            gsap.to(giftCard, {
              rotateX: rotX,
              rotateY: rotY,
              rotation: 2 + rotY * 0.3,
              transformPerspective: 900,
              transformOrigin: 'center center',
              duration: 0.4,
              ease: 'power2.out',
              overwrite: 'auto',
            });
          };

          handlePointerLeave = () => {
            gsap.to(giftCard, {
              rotateX: 0,
              rotateY: 0,
              rotation: 2,
              duration: 0.65,
              ease: 'power2.out',
              overwrite: 'auto',
            });
          };

          showcaseEl.addEventListener('pointermove', handlePointerMove);
          showcaseEl.addEventListener('pointerleave', handlePointerLeave);
        }
      }

      // 3. Scroll reveals with ScrollTrigger (scrub: 0.6) for .lc-occasion-section, .lc-catalog-section, .lc-how-section, .lc-trust-strip
      const scrollSections = [
        '.lc-occasion-section',
        '.lc-catalog-section',
        '.lc-how-section',
        '.lc-trust-strip',
        '.lc-creator-promo',
        '.lc-faq-section',
        '.lc-final-cta',
      ];

      scrollSections.forEach((selector) => {
        const el = document.querySelector(selector);
        if (!el) return;

        gsap.fromTo(
          el,
          {
            opacity: 0.15,
            y: 36,
          },
          {
            opacity: 1,
            y: 0,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: el,
              start: 'top 86%',
              end: 'top 58%',
              scrub: 0.6,
            },
          }
        );
      });

      // Scroll reveal for .lc-steps-grid > li
      const stepItems = gsap.utils.toArray('.lc-steps-grid > li');
      if (stepItems.length > 0) {
        stepItems.forEach((stepItem) => {
          gsap.fromTo(
            stepItem,
            {
              opacity: 0.15,
              y: 28,
            },
            {
              opacity: 1,
              y: 0,
              ease: 'power2.out',
              scrollTrigger: {
                trigger: stepItem,
                start: 'top 90%',
                end: 'top 68%',
                scrub: 0.6,
              },
            }
          );
        });
      }

      // Staggered gradual reveal for occasion chips
      const chips = gsap.utils.toArray('.lc-occasion-chip');
      if (chips.length > 0) {
        gsap.fromTo(
          chips,
          { opacity: 0.2, y: 18 },
          {
            opacity: 1,
            y: 0,
            stagger: 0.05,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: '.lc-occasion-list',
              start: 'top 90%',
              end: 'top 72%',
              scrub: 0.6,
            },
          }
        );
      }

      // Staggered gradual reveal for trust badges
      const trustItems = gsap.utils.toArray('.lc-trust-strip > div');
      if (trustItems.length > 0) {
        gsap.fromTo(
          trustItems,
          { opacity: 0.2, y: 18 },
          {
            opacity: 1,
            y: 0,
            stagger: 0.07,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: '.lc-trust-strip',
              start: 'top 92%',
              end: 'top 74%',
              scrub: 0.6,
            },
          }
        );
      }
    });

    const refreshTimer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 200);

    return () => {
      clearTimeout(refreshTimer);
      if (showcaseEl && handlePointerMove && handlePointerLeave) {
        showcaseEl.removeEventListener('pointermove', handlePointerMove);
        showcaseEl.removeEventListener('pointerleave', handlePointerLeave);
      }
      ctx.revert();
    };
  }, []);

  return null;
}
