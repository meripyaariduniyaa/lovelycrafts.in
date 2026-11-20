'use client';

import { useMemo, useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { springs } from '@/lib/motion';
import PreviewDemoButton from '@/components/PreviewDemoButton';
import { triggerHaptic } from '@/lib/haptics';

const ALL_CATEGORY = 'All experiences';

const SORT_OPTIONS = [
  { value: 'featured', label: 'Featured' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'name', label: 'Name: A to Z' },
];

export default function TemplatesCatalog({ templates }) {
  const pathname = usePathname();
  const [activeCategory, setActiveCategory] = useState(ALL_CATEGORY);
  const [query, setQuery] = useState('');
  const [sortBy, setSortBy] = useState('featured');
  const [urlReady, setUrlReady] = useState(false);
  const [dynamicPricing, setDynamicPricing] = useState({});
  const [showSortSheet, setShowSortSheet] = useState(false);

  // Fetch live pricing from API
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

  const categories = useMemo(
    () => [ALL_CATEGORY, ...new Set(templates.map((template) => template.category).filter(Boolean))],
    [templates],
  );
  const categoryKey = categories.join('|');

  // Read shareable search/filter/sort state after hydration to keep this page statically renderable.
  useEffect(() => {
    const readUrlState = () => {
      const params = new URLSearchParams(window.location.search);
      const requestedCategory = params.get('occasion');
      const requestedSort = params.get('sort');
      setQuery(params.get('q') || '');
      setActiveCategory(categories.includes(requestedCategory) ? requestedCategory : ALL_CATEGORY);
      setSortBy(['featured', 'price-asc', 'price-desc', 'name'].includes(requestedSort) ? requestedSort : 'featured');
    };

    readUrlState();
    setUrlReady(true);
    window.addEventListener('popstate', readUrlState);
    return () => window.removeEventListener('popstate', readUrlState);
  }, [categoryKey]);

  useEffect(() => {
    if (!urlReady) return;

    const params = new URLSearchParams(window.location.search);
    const normalizedQuery = query.trim();
    if (normalizedQuery) params.set('q', normalizedQuery);
    else params.delete('q');
    if (activeCategory !== ALL_CATEGORY) params.set('occasion', activeCategory);
    else params.delete('occasion');
    if (sortBy !== 'featured') params.set('sort', sortBy);
    else params.delete('sort');

    const search = params.toString();
    const nextUrl = `${pathname}${search ? `?${search}` : ''}${window.location.hash}`;
    window.history.replaceState(window.history.state, '', nextUrl);
  }, [activeCategory, pathname, query, sortBy, urlReady]);
  const normalizedQuery = query.trim().toLowerCase();
  
  const visibleTemplates = useMemo(() => {
    const filtered = templates.filter((template) => {
      const matchesCategory = activeCategory === ALL_CATEGORY || template.category === activeCategory;
      const searchableText = [
        template.title,
        template.description,
        template.category,
        template.audience,
        ...(template.bestFor || []),
        ...(template.features || []),
      ].join(' ').toLowerCase();
      return matchesCategory && (!normalizedQuery || searchableText.includes(normalizedQuery));
    });

    if (sortBy === 'name') return filtered.sort((a, b) => a.title.localeCompare(b.title));
    if (sortBy === 'price-asc' || sortBy === 'price-desc') {
      const direction = sortBy === 'price-asc' ? 1 : -1;
      return filtered.sort((a, b) => {
        const priceA = dynamicPricing[a.id]?.price ?? a.price ?? 0;
        const priceB = dynamicPricing[b.id]?.price ?? b.price ?? 0;
        return (priceA - priceB) * direction || a.title.localeCompare(b.title);
      });
    }
    return filtered;
  }, [activeCategory, dynamicPricing, normalizedQuery, sortBy, templates]);

  const categoryIcons = {
    'All experiences': '✨',
    'Romance': '💖',
    'Celebration': '🎂',
    'Heartfelt': '🥺',
    'Long Distance': '🌌',
  };

  return (
    <div className="templates-catalog">
      {/* Mobile Sort Bottom Sheet */}
      <AnimatePresence>
        {showSortSheet && (
          <>
            <motion.div
              key="sort-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => { triggerHaptic('light'); setShowSortSheet(false); }}
              style={{
                position: 'fixed',
                inset: 0,
                zIndex: 9000,
                background: 'rgba(41, 37, 33, 0.45)',
                backdropFilter: 'blur(4px)',
                WebkitBackdropFilter: 'blur(4px)',
              }}
            />
            <motion.div
              key="sort-sheet"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 32, stiffness: 320 }}
              style={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                zIndex: 9001,
                background: '#fffdf9',
                borderRadius: '20px 20px 0 0',
                boxShadow: '0 -16px 48px rgba(47, 34, 21, 0.15)',
                padding: '0 1.25rem calc(env(safe-area-inset-bottom, 0px) + 1.5rem)',
              }}
            >
              {/* Handle */}
              <div style={{ display: 'flex', justifyContent: 'center', padding: '0.75rem 0 1rem' }}>
                <div style={{ width: '36px', height: '4px', borderRadius: '99px', background: '#d9c9b9' }} />
              </div>
              <div style={{ marginBottom: '1rem', color: '#292521', fontWeight: 800, fontSize: '1rem' }}>Sort by</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {SORT_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      triggerHaptic('selection');
                      setSortBy(option.value);
                      setShowSortSheet(false);
                    }}
                    style={{
                      minHeight: '52px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.75rem 1rem',
                      borderRadius: '12px',
                      border: sortBy === option.value ? '2px solid #a83d46' : '1px solid #e2d6c8',
                      background: sortBy === option.value ? '#f7eee4' : '#fffdf9',
                      color: sortBy === option.value ? '#a83d46' : '#43332b',
                      fontWeight: sortBy === option.value ? 800 : 600,
                      fontSize: '0.95rem',
                      cursor: 'pointer',
                      touchAction: 'manipulation',
                      WebkitTapHighlightColor: 'transparent',
                      textAlign: 'left',
                    }}
                  >
                    <span>{option.label}</span>
                    {sortBy === option.value && <span style={{ fontSize: '1rem' }}>✓</span>}
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="templates-toolbar" aria-label="Find a template">
        {/* Mobile Search (16px min-font to prevent iOS zoom) */}
        <label className="template-search" style={{ width: '100%' }}>
          <span className="sr-only">Search templates</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Birthday, apology, romance, miles..."
            aria-label="Search gifts by name, occasion, or feature"
            style={{ fontSize: '16px' }}
          />
        </label>

        {/* Filter Chips — horizontal scroll on mobile */}
        <div
          className="template-filters"
          role="group"
          aria-label="Filter by occasion"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {categories.map((category) => {
            const isSelected = activeCategory === category;
            return (
              <motion.button
                key={category}
                type="button"
                aria-pressed={isSelected}
                className={`template-filter ${isSelected ? 'template-filter--active' : ''}`}
                onClick={() => {
                  triggerHaptic('selection');
                  setActiveCategory(category);
                }}
                whileTap={{ scale: 0.96 }}
                transition={springs.snappy}
                style={{
                  position: 'relative',
                  background: isSelected ? 'transparent' : undefined,
                  borderColor: isSelected ? 'transparent' : undefined,
                  minHeight: '44px',
                  touchAction: 'manipulation',
                  WebkitTapHighlightColor: 'transparent',
                }}
              >
                {isSelected && (
                  <motion.div
                    layoutId="categoryFilterIndicator"
                    style={{
                      position: 'absolute',
                      inset: 0,
                      borderRadius: '999px',
                      background: '#f7eee4',
                      border: '1px solid #3b0f1b',
                      zIndex: 0,
                    }}
                    transition={springs.smooth}
                  />
                )}
                <span style={{ position: 'relative', zIndex: 1, display: 'inline-flex', alignItems: 'center' }}>
                  <span style={{ marginRight: '4px' }}>{categoryIcons[category] || '🎁'}</span>
                  {category}
                </span>
              </motion.button>
            );
          })}
        </div>

        {/* Sort control — desktop select / mobile "Sort" button triggering bottom sheet */}
        <div className="template-controls" style={{ marginTop: '0.5rem' }}>
          <div style={{ flex: 1 }} />
          {/* Mobile Sort Trigger */}
          <button
            type="button"
            className="template-sort-mobile-trigger"
            onClick={() => { triggerHaptic('light'); setShowSortSheet(true); }}
            aria-label="Sort templates"
            style={{
              display: 'none',
              minHeight: '44px',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.5rem 1rem',
              border: '1px solid #d9c9b9',
              borderRadius: '999px',
              background: '#fffdf9',
              color: '#43332b',
              fontWeight: 700,
              fontSize: '0.82rem',
              cursor: 'pointer',
              touchAction: 'manipulation',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            <span>⇅</span>
            <span>Sort: {SORT_OPTIONS.find(o => o.value === sortBy)?.label}</span>
          </button>
          {/* Desktop Sort Select */}
          <label className="template-sort template-sort-desktop">
            <span>Sort</span>
            <select value={sortBy} onChange={(event) => setSortBy(event.target.value)} aria-label="Sort gifts">
              {SORT_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <p className="template-results-count" aria-live="polite">
        {visibleTemplates.length} {visibleTemplates.length === 1 ? 'experience' : 'experiences'}
        {activeCategory !== ALL_CATEGORY ? ` for ${activeCategory.toLowerCase()}` : ''}
      </p>

      {visibleTemplates.length > 0 ? (
        <div className="templates-grid">
          {visibleTemplates.map((template) => {
            const pricing = dynamicPricing[template.id] || {};
            const activePrice = pricing.price ?? template.price ?? 199;
            const activeBasePrice = pricing.basePrice ?? template.basePrice ?? 499;
            const activeBadge = pricing.badge || template.badge;
            const isAvailable = pricing.enabled !== false;

            return (
              <motion.article
                key={template.id}
                layout
                transition={springs.smooth}
                className="template-card template-card--catalog"
              >
                <div className="template-card-art" style={{ background: template.gradient }}>
                  <span className="template-card-art-icon" aria-hidden="true">{template.emoji}</span>
                  <span className="template-card-badge">{activeBadge}</span>
                  <span className="template-card-art-label">Interactive digital experience</span>
                </div>

                <div className="template-card-body">
                  <div className="template-card-heading">
                    <div>
                      <p className="template-card-category">{template.category} · {template.audience}</p>
                      <h2>{template.title}</h2>
                    </div>
                    <span className="template-card-time">{template.time}</span>
                  </div>
                  <p className="template-desc">{template.description}</p>
                  <ul className="template-feature-list">
                    {template.features.map((feature) => <li key={feature}>{feature}</li>)}
                  </ul>
                  <div className="template-card-footer" style={{ borderTop: '1px solid #f1f5f9', paddingTop: '0.85rem', marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', padding: '0 4px' }}>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                        <span style={{ fontSize: '1.25rem', fontWeight: 900, color: '#e11d48' }}>₹{activePrice}</span>
                        {isAvailable && activeBasePrice > activePrice && (
                          <span style={{ fontSize: '0.82rem', color: '#94a3b8', textDecoration: 'line-through' }}>₹{activeBasePrice}</span>
                        )}
                      </div>
                      <span style={{ fontSize: '0.72rem', color: isAvailable ? '#43332b' : '#f7eee4', fontWeight: 700, background: isAvailable ? '#ecfdf5' : '#fff7ed', padding: '2px 8px', borderRadius: '99px' }}>
                        {isAvailable ? 'One-Time • Instant Access' : 'Currently unavailable'}
                      </span>
                    </div>
                    {/* Distinct Preview + Personalize actions, mobile 44px minimum touch */}
                    <div className="template-card-actions" style={{ width: '100%', display: 'flex', justifyContent: 'space-between', gap: '0.5rem' }}>
                      <PreviewDemoButton
                        templateId={template.id}
                        className="btn-secondary"
                        onTrigger={() => triggerHaptic('light')}
                        style={{ flex: 1, minHeight: '44px', textAlign: 'center', padding: '0.6rem 0.85rem', fontSize: '0.82rem', borderRadius: '999px', fontWeight: 700, touchAction: 'manipulation' }}
                      >
                        👁️ Preview
                      </PreviewDemoButton>
                      {isAvailable ? (
                        <Link
                          href={`/create?template=${template.id}`}
                          data-analytics-event="start_gift_creation"
                          className="btn-primary template-create-link"
                          onClick={() => triggerHaptic('light')}
                          style={{ flex: 1, minHeight: '44px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0.6rem 1rem', fontSize: '0.84rem', borderRadius: '999px', fontWeight: 800, touchAction: 'manipulation' }}
                        >
                          ✨ Personalize
                        </Link>
                      ) : (
                        <span className="template-create-link" aria-disabled="true" style={{ flex: 1, minHeight: '44px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0.6rem 1rem', fontSize: '0.84rem', borderRadius: '999px', fontWeight: 700 }}>
                          Not available right now
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>
      ) : (
        <div className="templates-empty-state">
          <span aria-hidden="true">🔎</span>
          <h2>No experiences found</h2>
          <p>Try another occasion or clear your search.</p>
          <button type="button" className="btn-secondary" onClick={() => { setQuery(''); setActiveCategory(ALL_CATEGORY); }}>
            Show all templates
          </button>
        </div>
      )}
    </div>
  );
}
