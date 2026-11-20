'use client';

import Link from 'next/link';
import ShareButtons from './ShareButtons';
import { triggerHaptic } from '@/lib/haptics';

export default function ToolResult({ result, tool }) {
  if (!result) return null;

  const surpriseUrl = tool.giftCta?.href || '/templates';
  const surpriseText = tool.giftCta?.text || 'Turn this into a surprise';

  return (
    <div className="tool-result">
      <div className="tool-result-card" style={{ boxShadow: '0 8px 24px rgba(225, 29, 72, 0.08)' }}>
        {/* Animated percentage (for calculators) */}
        {typeof result.percentage === 'number' && (
          <div className="tool-result-percentage">
            <div className="tool-result-circle" style={{ '--pct': result.percentage }}>
              <span className="tool-result-pct-num">{result.percentage}%</span>
            </div>
          </div>
        )}

        {/* Title (e.g. names or label) */}
        {result.title && <h3 className="tool-result-title">{result.title}</h3>}

        {/* Main text output */}
        {result.text && <p className="tool-result-text">{result.text}</p>}

        {/* Detail lines (for calculators with breakdown) */}
        {result.details && result.details.length > 0 && (
          <ul className="tool-result-details">
            {result.details.map((d, i) => (
              <li key={i}>{d}</li>
            ))}
          </ul>
        )}

        {/* Multi-item list (for generators) */}
        {result.items && result.items.length > 0 && (
          <div className="tool-result-items">
            {result.items.map((item, i) => (
              <div key={i} className="tool-result-item">{item}</div>
            ))}
          </div>
        )}

        {/* Insight / fun message */}
        {result.insight && <p className="tool-result-insight">{result.insight}</p>}
      </div>

      <ShareButtons
        text={result.shareText || `${result.title || tool.title}: ${result.text || ''}`}
        toolTitle={tool.title}
        toolSlug={tool.slug}
      />

      {/* Prominent 'Turn this into a surprise' CTA */}
      <div style={{ marginTop: '10px' }}>
        <Link
          href={surpriseUrl}
          className="tool-gift-cta"
          onClick={() => triggerHaptic('medium')}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            background: 'linear-gradient(135deg, #e11d48 0%, #be123c 100%)',
            color: '#ffffff',
            textDecoration: 'none',
            padding: '16px 24px',
            borderRadius: '16px',
            fontSize: '1.05rem',
            fontWeight: 800,
            boxShadow: '0 8px 24px rgba(225, 29, 72, 0.3)',
            minHeight: '52px',
            touchAction: 'manipulation',
            transition: 'transform 0.15s ease',
          }}
        >
          <span className="tool-gift-cta-emoji" style={{ fontSize: '1.4rem' }}>🎁</span>
          <span>Turn this into a surprise</span>
          <span aria-hidden="true" style={{ fontSize: '1.1rem' }}>→</span>
        </Link>
        <div style={{ textAlign: 'center', marginTop: '6px', fontSize: '0.75rem', color: '#9ca3af' }}>
          Craft an interactive digital card with secret photos &amp; love notes
        </div>
      </div>
    </div>
  );
}

