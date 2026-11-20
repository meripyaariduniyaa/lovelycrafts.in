'use client';

import { useState, useMemo } from 'react';
import ToolCard from '@/components/tools/ToolCard';
import { TOOL_CATEGORIES } from '@/lib/tools';
import { triggerHaptic } from '@/lib/haptics';

export default function ToolsHubClient({ tools }) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTools = useMemo(() => {
    return tools.filter((tool) => {
      const matchesCategory = selectedCategory === 'all' || tool.category === selectedCategory;
      const matchesQuery =
        !searchQuery.trim() ||
        tool.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (tool.keywords && tool.keywords.some((k) => k.toLowerCase().includes(searchQuery.toLowerCase())));
      return matchesCategory && matchesQuery;
    });
  }, [tools, selectedCategory, searchQuery]);

  return (
    <div className="tools-hub-interactive">
      {/* Search & Category Filter */}
      <div className="tools-filter-bar">
        <div className="tools-search-wrap">
          <span className="tools-search-icon" aria-hidden="true">🔍</span>
          <input
            type="search"
            className="tools-search-input"
            placeholder="Search love calculators, countdowns, birthday wishes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search tools"
            style={{ fontSize: '16px' }}
          />
          {searchQuery && (
            <button
              type="button"
              className="tools-search-clear"
              onClick={() => {
                triggerHaptic('selection');
                setSearchQuery('');
              }}
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </div>

        <div className="tools-category-pills" role="tablist" aria-label="Tool Categories">
          <button
            type="button"
            role="tab"
            aria-selected={selectedCategory === 'all'}
            className={`tools-category-pill ${selectedCategory === 'all' ? 'active' : ''}`}
            onClick={() => {
              triggerHaptic('selection');
              setSelectedCategory('all');
            }}
          >
            ✨ All Tools ({tools.length})
          </button>
          {TOOL_CATEGORIES.map((cat) => {
            const count = tools.filter((t) => t.category === cat.id).length;
            return (
              <button
                key={cat.id}
                type="button"
                role="tab"
                aria-selected={selectedCategory === cat.id}
                className={`tools-category-pill ${selectedCategory === cat.id ? 'active' : ''}`}
                onClick={() => {
                  triggerHaptic('selection');
                  setSelectedCategory(cat.id);
                }}
              >
                <span>{cat.emoji}</span>
                <span>{cat.label}</span>
                <span className="tools-pill-count">{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tools Grid */}
      <div className="tools-grid-section">
        <div className="tools-grid-header">
          <p className="tools-grid-count">
            Showing {filteredTools.length} {filteredTools.length === 1 ? 'tool' : 'tools'}
            {selectedCategory !== 'all' && ` in ${TOOL_CATEGORIES.find((c) => c.id === selectedCategory)?.label}`}
            {searchQuery && ` matching "${searchQuery}"`}
          </p>
        </div>

        {filteredTools.length > 0 ? (
          <div className="tools-grid">
            {filteredTools.map((tool) => (
              <ToolCard key={tool.slug} tool={tool} />
            ))}
          </div>
        ) : (
          <div className="tools-empty-state">
            <span className="tools-empty-icon" aria-hidden="true">🔎</span>
            <h3>No tools found</h3>
            <p>Try clearing your search or picking another category.</p>
            <button
              type="button"
              className="tools-reset-btn"
              onClick={() => {
                setSelectedCategory('all');
                setSearchQuery('');
              }}
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

