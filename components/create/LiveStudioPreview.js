'use client';

import React, { useMemo } from 'react';
import TemplateRenderer from '@/components/templates/TemplateRenderer';

/**
 * LiveStudioPreview
 * 
 * Sleek, high-fidelity smartphone mockup component rendering a real-time reactive
 * view-only preview of the customized gift experience in LovelyCrafts Studio.
 * 
 * @param {Object} props
 * @param {Object} props.template - The active template configuration object
 * @param {Object} props.form - Current state of the studio creation form
 * @param {string} [props.currentStepId] - Current active wizard step id
 */
export default function LiveStudioPreview({ template, form = {}, currentStepId }) {
  // Construct reactive note object reflecting studio form state in real time
  const liveNote = useMemo(() => {
    const templateId = template?.id || 'proposal';
    const recipientName = form?.recipientName?.trim() || 'Your Love';
    const customMessage = form?.letter?.trim() || 'Your heartfelt words will appear here...';
    const imageUrls = Array.isArray(form?.images) && form.images.length > 0 ? form.images : [];

    return {
      id: 'studio-live-preview',
      template: templateId,
      recipient_name: recipientName,
      custom_message: customMessage,
      image_urls: imageUrls,
      custom_details: {
        sender_name: form?.senderName || '',
        relationship_type: form?.relationshipType || '',
        quotation: form?.quotation || '',
        turning_age: form?.turningAge || '',
        birthday_date: form?.birthdayDate || '',
        cake_type: form?.cakeType || 'chocolate',
        balloon_messages: form?.balloonMessages || ['', '', '', '', ''],
        anniversary_date: form?.anniversaryDate || '',
        first_met_date: form?.firstMetDate || '',
        journey: form?.journey || [],
        reasons: form?.reasons || [],
        what_happened_type: form?.whatHappenedType || '',
        origin_city: form?.originCity || '',
        destination_city: form?.destinationCity || '',
        distance_km: form?.distanceKm || '',
        cassettes: form?.cassettes || [],
        letter: form?.letter || customMessage,
        passcode: form?.passcode || '',
      },
    };
  }, [template, form]);

  return (
    <div
      className="live-studio-preview-wrapper"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        width: '100%',
        maxWidth: '100%',
        boxSizing: 'border-box',
        userSelect: 'none',
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* Top Status & Live Indicator */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          maxWidth: 'min(100%, 330px)',
          marginBottom: '8px',
          padding: '0 4px',
          boxSizing: 'border-box',
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 10px',
            borderRadius: '999px',
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            color: '#065f46',
            fontSize: '0.75rem',
            fontWeight: 700,
            letterSpacing: '0.02em',
            flexShrink: 0,
            touchAction: 'manipulation',
          }}
        >
          <span
            style={{
              display: 'inline-block',
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#10b981',
              boxShadow: '0 0 6px rgba(16, 185, 129, 0.6)',
            }}
          />
          <span>Live Preview</span>
        </div>

        {template?.title && (
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 600,
              color: '#64748b',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              maxWidth: '150px',
              minWidth: 0,
              flexShrink: 1,
              textAlign: 'right',
            }}
          >
            {template.title}
          </span>
        )}
      </div>

      {/* Realistic Smartphone Mockup Frame */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: 'min(100%, 330px)',
          borderRadius: '38px',
          padding: '10px',
          background: 'linear-gradient(180deg, #262626 0%, #171717 50%, #0a0a0a 100%)',
          boxShadow: '0 25px 60px -15px rgba(28, 25, 23, 0.45), 0 0 0 1px rgba(0, 0, 0, 0.12), inset 0 1px 2px rgba(255, 255, 255, 0.2)',
          boxSizing: 'border-box',
          touchAction: 'pan-y',
        }}
      >
        {/* Subtle Outer Bezel Edge */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            borderRadius: '28px',
            overflow: 'hidden',
            background: '#f8f3eb',
            border: '1px solid rgba(0, 0, 0, 0.15)',
            boxSizing: 'border-box',
          }}
        >
          {/* Dynamic Island / Top Camera Notch */}
          <div
            style={{
              position: 'absolute',
              top: '10px',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 30,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'none',
            }}
          >
            <div
              style={{
                height: '20px',
                width: '88px',
                background: '#000000',
                borderRadius: '999px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                paddingRight: '8px',
                gap: '6px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.4)',
              }}
            >
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#1c1917', border: '1px solid #292524' }} />
              <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#172554', border: '1px solid #1e3a8a' }} />
            </div>
          </div>

          {/* Screen Viewport Container (Responsive Height clamp(420px, 65vh, 580px), View-Only Template Content) */}
          <div
            style={{
              width: '100%',
              height: 'clamp(420px, 65vh, 580px)',
              overflow: 'hidden',
              position: 'relative',
              background: '#f8f3eb',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-start',
              contain: 'paint layout',
              WebkitFontSmoothing: 'antialiased',
              boxSizing: 'border-box',
            }}
          >
            {/* View-Only Template Content Wrapper with pointer-events: none */}
            <div
              style={{
                width: '100%',
                height: '100%',
                position: 'relative',
                pointerEvents: 'none',
                userSelect: 'none',
                overflow: 'hidden',
              }}
            >
              <TemplateRenderer note={liveNote} isPreview={true} />
            </div>

            {/* Bottom iOS Home Indicator Bar */}
            <div
              style={{
                position: 'absolute',
                bottom: '6px',
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 30,
                pointerEvents: 'none',
              }}
            >
              <div style={{ width: '110px', height: '4px', background: 'rgba(0, 0, 0, 0.25)', borderRadius: '999px' }} />
            </div>
          </div>
        </div>

        {/* Side Button Accents */}
        <div style={{ position: 'absolute', left: '-3px', top: '96px', width: '3px', height: '36px', background: 'rgba(68, 64, 60, 0.8)', borderTopLeftRadius: '2px', borderBottomLeftRadius: '2px' }} />
        <div style={{ position: 'absolute', left: '-3px', top: '144px', width: '3px', height: '36px', background: 'rgba(68, 64, 60, 0.8)', borderTopLeftRadius: '2px', borderBottomLeftRadius: '2px' }} />
        <div style={{ position: 'absolute', right: '-3px', top: '112px', width: '3px', height: '54px', background: 'rgba(68, 64, 60, 0.8)', borderTopRightRadius: '2px', borderBottomRightRadius: '2px' }} />
      </div>

      {/* Bottom Caption */}
      <p style={{ marginTop: '10px', fontSize: '11px', color: '#64748b', textAlign: 'center', letterSpacing: '-0.01em', fontWeight: 500 }}>
        Updates automatically as you customize
      </p>
    </div>
  );
}
