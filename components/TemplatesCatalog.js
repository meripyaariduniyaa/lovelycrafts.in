'use client';

import { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import PreviewDemoButton from '@/components/PreviewDemoButton';

const ALL_CATEGORY = 'All experiences';

export default function TemplatesCatalog({ templates }) {
  const pathname = usePathname();
  const [activeCategory, setActiveCategory] = useState(ALL_CATEGORY);
  const [query, setQuery] = useState('');
  const [sortBy, setSortBy] = useState('featured');
  const [urlReady, setUrlReady] = useState(false);
  const [dynamicPricing, setDynamicPricing] = useState({});

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
      <div className="templates-toolbar" aria-label="Find a template">
        <div className="template-filters" role="group" aria-label="Filter by occasion">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              aria-pressed={activeCategory === category}
              className={`template-filter ${activeCategory === category ? 'template-filter--active' : ''}`}
              onClick={() => setActiveCategory(category)}
            >
              <span style={{ marginRight: '4px' }}>{categoryIcons[category] || '🎁'}</span>
              {category}
            </button>
          ))}
        </div>
        <div className="template-controls">
          <label className="template-search">
            <span>Search templates</span>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Birthday, apology, romance, miles..."
              aria-label="Search gifts by name, occasion, or feature"
            />
          </label>
          <label className="template-sort">
            <span>Sort</span>
            <select value={sortBy} onChange={(event) => setSortBy(event.target.value)} aria-label="Sort gifts">
              <option value="featured">Featured</option>
              <option value="price-asc">Price: low to high</option>
              <option value="price-desc">Price: high to low</option>
              <option value="name">Name: A to Z</option>
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
              <article key={template.id} className="template-card template-card--catalog">
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
                    <div className="template-card-actions" style={{ width: '100%', display: 'flex', justifyContent: 'space-between', gap: '0.5rem' }}>
                      <PreviewDemoButton
                        templateId={template.id}
                        className="btn-secondary"
                        style={{ flex: 1, textAlign: 'center', padding: '0.6rem 0.85rem', fontSize: '0.82rem', borderRadius: '999px', fontWeight: 700 }}
                      >
                        👁️ Preview Demo
                      </PreviewDemoButton>
                      {isAvailable ? (
                        <Link
                          href={`/create?template=${template.id}`}
                          data-analytics-event="start_gift_creation"
                          className="btn-primary template-create-link"
                          style={{ flex: 1, textAlign: 'center', padding: '0.6rem 1rem', fontSize: '0.84rem', borderRadius: '999px', fontWeight: 800 }}
                        >
                          ✨ Craft This ➔
                        </Link>
                      ) : (
                        <span className="template-create-link" aria-disabled="true" style={{ flex: 1, textAlign: 'center', padding: '0.6rem 1rem', fontSize: '0.84rem', borderRadius: '999px', fontWeight: 700 }}>
                          Not available right now
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </article>
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
