'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import TemplateRenderer from '@/components/templates/TemplateRenderer';
import { getMockPreviewNote } from '@/lib/mockPreviewNotes';
import { templates } from '@/lib/templates';
import { emotionalTemplates } from '@/lib/emotionalTemplates';

export default function LiveTemplatePreviewModal({ templateId, onClose }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Lock body scroll when modal is active
  useEffect(() => {
    if (templateId) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow || 'unset';
      };
    }
  }, [templateId]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose?.();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!mounted || !templateId) return null;

  const allTemplates = [...templates, ...emotionalTemplates];
  const templateInfo = allTemplates.find((t) => t.id === templateId) || {
    id: templateId,
    title: 'Live Interactive Preview',
    icon: '✨',
  };

  const mockNote = getMockPreviewNote(templateId);

  const modalContent = (
    <div
      className="live-demo-modal-overlay"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 999999,
        background: 'rgba(247, 238, 228, 0.96)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        overflow: 'hidden',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose?.();
        }
      }}
    >
      {/* Top Floating Control Bar */}
      <div
        style={{
          width: '100%',
          background: 'rgba(247, 238, 228, 0.96)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.14)',
          padding: '0.75rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          zIndex: 1000000,
          boxShadow: '0 4px 24px rgba(0,0,0,0.5)',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
          <span style={{ fontSize: '1.75rem', flexShrink: 0 }}>{templateInfo.icon}</span>
          <div style={{ minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <h3 style={{ color: '#fff', fontSize: '1.05rem', fontWeight: 800, margin: 0, whiteSpace: 'nowrap' }}>
                {templateInfo.title}
              </h3>
              <span
                style={{
                  background: 'linear-gradient(135deg, #f43f5e, #be185d)',
                  color: '#fff',
                  fontSize: '0.65rem',
                  fontWeight: 800,
                  padding: '0.15rem 0.55rem',
                  borderRadius: '999px',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  whiteSpace: 'nowrap',
                }}
              >
                LIVE DEMO PREVIEW
              </span>
            </div>
            <p style={{ color: '#9ca3af', fontSize: '0.78rem', margin: '2px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              Interactive demo • Experience exactly what your recipient will see
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexShrink: 0 }}>
          <Link
            href={`/create?template=${templateId}`}
            className="btn-primary"
            style={{
              padding: '0.55rem 1.25rem',
              fontSize: '0.85rem',
              fontWeight: 800,
              borderRadius: '999px',
              background: 'linear-gradient(135deg, #f43f5e, #be185d)',
              boxShadow: '0 4px 14px rgba(244,63,94,0.4)',
              textDecoration: 'none',
              whiteSpace: 'nowrap',
            }}
          >
            ✨ Customize This
          </Link>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Live Demo"
            style={{
              background: 'rgba(255,255,255,0.12)',
              border: '1px solid rgba(255,255,255,0.25)',
              color: '#fff',
              padding: '0.55rem 1rem',
              borderRadius: '999px',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              transition: 'all 0.2s',
              whiteSpace: 'nowrap',
            }}
          >
            ✕ Close
          </button>
        </div>
      </div>

      {/* Main Interactive Screen Container */}
      <div
        style={{
          width: '100%',
          flex: 1,
          position: 'relative',
          overflowY: 'auto',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
          padding: '1.25rem 1rem 2.5rem',
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            onClose?.();
          }
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: '680px',
            position: 'relative',
            background: '#f8f3eb',
            borderRadius: '24px',
            overflow: 'hidden',
            boxShadow: '0 25px 60px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.1)',
            minHeight: '560px',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <TemplateRenderer note={mockNote} isPreview={true} />
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
