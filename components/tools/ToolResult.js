'use client';

import Link from 'next/link';
import ShareButtons from './ShareButtons';

export default function ToolResult({ result, tool }) {
  if (!result) return null;

  return (
    <div className="tool-result">
      <div className="tool-result-card">
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

      {tool.giftCta && (
        <Link href={tool.giftCta.href} className="tool-gift-cta">
          <span className="tool-gift-cta-emoji">🎁</span>
          <span>{tool.giftCta.text}</span>
          <span aria-hidden="true">→</span>
        </Link>
      )}
    </div>
  );
}

