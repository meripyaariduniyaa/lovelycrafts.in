'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import PreviewDemoButton from '@/components/PreviewDemoButton';

const ALL_CATEGORY = 'All experiences';

export default function TemplatesCatalog({ templates }) {
  const [activeCategory, setActiveCategory] = useState(ALL_CATEGORY);
  const [query, setQuery] = useState('');

  const categories = [ALL_CATEGORY, ...new Set(templates.map((template) => template.category).filter(Boolean))];
  const normalizedQuery = query.trim().toLowerCase();
  const visibleTemplates = useMemo(() => templates.filter((template) => {
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
  }), [activeCategory, normalizedQuery, templates]);

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
        <div className="template-filters" role="tablist" aria-label="Template categories">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              role="tab"
              aria-selected={activeCategory === category}
              className={`template-filter ${activeCategory === category ? 'template-filter--active' : ''}`}
              onClick={() => setActiveCategory(category)}
            >
              <span style={{ marginRight: '4px' }}>{categoryIcons[category] || '🎁'}</span>
              {category}
            </button>
          ))}
        </div>
        <label className="template-search">
          <span>Search templates</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Birthday, apology, romance, miles..."
          />
        </label>
      </div>

      {visibleTemplates.length > 0 ? (
        <div className="templates-grid">
          {visibleTemplates.map((template) => (
            <article key={template.id} className="template-card template-card--catalog">
              <div className="template-card-art" style={{ background: template.gradient }}>
                <span className="template-card-art-icon" aria-hidden="true">{template.emoji}</span>
                <span className="template-card-badge">{template.badge}</span>
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
                <div className="template-card-footer">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '1.2rem', fontWeight: 900, color: '#0f172a' }}>₹{template.price}</span>
                    <span style={{ fontSize: '0.78rem', color: '#94a3b8', textDecoration: 'line-through' }}>
                      ₹{template.basePrice}
                    </span>
                  </div>
                  <div className="template-card-actions" style={{ justifyContent: 'flex-end', gap: '0.5rem' }}>
                    <PreviewDemoButton
                      templateId={template.id}
                      className="btn-secondary"
                      style={{ padding: '0.55rem 0.85rem', fontSize: '0.8rem', borderRadius: '999px' }}
                    >
                      👁️ Preview
                    </PreviewDemoButton>
                    <Link
                      href={`/create?template=${template.id}`}
                      className="btn-primary template-create-link"
                      style={{ padding: '0.55rem 1rem', fontSize: '0.82rem', borderRadius: '999px', fontWeight: 800 }}
                    >
                      ✨ Craft This
                    </Link>
                  </div>
                </div>
              </div>
            </article>
          ))}
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
