'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { springs } from '@/lib/motion';
import LiveTemplatePreviewModal from '@/components/LiveTemplatePreviewModal';

/**
 * PreviewDemoButton
 * 
 * Client button component that opens the Live Interactive Template Demo Modal.
 * Works inside both Server and Client components.
 */
export default function PreviewDemoButton({
  templateId,
  className = 'btn-secondary',
  style,
  children,
}) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <motion.button
        type="button"
        className={className}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.96 }}
        transition={springs.snappy}
        style={{
          cursor: 'pointer',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.4rem',
          ...style,
        }}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setShowModal(true);
        }}
      >
        {children || '👁️ Live Preview'}
      </motion.button>

      <AnimatePresence>
        {showModal && (
          <LiveTemplatePreviewModal
            key={`live-preview-modal-${templateId}`}
            templateId={templateId}
            onClose={() => setShowModal(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
