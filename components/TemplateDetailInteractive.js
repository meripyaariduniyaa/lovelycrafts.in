'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { springs } from '@/lib/motion';
import { triggerHaptic } from '@/lib/haptics';
import PreviewDemoButton from '@/components/PreviewDemoButton';

export default function TemplateDetailInteractive({ template }) {
  const [activeSlide, setActiveSlide] = useState(0);
  const [dynamicPricing, setDynamicPricing] = useState({});
  const carouselRef = useRef(null);

  useEffect(() => {
    fetch('/api/pricing')
      .then((res) => res.json())
      .then((data) => {
        if (data?.success && data.pricing) {
          setDynamicPricing(data.pricing);
        }
      })
      .catch(() => {});
  }, []);

  const pricing = dynamicPricing[template.id] || {};
  const activePrice = pricing.price ?? template.price ?? 199;
  const activeBasePrice = pricing.basePrice ?? template.basePrice ?? 499;
  const isAvailable = pricing.enabled !== false;

  const slides = [
    {
      title: 'Interactive Experience',
      badge: template.badge || 'Popular',
      bg: template.gradient,
      content: (
        <div style={{ textAlign: 'center', color: '#fff', padding: '1rem' }}>
          <div style={{ fontSize: '4.5rem', marginBottom: '0.5rem', filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.2))' }}>
            {template.emoji || template.icon}
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>{template.title}</div>
          <div style={{ fontSize: '0.82rem', opacity: 0.9, marginTop: '4px' }}>
            {template.category} • {template.time}
          </div>
        </div>
      ),
    },
    {
      title: 'What Makes It Special',
      badge: 'Features',
      bg: 'linear-gradient(135deg, #2a2421 0%, #3d322b 100%)',
      content: (
        <div style={{ color: '#fff', padding: '1.2rem', textAlign: 'left', width: '100%' }}>
          <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#f3c7b2', fontWeight: 800, marginBottom: '0.5rem' }}>
            ✦ Highlights
          </div>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {template.features.map((feat, idx) => (
              <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.88rem' }}>
                <span style={{ color: '#f43f5e', fontSize: '1rem' }}>✨</span>
                <span>{feat}</span>
              </li>
            ))}
          </ul>
        </div>
      ),
    },
    {
      title: 'Photo Memories',
      badge: 'Photos',
      bg: 'linear-gradient(135deg, #a83d46 0%, #6e242b 100%)',
      content: (
        <div style={{ color: '#fff', padding: '1.2rem', textAlign: 'left', width: '100%' }}>
          <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#ffd5db', fontWeight: 800, marginBottom: '0.5rem' }}>
            📸 Memory Gallery
          </div>
          <div style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.35rem' }}>
            {template.photoRequirement?.recommended} Cherished Photos
          </div>
          <div style={{ fontSize: '0.82rem', opacity: 0.9, lineHeight: 1.5 }}>
            {template.photoRequirement?.tip || 'Add your favorite memories with heartfelt captions.'}
          </div>
        </div>
      ),
    },
  ];

  const handleScroll = () => {
    if (!carouselRef.current) return;
    const scrollLeft = carouselRef.current.scrollLeft;
    const width = carouselRef.current.offsetWidth;
    const nextIndex = Math.round(scrollLeft / width);
    if (nextIndex !== activeSlide && nextIndex >= 0 && nextIndex < slides.length) {
      setActiveSlide(nextIndex);
    }
  };

  const scrollToSlide = (index) => {
    if (!carouselRef.current) return;
    triggerHaptic('selection');
    carouselRef.current.scrollTo({
      left: index * carouselRef.current.offsetWidth,
      behavior: 'smooth',
    });
    setActiveSlide(index);
  };

  return (
    <div className="template-interactive-hero" style={{ marginBottom: '2rem' }}>
      {/* Mobile Hero Carousel (visible on small screens) */}
      <div className="template-mobile-carousel-wrap" style={{ display: 'none' }}>
        <div
          ref={carouselRef}
          onScroll={handleScroll}
          style={{
            display: 'flex',
            overflowX: 'auto',
            scrollSnapType: 'x mandatory',
            touchAction: 'pan-y',
            WebkitOverflowScrolling: 'touch',
            scrollbarWidth: 'none',
            borderRadius: '24px',
            boxShadow: '0 12px 36px rgba(47, 34, 21, 0.12)',
          }}
        >
          {slides.map((slide, i) => (
            <div
              key={i}
              style={{
                flex: '0 0 100%',
                minWidth: '100%',
                scrollSnapAlign: 'center',
                background: slide.bg,
                minHeight: '260px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                position: 'relative',
                borderRadius: '24px',
                overflow: 'hidden',
              }}
            >
              <span
                style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  background: 'rgba(0,0,0,0.3)',
                  backdropFilter: 'blur(8px)',
                  color: '#fff',
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  padding: '3px 9px',
                  borderRadius: '99px',
                  textTransform: 'uppercase',
                }}
              >
                {slide.badge}
              </span>
              {slide.content}
            </div>
          ))}
        </div>

        {/* Carousel Dots */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginTop: '10px' }}>
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => scrollToSlide(i)}
              aria-label={`Go to slide ${i + 1}`}
              style={{
                width: activeSlide === i ? '20px' : '6px',
                height: '6px',
                borderRadius: '99px',
                background: activeSlide === i ? '#a83d46' : '#d9c9b9',
                border: 'none',
                padding: 0,
                cursor: 'pointer',
                transition: 'all 0.25s ease',
              }}
            />
          ))}
        </div>
      </div>

      {/* Touch Chips */}
      <div
        className="template-touch-chips"
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.5rem',
          margin: '1.25rem 0',
        }}
      >
        {template.bestFor?.map((tag) => (
          <motion.button
            key={tag}
            type="button"
            whileTap={{ scale: 0.94 }}
            transition={springs.snappy}
            onClick={() => triggerHaptic('selection')}
            style={{
              minHeight: '38px',
              padding: '0.4rem 0.85rem',
              borderRadius: '999px',
              background: '#fff1f2',
              color: '#9f1239',
              border: '1px solid #fecdd3',
              fontSize: '0.82rem',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              cursor: 'pointer',
              touchAction: 'manipulation',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            <span>✨</span>
            <span>{tag}</span>
          </motion.button>
        ))}
        <motion.span
          whileTap={{ scale: 0.94 }}
          onClick={() => triggerHaptic('selection')}
          style={{
            minHeight: '38px',
            padding: '0.4rem 0.85rem',
            borderRadius: '999px',
            background: '#f8fafc',
            color: '#475569',
            border: '1px solid #e2e8f0',
            fontSize: '0.82rem',
            fontWeight: 700,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            cursor: 'default',
            touchAction: 'manipulation',
          }}
        >
          <span>⏱</span>
          <span>{template.time} setup</span>
        </motion.span>
      </div>

      {/* Sticky Bottom Action Bar on Mobile */}
      <div
        className="template-sticky-bottom-bar"
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 8900,
          background: 'rgba(247, 238, 228, 0.96)',
          backdropFilter: 'blur(16px) saturate(160%)',
          WebkitBackdropFilter: 'blur(16px) saturate(160%)',
          borderTop: '1px solid rgba(92, 72, 52, 0.12)',
          padding: '0.65rem 1rem calc(0.65rem + env(safe-area-inset-bottom, 0px))',
          display: 'none',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.75rem',
          boxShadow: '0 -8px 24px rgba(47, 34, 21, 0.08)',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
            <span style={{ fontSize: '1.25rem', fontWeight: 900, color: '#e11d48' }}>₹{activePrice}</span>
            {isAvailable && activeBasePrice > activePrice && (
              <span style={{ fontSize: '0.78rem', color: '#94a3b8', textDecoration: 'line-through' }}>₹{activeBasePrice}</span>
            )}
          </div>
          <span style={{ fontSize: '0.68rem', color: '#15803d', fontWeight: 700 }}>
            Instant WhatsApp Link
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, justifyContent: 'flex-end' }}>
          <PreviewDemoButton
            templateId={template.id}
            className="btn-secondary"
            style={{
              minHeight: '44px',
              padding: '0.5rem 0.85rem',
              fontSize: '0.82rem',
              borderRadius: '999px',
              fontWeight: 700,
              touchAction: 'manipulation',
            }}
          >
            👁️ Demo
          </PreviewDemoButton>

          {isAvailable ? (
            <Link
              href={`/create?template=${template.id}`}
              onClick={() => triggerHaptic('light')}
              className="btn-primary"
              style={{
                minHeight: '44px',
                padding: '0.5rem 1.1rem',
                fontSize: '0.85rem',
                fontWeight: 800,
                borderRadius: '999px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #f43f5e 0%, #be185d 100%)',
                color: '#fff',
                textDecoration: 'none',
                boxShadow: '0 3px 12px rgba(244, 63, 94, 0.3)',
                touchAction: 'manipulation',
              }}
            >
              ✨ Personalize
            </Link>
          ) : (
            <span
              style={{
                minHeight: '44px',
                padding: '0.5rem 1rem',
                fontSize: '0.82rem',
                borderRadius: '999px',
                background: '#f1f5f9',
                color: '#94a3b8',
                display: 'inline-flex',
                alignItems: 'center',
              }}
            >
              Unavailable
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
