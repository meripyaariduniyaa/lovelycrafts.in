'use client';

import Link from 'next/link';
import { getCategoryById } from '@/lib/tools';
import { triggerHaptic } from '@/lib/haptics';

export default function ToolCard({ tool }) {
  const category = getCategoryById(tool.category);

  return (
    <Link
      href={`/tools/${tool.slug}`}
      className="tool-card"
      onClick={() => triggerHaptic('selection')}
      style={{ touchAction: 'manipulation' }}
    >
      <div className="tool-card-badge" style={{ background: `${category?.color || '#64748b'}18`, color: category?.color || '#64748b' }}>
        {category?.label || 'Tool'}
      </div>
      <div className="tool-card-emoji">{tool.emoji}</div>
      <h3 className="tool-card-title">{tool.title}</h3>
      <p className="tool-card-desc">{tool.description}</p>
      <span className="tool-card-cta">
        Try it now <span aria-hidden="true">→</span>
      </span>
    </Link>
  );
}

