'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

/**
 * JourneyStepper
 * Sticky/header progress bar guiding users through:
 * 1. Craft -> 2. Preview -> 3. Checkout -> 4. Share
 */
export default function JourneyStepper({ currentStep = 1, noteId = null, templateId = null }) {
  const steps = [
    {
      num: 1,
      label: 'Craft Gift',
      shortLabel: 'Craft',
      href: noteId ? `/create?template=${encodeURIComponent(templateId || 'proposal')}&noteId=${encodeURIComponent(noteId)}` : '/create',
      enabled: true,
    },
    {
      num: 2,
      label: 'Preview',
      shortLabel: 'Preview',
      href: noteId ? `/preview?id=${encodeURIComponent(noteId)}` : null,
      enabled: Boolean(noteId),
    },
    {
      num: 3,
      label: 'Checkout',
      shortLabel: 'Pay',
      href: noteId ? `/checkout?id=${encodeURIComponent(noteId)}` : null,
      enabled: Boolean(noteId),
    },
    {
      num: 4,
      label: 'Share & Track',
      shortLabel: 'Share',
      href: noteId ? `/success?id=${encodeURIComponent(noteId)}` : null,
      enabled: Boolean(noteId) && currentStep === 4,
    },
  ];

  return (
    <div className="w-full bg-white/80 backdrop-blur-md border-b border-stone-200/70 shadow-xs py-2 px-3 sticky top-0 z-40">
      <div className="max-w-4xl mx-auto flex items-center justify-between sm:justify-center sm:gap-8">
        {steps.map((step, idx) => {
          const isCurrent = step.num === currentStep;
          const isPassed = step.num < currentStep;
          const isClickable = step.enabled && step.href && (isPassed || isCurrent);

          const StepContent = (
            <div
              className={`flex items-center gap-2 py-1 px-2.5 rounded-full transition-all duration-200 select-none ${
                isCurrent
                  ? 'bg-rose-50 text-rose-900 font-bold border border-rose-200 shadow-xs scale-102'
                  : isPassed
                  ? 'text-stone-600 hover:text-stone-900 font-medium'
                  : 'text-stone-400 opacity-60'
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold transition-all ${
                  isCurrent
                    ? 'bg-rose-600 text-white shadow-xs'
                    : isPassed
                    ? 'bg-emerald-600 text-white'
                    : 'bg-stone-200 text-stone-500'
                }`}
              >
                {isPassed ? '✓' : step.num}
              </span>
              <span className="text-xs hidden sm:inline">{step.label}</span>
              <span className="text-xs sm:hidden">{step.shortLabel}</span>
            </div>
          );

          return (
            <React.Fragment key={step.num}>
              {idx > 0 && (
                <div
                  className={`h-0.5 w-6 sm:w-12 rounded-full transition-all duration-300 ${
                    step.num <= currentStep ? 'bg-emerald-500' : 'bg-stone-200'
                  }`}
                />
              )}
              {isClickable ? (
                <Link href={step.href} className="no-underline">
                  {StepContent}
                </Link>
              ) : (
                StepContent
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
