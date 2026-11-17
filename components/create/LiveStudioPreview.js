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
    <div className="live-studio-preview-wrapper flex flex-col items-center justify-start w-full select-none">
      {/* Top Status & Live Indicator */}
      <div className="flex items-center justify-between w-full max-w-[330px] mb-2 px-1">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-semibold tracking-wide backdrop-blur-md">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span>Live Preview</span>
        </div>

        {template?.title && (
          <span className="text-[11px] font-medium text-stone-500 truncate max-w-[150px]">
            {template.title}
          </span>
        )}
      </div>

      {/* Realistic Smartphone Mockup Frame */}
      <div
        className="relative w-full max-w-[330px] rounded-[38px] p-2.5 bg-gradient-to-b from-stone-800 via-stone-900 to-black shadow-[0_25px_60px_-15px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.12),inset_0_1px_1px_rgba(255,255,255,0.2)] transition-all duration-300 ease-out"
        style={{
          boxShadow: '0 25px 60px -15px rgba(28, 25, 23, 0.45), 0 0 0 1px rgba(0, 0, 0, 0.08), inset 0 1px 2px rgba(255, 255, 255, 0.15)',
        }}
      >
        {/* Subtle Outer Bezel Edge */}
        <div className="relative w-full rounded-[30px] overflow-hidden bg-[#f8f3eb] border border-black/10">
          
          {/* Dynamic Island / Top Camera Notch */}
          <div className="absolute top-2.5 left-1/2 -translate-x-1/2 z-30 flex items-center justify-center pointer-events-none">
            <div className="h-[20px] w-[88px] bg-black rounded-full flex items-center justify-end pr-2 gap-1.5 shadow-sm">
              <span className="w-2.5 h-2.5 rounded-full bg-stone-900 border border-stone-800" />
              <span className="w-1.5 h-1.5 rounded-full bg-[#151522] border border-[#22223b]" />
            </div>
          </div>

          {/* Screen Viewport Container (Fixed Height 580px, View-Only Template Content) */}
          <div
            className="w-full h-[580px] overflow-hidden relative bg-[#f8f3eb] flex flex-col justify-start"
            style={{
              contain: 'paint layout',
              WebkitFontSmoothing: 'antialiased',
            }}
          >
            {/* View-Only Template Content Wrapper with pointer-events: none */}
            <div
              className="w-full h-full relative"
              style={{
                pointerEvents: 'none',
                userSelect: 'none',
              }}
            >
              <TemplateRenderer note={liveNote} isPreview={true} />
            </div>

            {/* Bottom iOS Home Indicator Bar */}
            <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
              <div className="w-28 h-1 bg-stone-400/50 rounded-full backdrop-blur-xs" />
            </div>
          </div>
        </div>

        {/* Side Button Accents (Left Volume & Right Power subtle styling) */}
        <div className="absolute -left-[3px] top-24 w-[3px] h-9 bg-stone-700/60 rounded-l-sm" />
        <div className="absolute -left-[3px] top-36 w-[3px] h-9 bg-stone-700/60 rounded-l-sm" />
        <div className="absolute -right-[3px] top-28 w-[3px] h-14 bg-stone-700/60 rounded-r-sm" />
      </div>

      {/* Subtle Bottom Caption */}
      <p className="mt-2.5 text-[11px] text-stone-600 text-center tracking-tight">
        Updates automatically as you customize
      </p>
    </div>
  );
}
