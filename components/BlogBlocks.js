'use client';

import React from 'react';
import Link from 'next/link';

export default function BlogBlocks({ blocks = [] }) {
  if (!blocks || !Array.isArray(blocks) || blocks.length === 0) {
    return null;
  }

  return (
    <div className="blog-article-content" style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', fontSize: '1.1rem', lineHeight: '1.8', color: '#334155' }}>
      {blocks.map((block, index) => {
        const key = block.id || `block-${index}`;

        switch (block.type) {
          case 'heading': {
            const level = Number(block.level) || 2;
            const content = block.content || '';
            const headingStyle = {
              color: '#0f172a',
              fontWeight: 800,
              letterSpacing: '-0.02em',
              margin: '1.5rem 0 0.5rem',
              lineHeight: 1.3,
            };

            if (level === 2) {
              return (
                <h2 key={key} style={{ ...headingStyle, fontSize: '1.75rem', borderBottom: '2px solid #ffe4e6', paddingBottom: '0.5rem' }}>
                  {content}
                </h2>
              );
            }
            if (level === 3) {
              return (
                <h3 key={key} style={{ ...headingStyle, fontSize: '1.4rem' }}>
                  {content}
                </h3>
              );
            }
            return (
              <h4 key={key} style={{ ...headingStyle, fontSize: '1.15rem', color: '#475569' }}>
                {content}
              </h4>
            );
          }

          case 'paragraph': {
            const content = block.content || '';
            // Split by double line breaks if any
            const paragraphs = content.split(/\n\n+/);
            return (
              <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {paragraphs.map((pText, pIdx) => (
                  <p key={pIdx} style={{ margin: 0, whiteSpace: 'pre-line' }}>
                    {pText}
                  </p>
                ))}
              </div>
            );
          }

          case 'image': {
            if (!block.url) return null;
            return (
              <figure key={key} style={{ margin: '1rem 0', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ width: '100%', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 8px 30px rgba(0,0,0,0.08)', background: '#f8fafc' }}>
                  <img
                    src={block.url}
                    alt={block.caption || block.alt || 'Blog illustration'}
                    style={{ width: '100%', height: 'auto', maxHeight: '550px', objectFit: 'cover', display: 'block' }}
                    loading="lazy"
                  />
                </div>
                {block.caption && (
                  <figcaption style={{ marginTop: '0.6rem', fontSize: '0.88rem', color: '#64748b', fontStyle: 'italic', textAlign: 'center' }}>
                    {block.caption}
                  </figcaption>
                )}
              </figure>
            );
          }

          case 'quote': {
            return (
              <blockquote
                key={key}
                style={{
                  margin: '1.5rem 0',
                  padding: '1.5rem 2rem',
                  background: 'linear-gradient(135deg, #fff1f2 0%, #fdf2f8 100%)',
                  borderLeft: '4px solid #f43f5e',
                  borderRadius: '0 16px 16px 0',
                  color: '#881337',
                  fontStyle: 'italic',
                  fontSize: '1.2rem',
                  lineHeight: '1.7',
                }}
              >
                <div style={{ fontSize: '1.8rem', lineHeight: 1, marginBottom: '0.5rem', opacity: 0.6 }}>“</div>
                <p style={{ margin: 0, fontWeight: 500 }}>{block.content}</p>
                {block.attribution && (
                  <footer style={{ marginTop: '0.75rem', fontSize: '0.9rem', fontWeight: 700, fontStyle: 'normal', color: '#be123c', textAlign: 'right' }}>
                    — {block.attribution}
                  </footer>
                )}
              </blockquote>
            );
          }

          case 'list': {
            const items = Array.isArray(block.items) ? block.items : [];
            if (items.length === 0) return null;

            if (block.ordered) {
              return (
                <ol key={key} style={{ margin: '0.5rem 0 0.5rem 1.5rem', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  {items.map((item, i) => (
                    <li key={i} style={{ paddingLeft: '0.4rem' }}>
                      {typeof item === 'string' ? item : item?.text || ''}
                    </li>
                  ))}
                </ol>
              );
            }

            return (
              <ul key={key} style={{ margin: '0.5rem 0 0.5rem 1.5rem', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.6rem', listStyleType: 'disc' }}>
                {items.map((item, i) => (
                  <li key={i} style={{ paddingLeft: '0.4rem' }}>
                    {typeof item === 'string' ? item : item?.text || ''}
                  </li>
                ))}
              </ul>
            );
          }

          case 'callout': {
            const type = block.calloutType || 'heart';
            const colors = {
              heart: { bg: '#fff1f2', border: '#fecdd3', text: '#9f1239', icon: '💖' },
              tip: { bg: '#f0fdf4', border: '#bbf7d0', text: '#166534', icon: '💡' },
              info: { bg: '#f0f9ff', border: '#bae6fd', text: '#075985', icon: 'ℹ️' },
              warning: { bg: '#fffbeb', border: '#fde68a', text: '#92400e', icon: '⚠️' },
            };
            const theme = colors[type] || colors.heart;

            return (
              <div
                key={key}
                style={{
                  margin: '1.25rem 0',
                  padding: '1.25rem 1.5rem',
                  background: theme.bg,
                  border: `1.5px solid ${theme.border}`,
                  borderRadius: '14px',
                  color: theme.text,
                  display: 'flex',
                  gap: '14px',
                  alignItems: 'flex-start',
                }}
              >
                <span style={{ fontSize: '1.4rem', lineHeight: 1 }}>{theme.icon}</span>
                <div style={{ flex: 1 }}>
                  {block.title && <div style={{ fontWeight: 800, fontSize: '1rem', marginBottom: '4px' }}>{block.title}</div>}
                  <div style={{ fontSize: '0.98rem', lineHeight: 1.6, whiteSpace: 'pre-line' }}>{block.content}</div>
                </div>
              </div>
            );
          }

          case 'cta': {
            return (
              <div
                key={key}
                style={{
                  margin: '2rem 0',
                  padding: '2rem',
                  background: 'linear-gradient(135deg, #fff1f2 0%, #ffe4e6 50%, #fdf2f8 100%)',
                  border: '2px solid #fecdd3',
                  borderRadius: '20px',
                  textAlign: 'center',
                  boxShadow: '0 10px 25px rgba(244,63,94,0.08)',
                }}
              >
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🎁✨</div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#881337', margin: '0 0 0.5rem' }}>
                  {block.title || 'Make Someone Smile Today'}
                </h3>
                <p style={{ color: '#9f1239', fontSize: '0.98rem', margin: '0 0 1.25rem', maxWidth: '500px', marginLeft: 'auto', marginRight: 'auto' }}>
                  {block.content || 'Craft a private, interactive digital experience with photos, music, and your heartfelt feelings in 2 minutes.'}
                </p>
                <Link
                  href={block.link || '/templates'}
                  style={{
                    background: 'linear-gradient(135deg, #e11d48, #f43f5e)',
                    color: '#fff',
                    padding: '0.85rem 2rem',
                    borderRadius: '12px',
                    fontWeight: 800,
                    fontSize: '1rem',
                    textDecoration: 'none',
                    display: 'inline-block',
                    boxShadow: '0 4px 15px rgba(225,29,72,0.3)',
                  }}
                >
                  {block.buttonText || 'Craft a Surprise Now →'}
                </Link>
              </div>
            );
          }

          case 'code': {
            return (
              <div key={key} style={{ margin: '1.25rem 0', background: '#f8f3eb', color: '#e2e8f0', borderRadius: '12px', overflow: 'hidden', fontSize: '0.9rem' }}>
                {block.language && (
                  <div style={{ background: '#f8f3eb', padding: '6px 16px', fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', borderBottom: '1px solid #f8f3eb' }}>
                    {block.language}
                  </div>
                )}
                <pre style={{ margin: 0, padding: '16px', overflowX: 'auto', fontFamily: 'monospace', lineHeight: 1.5 }}>
                  <code>{block.content}</code>
                </pre>
              </div>
            );
          }

          case 'divider': {
            return (
              <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '2rem 0', color: '#fda4af' }}>
                <div style={{ flex: 1, height: '1px', background: '#fecdd3' }} />
                <span style={{ padding: '0 16px', fontSize: '1.1rem' }}>❤️</span>
                <div style={{ flex: 1, height: '1px', background: '#fecdd3' }} />
              </div>
            );
          }

          default: {
            if (block.content) {
              return (
                <p key={key} style={{ margin: 0 }}>
                  {block.content}
                </p>
              );
            }
            return null;
          }
        }
      })}
    </div>
  );
}
