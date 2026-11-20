'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import { springs } from '@/lib/motion';
import TemplateRenderer from '@/components/templates/TemplateRenderer';
import { getMockPreviewNote } from '@/lib/mockPreviewNotes';
import { templates } from '@/lib/templates';
import { emotionalTemplates } from '@/lib/emotionalTemplates';
import { triggerHaptic } from '@/lib/haptics';

const MotionLink = motion.create(Link);

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

  if (!mounted) return null;

  const allTemplates = [...templates, ...emotionalTemplates];
  const templateInfo = allTemplates.find((t) => t.id === templateId) || {
    id: templateId,
    title: 'Live Interactive Preview',
    icon: '✨',
  };

  const mockNote = templateId ? getMockPreviewNote(templateId) : null;

  const modalContent = (
    <AnimatePresence>
      {Boolean(templateId) && (
        <motion.div
          key="live-demo-modal-overlay"
          className="live-demo-modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 999999,
            background: 'rgba(41, 37, 33, 0.72)',
            backdropFilter: 'blur(8px) saturate(140%)',
            WebkitBackdropFilter: 'blur(8px) saturate(140%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'flex-end',
            overflow: 'hidden',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              triggerHaptic('light');
              onClose?.();
            }
          }}
        >
          {/* Mobile Bottom Sheet / Desktop Modal */}
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 32, stiffness: 300 }}
            style={{
              width: '100%',
              maxWidth: '720px',
              height: '92dvh',
              maxHeight: '92dvh',
              display: 'flex',
              flexDirection: 'column',
              background: 'rgba(247, 238, 228, 0.98)',
              borderRadius: '20px 20px 0 0',
              overflow: 'hidden',
              boxShadow: '0 -16px 60px rgba(0,0,0,0.3)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drag Handle */}
            <div style={{ display: 'flex', justifyContent: 'center', padding: '0.65rem 0 0' }}>
              <div
                style={{ width: '36px', height: '4px', borderRadius: '99px', background: 'rgba(92, 72, 52, 0.3)', cursor: 'pointer' }}
                onClick={() => { triggerHaptic('light'); onClose?.(); }}
              />
            </div>

            {/* Top Control Bar */}
            <div
              style={{
                width: '100%',
                borderBottom: '1px solid rgba(92, 72, 52, 0.1)',
                padding: '0.6rem 1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '0.75rem',
                flexShrink: 0,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', minWidth: 0 }}>
                <span style={{ fontSize: '1.5rem', flexShrink: 0 }}>{templateInfo.icon}</span>
                <div style={{ minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <h3 style={{ color: '#292521', fontSize: '0.95rem', fontWeight: 800, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {templateInfo.title}
                    </h3>
                    <span
                      style={{
                        background: 'linear-gradient(135deg, #f43f5e, #be185d)',
                        color: '#fff',
                        fontSize: '0.6rem',
                        fontWeight: 800,
                        padding: '0.15rem 0.5rem',
                        borderRadius: '999px',
                        letterSpacing: '0.05em',
                        textTransform: 'uppercase',
                        whiteSpace: 'nowrap',
                        flexShrink: 0,
                      }}
                    >
                      LIVE DEMO
                    </span>
                  </div>
                  <p style={{ color: '#635d56', fontSize: '0.72rem', margin: '2px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    See exactly what your recipient will see
                  </p>
                </div>
              </div>

              {/* 44px close button */}
              <motion.button
                type="button"
                onClick={() => { triggerHaptic('light'); onClose?.(); }}
                aria-label="Close Live Demo"
                whileTap={{ scale: 0.92 }}
                transition={springs.snappy}
                style={{
                  width: '44px',
                  height: '44px',
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'rgba(92, 72, 52, 0.08)',
                  border: '1px solid rgba(92, 72, 52, 0.12)',
                  color: '#43332b',
                  borderRadius: '50%',
                  fontWeight: 700,
                  fontSize: '1rem',
                  cursor: 'pointer',
                  touchAction: 'manipulation',
                  WebkitTapHighlightColor: 'transparent',
                }}
              >
                ✕
              </motion.button>
            </div>

            {/* Main Interactive Preview Content */}
            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                WebkitOverflowScrolling: 'touch',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'flex-start',
                padding: '1rem 0.75rem 0.5rem',
              }}
            >
              <div
                style={{
                  width: '100%',
                  maxWidth: '600px',
                  position: 'relative',
                  background: '#f8f3eb',
                  borderRadius: '20px',
                  overflow: 'hidden',
                  boxShadow: '0 12px 32px rgba(0,0,0,0.12)',
                  minHeight: '480px',
                }}
              >
                {mockNote && <TemplateRenderer note={mockNote} isPreview={true} />}
              </div>
            </div>

            {/* Sticky Bottom CTA */}
            <div
              style={{
                flexShrink: 0,
                borderTop: '1px solid rgba(92, 72, 52, 0.1)',
                padding: `0.85rem 1rem calc(env(safe-area-inset-bottom, 0px) + 0.85rem)`,
                background: 'rgba(247, 238, 228, 0.98)',
                display: 'flex',
                gap: '0.65rem',
                alignItems: 'center',
              }}
            >
              <MotionLink
                href={`/create?template=${templateId}`}
                className="btn-primary"
                whileTap={{ scale: 0.96 }}
                transition={springs.snappy}
                onClick={() => triggerHaptic('light')}
                style={{
                  flex: 1,
                  minHeight: '52px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0.75rem 1.25rem',
                  fontSize: '0.95rem',
                  fontWeight: 800,
                  borderRadius: '14px',
                  background: 'linear-gradient(135deg, #f43f5e, #be185d)',
                  boxShadow: '0 4px 14px rgba(244,63,94,0.35)',
                  textDecoration: 'none',
                  touchAction: 'manipulation',
                }}
              >
                ✨ Personalize This Gift
              </MotionLink>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
}
