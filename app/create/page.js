'use client';

import React, { useState, useCallback, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { doc, serverTimestamp, setDoc, getDoc } from 'firebase/firestore';
import { nanoid } from 'nanoid';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '@/lib/firebase';
import CloudinaryUpload from '@/components/CloudinaryUpload';
import { templates } from '@/lib/templates';

/* ─────────────────────────────────────────────────────────
   TEMPLATE CONFIG
───────────────────────────────────────────────────────── */
const TEMPLATES = templates; // 4 clean templates from lib

/* ─────────────────────────────────────────────────────────
   QUOTE OPTIONS FOR PROPOSAL
───────────────────────────────────────────────────────── */
const PROPOSAL_QUOTES = [
  "Every moment with you feels like home. 🏡",
  "You make ordinary days feel extraordinary. ✨",
  "I choose you. Again and again, I choose you. 💕",
  "With you, forever doesn't feel long enough. 🌹",
  "You are my favourite hello and hardest goodbye. 💫",
  "Being with you is the best decision I ever made. ❤️",
];

/* ─────────────────────────────────────────────────────────
   CAKE OPTIONS FOR BIRTHDAY
───────────────────────────────────────────────────────── */
const CAKE_OPTIONS = [
  { id: 'chocolate', label: 'Midnight Chocolate', emoji: '🍫', desc: 'Dark, rich & decadent', bg: '#3b1f0a', accent: '#92400e' },
  { id: 'strawberry', label: 'Strawberry Blush', emoji: '🍓', desc: 'Sweet, light & rosy', bg: '#4a0020', accent: '#be123c' },
  { id: 'vanilla', label: 'Vanilla Gold', emoji: '✨', desc: 'Classic, elegant & golden', bg: '#422006', accent: '#b45309' },
];

/* ─────────────────────────────────────────────────────────
   WHAT HAPPENED OPTIONS FOR APOLOGY
───────────────────────────────────────────────────────── */
const WHAT_HAPPENED_OPTIONS = [
  { id: 'hurtful', label: 'I said something hurtful', emoji: '😔' },
  { id: 'fight', label: 'We had a fight', emoji: '💔' },
  { id: 'not_there', label: "I wasn't there for you", emoji: '🥺' },
  { id: 'other', label: 'Another reason', emoji: '✍️' },
];

/* ─────────────────────────────────────────────────────────
   RELATIONSHIP OPTIONS FOR PROPOSAL
───────────────────────────────────────────────────────── */
const RELATIONSHIP_OPTIONS = [
  { id: 'girlfriend', label: 'Girlfriend', emoji: '👩' },
  { id: 'boyfriend', label: 'Boyfriend', emoji: '👨' },
  { id: 'male_bestie', label: 'Male Bestie', emoji: '🤝' },
  { id: 'female_bestie', label: 'Female Bestie', emoji: '👯‍♀️' },
];

/* ─────────────────────────────────────────────────────────
   PAGE ENTRY — SUSPENSE WRAPPER
───────────────────────────────────────────────────────── */
export default function CreatePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#080810]">
          <div className="w-10 h-10 rounded-full border-2 border-rose-500 border-t-transparent animate-spin mb-4" />
          <p className="text-slate-400 text-sm">Loading Studio...</p>
        </div>
      }
    >
      <CreatePageContent />
    </Suspense>
  );
}

/* ─────────────────────────────────────────────────────────
   MAIN STATE MACHINE
───────────────────────────────────────────────────────── */
function CreatePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const templateParam = searchParams.get('template');
  const couponParam = searchParams.get('coupon');

  useEffect(() => {
    if (couponParam && typeof window !== 'undefined') {
      localStorage.setItem('lc_saved_coupon', couponParam.trim());
    }
  }, [couponParam]);

  // Screen: 'select' | 'wizard' | 'crafting'
  const [screen, setScreen] = useState(
    TEMPLATES.some((t) => t.id === templateParam) ? 'wizard' : 'select'
  );
  const [selectedId, setSelectedId] = useState(
    TEMPLATES.some((t) => t.id === templateParam) ? templateParam : null
  );
  const [stepIndex, setStepIndex] = useState(0);
  const [direction, setDirection] = useState(1); // 1 = forward, -1 = back

  const activeTemplate = TEMPLATES.find((t) => t.id === selectedId) || TEMPLATES[0];

  // ── FORM DATA ──
  const [form, setForm] = useState({
    recipientName: '',
    senderName: '',
    // Proposal
    relationshipType: '',
    quotation: '',
    // Birthday
    turningAge: '',
    birthdayDate: '',
    cakeType: 'chocolate',
    balloonMessages: ['', '', '', '', ''],
    // Anniversary
    anniversaryDate: '',
    firstMetDate: '',
    journey: [{ date: '', memory: '' }, { date: '', memory: '' }, { date: '', memory: '' }],
    reasons: ['', '', '', '', ''],
    // Apology
    whatHappenedType: '',
    // I Miss You
    originCity: '',
    destinationCity: '',
    distanceKm: '',
    cassettes: [
      { id: 1, title: 'Tape 01: That First Drive', track: 'Night Memories', note: '' },
      { id: 2, title: 'Tape 02: 3 AM Whispers', track: 'Late Night Calls', note: '' },
      { id: 3, title: 'Tape 03: The Rainy Day', track: 'Raindrops & Chai', note: '' },
      { id: 4, title: 'Tape 04: The Counting Down', track: 'Airport Reunion', note: '' },
      { id: 5, title: 'Tape 05: Unconditional', track: 'Always My Person', note: '' },
    ],
    // Shared
    letter: '',
    images: [],
  });

  const setField = (key, val) => setForm((prev) => ({ ...prev, [key]: val }));

  // Submission state
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  // Crafting screen note id
  const [createdId, setCreatedId] = useState(null);

  // ── SELECT TEMPLATE ──
  const handleSelectTemplate = (id) => {
    setSelectedId(id);
    setStepIndex(0);
    setError('');
    setScreen('wizard');
  };

  // ── NAVIGATION ──
  const steps = activeTemplate?.steps || [];
  const totalSteps = steps.length;

  const goNext = () => {
    if (stepIndex < totalSteps - 1) {
      setDirection(1);
      setStepIndex((s) => s + 1);
      setError('');
    } else {
      handleSubmit();
    }
  };

  const goBack = () => {
    if (stepIndex > 0) {
      setDirection(-1);
      setStepIndex((s) => s - 1);
      setError('');
    } else {
      setScreen('select');
    }
  };

  // ── VALIDATE CURRENT STEP ──
  const validateStep = () => {
    const stepId = steps[stepIndex]?.id;
    if (stepId === 'person_details') {
      if (!form.recipientName.trim()) return 'Please enter their name.';
      if (!form.senderName.trim()) return 'Please enter your name.';
      if (selectedId === 'birthday' && !form.turningAge.trim()) return 'Please enter the turning age.';
    }
    if (stepId === 'who_are_they' && !form.relationshipType) return 'Please pick who they are to you.';
    if (stepId === 'what_happened' && !form.whatHappenedType) return 'Please select what happened.';
    if (stepId === 'distance_radar') {
      if (!form.originCity?.trim()) return 'Please enter your origin city.';
      if (!form.destinationCity?.trim()) return 'Please enter their destination city.';
    }
    if (stepId === 'letter' && !form.letter.trim()) return 'Please write your heartfelt message.';
    return null;
  };

  const handleNext = () => {
    const err = validateStep();
    if (err) { setError(err); return; }
    goNext();
  };

  // ── SUBMIT TO FIRESTORE ──
  const handleSubmit = async () => {
    setBusy(true);
    setError('');
    try {
      const docId = nanoid(32);

      // Build custom_details per template
      let customDetails = {};
      if (selectedId === 'proposal') {
        customDetails = {
          sender_name: form.senderName.trim(),
          relationship_type: form.relationshipType,
          quotation: form.quotation.trim(),
          letter: form.letter.trim(),
        };
      } else if (selectedId === 'birthday') {
        customDetails = {
          sender_name: form.senderName.trim(),
          turning_age: form.turningAge.trim(),
          birthday_date: form.birthdayDate.trim(),
          balloon_messages: form.balloonMessages.filter((m) => m.trim()),
          letter: form.letter.trim(),
        };
      } else if (selectedId === 'anniversary') {
        customDetails = {
          sender_name: form.senderName.trim(),
          anniversary_date: form.anniversaryDate.trim(),
          first_met_date: form.firstMetDate.trim() || null,
          journey: form.journey.filter((j) => j.date.trim() && j.memory.trim()),
          reasons: form.reasons.filter((r) => r.trim()),
          letter: form.letter.trim(),
        };
      } else if (selectedId === 'emotional-apology') {
        customDetails = {
          sender_name: form.senderName.trim(),
          what_happened_type: form.whatHappenedType,
          letter: form.letter.trim(),
        };
      } else if (selectedId === 'i-miss-you') {
        customDetails = {
          sender_name: form.senderName.trim(),
          origin_city: form.originCity.trim(),
          destination_city: form.destinationCity.trim(),
          distance_km: form.distanceKm.trim() || '7,192 km',
          cassettes: form.cassettes.map((c, i) => ({
            id: c.id,
            title: c.title,
            track: c.track,
            note: c.note.trim() || `Thinking of you every time this comes to mind.`,
          })),
          letter: form.letter.trim(),
        };
      }

      // Clean empty values
      Object.keys(customDetails).forEach((k) => {
        if (customDetails[k] === '' || customDetails[k] === null) delete customDetails[k];
      });

      await setDoc(doc(db, 'notes', docId), {
        creator_uid: getDeviceId(),
        recipient_name: form.recipientName.trim(),
        custom_message: form.letter.trim(),
        image_urls: Array.isArray(form.images) ? form.images.filter((img) => typeof img === 'string') : [],
        custom_details: Object.keys(customDetails).length > 0 ? customDetails : null,
        is_paid: false,
        template: selectedId,
        custom_slug: null,
        voice_note_url: null,
        created_at: serverTimestamp(),
        expires_at: null,
      });

      if (typeof window !== 'undefined') {
        const ids = JSON.parse(localStorage.getItem('created_note_ids') || '[]');
        ids.push(docId);
        localStorage.setItem('created_note_ids', JSON.stringify(ids));
      }

      setCreatedId(docId);
      setScreen('crafting');
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
      setBusy(false);
    }
  };

  const getDeviceId = () => {
    if (typeof window === 'undefined') return 'anonymous';
    let id = localStorage.getItem('note_device_id');
    if (!id) { id = nanoid(32); localStorage.setItem('note_device_id', id); }
    return id;
  };

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ fontFamily: "'Inter', sans-serif", background: 'linear-gradient(180deg, #fff5f8 0%, #fff0f5 50%, #faf0f7 100%)' }}>
      {/* ── Background Ambient Glows ── */}
      <div
        style={{
          position: 'absolute',
          top: '-10%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '600px',
          height: '400px',
          background: 'radial-gradient(circle, rgba(244, 63, 94, 0.15) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '10%',
          right: '-5%',
          width: '500px',
          height: '500px',
          background: 'radial-gradient(circle, rgba(168, 85, 247, 0.1) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      {/* ── Styles ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Dancing+Script:wght@700&display=swap');
        * { box-sizing: border-box; }
        input, textarea, select { outline: none; }
        input::placeholder, textarea::placeholder { color: #94a3b8; }
        input:focus, textarea:focus { border-color: #f43f5e !important; box-shadow: 0 0 0 4px rgba(244, 63, 94, 0.12) !important; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.15); border-radius: 4px; }
      `}</style>

      <AnimatePresence mode="wait">
        {screen === 'select' && (
          <SelectScreen key="select" templates={TEMPLATES} onSelect={handleSelectTemplate} />
        )}
        {screen === 'wizard' && selectedId && (
          <WizardScreen
            key="wizard"
            template={activeTemplate}
            steps={steps}
            stepIndex={stepIndex}
            direction={direction}
            form={form}
            setField={setField}
            onNext={handleNext}
            onBack={goBack}
            busy={busy}
            error={error}
            setError={setError}
            isLastStep={stepIndex === totalSteps - 1}
          />
        )}
        {screen === 'crafting' && (
          <CraftingScreen
            key="crafting"
            template={activeTemplate}
            recipientName={form.recipientName}
            noteId={createdId}
            router={router}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   SCREEN 1: SELECT TEMPLATE
───────────────────────────────────────────────────────── */
function SelectScreen({ templates, onSelect }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen flex flex-col relative z-10"
    >
      {/* Header */}
      <div className="text-center pt-12 pb-8 px-5">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{
            display: 'inline-block',
            fontSize: '0.75rem',
            fontWeight: 800,
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color: '#be185d',
            background: 'rgba(244,63,94,0.1)',
            border: '1px solid rgba(244,63,94,0.2)',
            padding: '6px 16px',
            borderRadius: '999px',
            marginBottom: '1rem',
            boxShadow: '0 4px 12px rgba(244,63,94,0.08)',
          }}
        >
          ✨ LovelyCrafts Studio
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{
            fontFamily: "'Dancing Script', cursive",
            fontSize: 'clamp(2.2rem, 7vw, 3.4rem)',
            color: '#be185d',
            background: 'linear-gradient(135deg, #be185d 0%, #e11d48 50%, #9333ea 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            margin: '0 0 0.75rem',
            lineHeight: 1.25,
            fontWeight: 700,
          }}
        >
          What would you like to craft?
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          style={{ color: '#475569', fontSize: '0.98rem', fontWeight: 500, maxWidth: '400px', margin: '0 auto', lineHeight: 1.6 }}
        >
          Choose a moment. We'll help you turn it into something they'll never forget.
        </motion.p>
      </div>

      {/* Template Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '1.1rem',
          padding: '0 1.25rem 5rem',
          maxWidth: '520px',
          margin: '0 auto',
          width: '100%',
        }}
      >
        {templates.map((tmpl, i) => (
          <TemplateCard key={tmpl.id} template={tmpl} index={i} onSelect={onSelect} />
        ))}
      </div>
    </motion.div>
  );
}

function TemplateCard({ template, index, onSelect }) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 + index * 0.08, type: 'spring', stiffness: 260, damping: 20 }}
      whileHover={{ scale: 1.03, y: -4 }}
      whileTap={{ scale: 0.96 }}
      onClick={() => onSelect(template.id)}
      style={{
        background: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: '1.5px solid rgba(244, 63, 94, 0.15)',
        borderRadius: '24px',
        padding: '1.6rem 1rem',
        textAlign: 'center',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.65rem',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 10px 30px -5px rgba(225, 29, 72, 0.08), 0 4px 12px rgba(0,0,0,0.02)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = template.accentColor;
        e.currentTarget.style.boxShadow = `0 18px 40px -10px ${template.glowColor}`;
        e.currentTarget.style.background = '#ffffff';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'rgba(244, 63, 94, 0.15)';
        e.currentTarget.style.boxShadow = '0 10px 30px -5px rgba(225, 29, 72, 0.08), 0 4px 12px rgba(0,0,0,0.02)';
        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.9)';
      }}
    >
      {/* Glow blob */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(circle at 50% 0%, ${template.glowColor} 0%, transparent 70%)`,
          opacity: 0.4,
          pointerEvents: 'none',
        }}
      />
      <div style={{ fontSize: '2.6rem', lineHeight: 1, filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.08))' }}>{template.emoji}</div>
      <div
        style={{
          fontSize: '0.92rem',
          fontWeight: 800,
          color: '#0f172a',
          lineHeight: 1.3,
          position: 'relative',
        }}
      >
        {template.title}
      </div>
      <div
        style={{
          fontSize: '0.75rem',
          fontWeight: 600,
          color: '#64748b',
          lineHeight: 1.4,
          position: 'relative',
        }}
      >
        {template.time}
      </div>
      <div
        style={{
          marginTop: '0.25rem',
          padding: '5px 12px',
          borderRadius: '999px',
          background: `${template.accentColor}18`,
          color: template.accentColor,
          border: `1px solid ${template.accentColor}35`,
          fontSize: '0.72rem',
          fontWeight: 800,
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
          position: 'relative',
        }}
      >
        ✨ Tap to craft
      </div>
    </motion.button>
  );
}

/* ─────────────────────────────────────────────────────────
   SCREEN 2: WIZARD
───────────────────────────────────────────────────────── */
function WizardScreen({ template, steps, stepIndex, direction, form, setField, onNext, onBack, busy, error, setError, isLastStep }) {
  const currentStep = steps[stepIndex];
  const accent = template.accentColor;

  const stepVariants = {
    enter: (dir) => ({ x: dir > 0 ? '100%' : '-100%', opacity: 0 }),
    center: { x: 0, opacity: 1, transition: { type: 'spring', stiffness: 280, damping: 28 } },
    exit: (dir) => ({ x: dir > 0 ? '-60%' : '60%', opacity: 0, transition: { duration: 0.2 } }),
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.35 }}
      className="min-h-screen flex flex-col relative z-10"
    >
      {/* Top Bar */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          background: 'rgba(255, 255, 255, 0.88)',
          borderBottom: '1px solid rgba(226, 232, 240, 0.8)',
          padding: '0.85rem 1.25rem',
          boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
        }}
      >
        <div
          style={{
            maxWidth: '480px',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <button
            onClick={onBack}
            style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '50px',
              padding: '7px 16px',
              color: '#334155',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
              transition: 'all 0.2s',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
            </svg>
            Back
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.2rem' }}>{template.emoji}</span>
            <span style={{ fontWeight: 800, fontSize: '0.92rem', color: '#0f172a' }}>{template.title}</span>
          </div>
        </div>
      </div>

      {/* Step Progress */}
      <StepProgressBar steps={steps} currentIndex={stepIndex} accent={accent} />

      {/* Step Content */}
      <div
        style={{
          flex: 1,
          maxWidth: '480px',
          margin: '0 auto',
          width: '100%',
          padding: '1.5rem 1.25rem 0',
          overflow: 'hidden',
        }}
      >
        <AnimatePresence custom={direction} mode="wait">
          <motion.div
            key={currentStep?.id || stepIndex}
            custom={direction}
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
          >
            <StepContent
              stepId={currentStep?.id}
              templateId={template.id}
              form={form}
              setField={setField}
              accent={accent}
              setError={setError}
            />
          </motion.div>
        </AnimatePresence>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              style={{
                marginTop: '1rem',
                padding: '12px 16px',
                borderRadius: '14px',
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.3)',
                color: '#dc2626',
                fontSize: '0.88rem',
                fontWeight: 600,
              }}
            >
              ⚠️ {error}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom CTA */}
      <div
        style={{
          maxWidth: '480px',
          margin: '0 auto',
          width: '100%',
          padding: '1.5rem 1.25rem 2.5rem',
        }}
      >
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={onNext}
          disabled={busy}
          style={{
            width: '100%',
            padding: '16px',
            borderRadius: '16px',
            background: template.gradient,
            border: 'none',
            color: '#fff',
            fontSize: '1.05rem',
            fontWeight: 800,
            cursor: busy ? 'not-allowed' : 'pointer',
            opacity: busy ? 0.7 : 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            boxShadow: `0 6px 24px ${template.glowColor}`,
          }}
        >
          {busy ? (
            <>
              <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
              Crafting...
            </>
          ) : isLastStep ? (
            <>✨ Craft My Experience</>
          ) : (
            <>Continue →</>
          )}
        </motion.button>
      </div>
    </motion.div>
  );
}

function StepProgressBar({ steps, currentIndex, accent }) {
  return (
    <div
      style={{
        maxWidth: '480px',
        margin: '0 auto',
        width: '100%',
        padding: '1rem 1.25rem 0',
        display: 'flex',
        gap: '6px',
        alignItems: 'center',
      }}
    >
      {steps.map((step, i) => (
        <div
          key={step.id}
          style={{
            flex: 1,
            height: '5px',
            borderRadius: '4px',
            background: i <= currentIndex ? accent : 'rgba(0,0,0,0.08)',
            boxShadow: i <= currentIndex ? `0 0 10px ${accent}60` : 'none',
            transition: 'all 0.4s ease',
          }}
        />
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   STEP CONTENT ROUTER
───────────────────────────────────────────────────────── */
function StepContent({ stepId, templateId, form, setField, accent, setError }) {
  switch (stepId) {
    case 'person_details':
      return <StepPersonDetails templateId={templateId} form={form} setField={setField} accent={accent} />;
    case 'who_are_they':
      return <StepWhoAreThey form={form} setField={setField} accent={accent} />;
    case 'quotation':
      return <StepQuotation form={form} setField={setField} accent={accent} />;
    case 'cake':
      return <StepCake form={form} setField={setField} accent={accent} />;
    case 'balloons':
      return <StepBalloons form={form} setField={setField} accent={accent} />;
    case 'special_dates':
      return <StepSpecialDates form={form} setField={setField} accent={accent} />;
    case 'journey':
      return <StepJourney form={form} setField={setField} accent={accent} />;
    case 'reasons':
      return <StepReasons form={form} setField={setField} accent={accent} />;
    case 'what_happened':
      return <StepWhatHappened form={form} setField={setField} accent={accent} />;
    case 'photos':
    case 'memories':
      return <StepMemories form={form} setField={setField} accent={accent} templateId={templateId} />;
    case 'distance_radar':
      return <StepDistanceRadar form={form} setField={setField} accent={accent} />;
    case 'cassettes':
      return <StepCassettes form={form} setField={setField} accent={accent} />;
    case 'letter':
      return <StepLetter templateId={templateId} form={form} setField={setField} accent={accent} />;
    default:
      return null;
  }
}

/* ─────────────────────────────────────────────────────────
   SHARED UI PRIMITIVES
───────────────────────────────────────────────────────── */
function StepHeader({ icon, title, subtitle }) {
  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <div style={{ fontSize: '2.4rem', marginBottom: '0.5rem', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.06))' }}>{icon}</div>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.35rem', lineHeight: 1.25 }}>{title}</h2>
      {subtitle && <p style={{ color: '#475569', fontSize: '0.9rem', margin: 0, lineHeight: 1.55 }}>{subtitle}</p>}
    </div>
  );
}

function FieldLabel({ children }) {
  return (
    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.45rem' }}>
      {children}
    </label>
  );
}

function TextInput({ value, onChange, placeholder, type = 'text' }) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      style={{
        width: '100%',
        padding: '13px 16px',
        borderRadius: '14px',
        border: '1.5px solid #cbd5e1',
        background: '#ffffff',
        color: '#0f172a',
        fontSize: '1rem',
        fontWeight: '500',
        boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
        transition: 'all 0.2s',
      }}
    />
  );
}

function TextArea({ value, onChange, placeholder, rows = 5 }) {
  return (
    <textarea
      rows={rows}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      style={{
        width: '100%',
        padding: '13px 16px',
        borderRadius: '14px',
        border: '1.5px solid #cbd5e1',
        background: '#ffffff',
        color: '#0f172a',
        fontSize: '1rem',
        fontWeight: '500',
        lineHeight: 1.7,
        resize: 'none',
        boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
        transition: 'all 0.2s',
      }}
    />
  );
}

/* ─────────────────────────────────────────────────────────
   STEP COMPONENTS
───────────────────────────────────────────────────────── */

// STEP: Person Details (shared by all)
function StepPersonDetails({ templateId, form, setField, accent }) {
  return (
    <div>
      <StepHeader icon="👤" title="Tell me about you both" subtitle="These names will appear throughout their experience." />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
        <div>
          <FieldLabel>Their Name *</FieldLabel>
          <TextInput value={form.recipientName} onChange={(v) => setField('recipientName', v)} placeholder="e.g. Priya, Alex, Bestie..." />
        </div>
        <div>
          <FieldLabel>Your Name *</FieldLabel>
          <TextInput value={form.senderName} onChange={(v) => setField('senderName', v)} placeholder="e.g. Rahul, Your name..." />
        </div>
        {templateId === 'birthday' && (
          <>
            <div>
              <FieldLabel>Turning Age *</FieldLabel>
              <TextInput value={form.turningAge} onChange={(v) => setField('turningAge', v)} placeholder="e.g. 22, 25, 30..." type="text" />
            </div>
            <div>
              <FieldLabel>Their Birthday</FieldLabel>
              <TextInput value={form.birthdayDate} onChange={(v) => setField('birthdayDate', v)} placeholder="e.g. 15 March, August 7..." />
            </div>
          </>
        )}
        {templateId === 'anniversary' && (
          <div style={{ padding: '14px 16px', borderRadius: '14px', background: 'rgba(255,255,255,0.8)', border: '1px solid #e2e8f0', fontSize: '0.85rem', color: '#475569', fontWeight: 500, boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
            💡 You'll enter your anniversary dates in the next steps.
          </div>
        )}
      </div>
    </div>
  );
}

// STEP: Who Are They (Proposal)
function StepWhoAreThey({ form, setField, accent }) {
  return (
    <div>
      <StepHeader icon="💞" title="Who are they to you?" subtitle="This helps us personalize their experience." />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
        {RELATIONSHIP_OPTIONS.map((opt) => {
          const isSelected = form.relationshipType === opt.id;
          return (
            <motion.button
              key={opt.id}
              whileTap={{ scale: 0.95 }}
              onClick={() => setField('relationshipType', opt.id)}
              style={{
                padding: '1.2rem 0.85rem',
                borderRadius: '18px',
                border: isSelected ? `2px solid ${accent}` : '1.5px solid #e2e8f0',
                background: isSelected ? `${accent}12` : '#ffffff',
                color: isSelected ? '#0f172a' : '#334155',
                fontWeight: isSelected ? 800 : 600,
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: '0.92rem',
                boxShadow: isSelected ? `0 6px 20px ${accent}25` : '0 2px 6px rgba(0,0,0,0.02)',
                transition: 'all 0.2s',
              }}
            >
              <span style={{ fontSize: '2rem' }}>{opt.emoji}</span>
              {opt.label}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

// STEP: Quotation (Proposal)
function StepQuotation({ form, setField, accent }) {
  return (
    <div>
      <StepHeader icon="💬" title="A message for them" subtitle="Pick one that feels right or write your own below." />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginBottom: '1.25rem' }}>
        {PROPOSAL_QUOTES.map((q) => {
          const isSelected = form.quotation === q;
          return (
            <motion.button
              key={q}
              whileTap={{ scale: 0.98 }}
              onClick={() => setField('quotation', isSelected ? '' : q)}
              style={{
                textAlign: 'left',
                padding: '13px 16px',
                borderRadius: '14px',
                border: isSelected ? `2px solid ${accent}` : '1.5px solid #e2e8f0',
                background: isSelected ? `${accent}12` : '#ffffff',
                color: isSelected ? '#0f172a' : '#334155',
                fontWeight: isSelected ? 700 : 500,
                fontSize: '0.9rem',
                lineHeight: 1.5,
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
                transition: 'all 0.2s',
              }}
            >
              {q}
            </motion.button>
          );
        })}
      </div>
      <FieldLabel>Or write your own</FieldLabel>
      <TextArea
        rows={3}
        value={PROPOSAL_QUOTES.includes(form.quotation) ? '' : form.quotation}
        onChange={(v) => setField('quotation', v)}
        placeholder="Write something from your heart..."
      />
    </div>
  );
}

// STEP: Cake (Birthday)
function StepCake({ form, setField, accent }) {
  return (
    <div>
      <StepHeader icon="🎂" title="Pick the perfect cake" subtitle="This is the cake we'll bake and present to them." />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        {CAKE_OPTIONS.map((cake) => {
          const isSelected = form.cakeType === cake.id;
          return (
            <motion.button
              key={cake.id}
              whileTap={{ scale: 0.97 }}
              onClick={() => setField('cakeType', cake.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                padding: '1.1rem 1.2rem',
                borderRadius: '18px',
                border: isSelected ? `2px solid ${accent}` : '1.5px solid #e2e8f0',
                background: isSelected ? cake.bg : '#ffffff',
                color: isSelected ? '#ffffff' : '#0f172a',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: isSelected ? `0 8px 24px ${cake.accent}40` : '0 2px 6px rgba(0,0,0,0.02)',
              }}
            >
              <span style={{ fontSize: '2.4rem' }}>{cake.emoji}</span>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: 800, color: isSelected ? '#ffffff' : '#0f172a', fontSize: '0.98rem' }}>{cake.label}</div>
                <div style={{ fontSize: '0.8rem', color: isSelected ? 'rgba(255,255,255,0.8)' : '#64748b', marginTop: '2px' }}>{cake.desc}</div>
              </div>
              {isSelected && (
                <div style={{ marginLeft: 'auto', color: '#ffffff', fontSize: '1.3rem', fontWeight: 800 }}>✓</div>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

// STEP: Balloon Messages (Birthday)
function StepBalloons({ form, setField, accent }) {
  const updateBalloon = (index, val) => {
    const updated = [...form.balloonMessages];
    updated[index] = val;
    setField('balloonMessages', updated);
  };

  return (
    <div>
      <StepHeader icon="🎈" title="Balloon pop reveals!" subtitle="Add up to 5 surprise messages — one per balloon. They'll pop and reveal your words!" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: [accent, '#f43f5e', '#f59e0b', '#a855f7', '#06b6d4'][i % 5] + '20',
                border: `1.5px solid ${[accent, '#f43f5e', '#f59e0b', '#a855f7', '#06b6d4'][i % 5]}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1rem',
                flexShrink: 0,
              }}
            >
              🎈
            </div>
            <input
              type="text"
              value={form.balloonMessages[i] || ''}
              onChange={(e) => updateBalloon(i, e.target.value)}
              placeholder={`Message ${i + 1}... (e.g. "You light up my world")`}
              style={{
                flex: 1,
                padding: '12px 15px',
                borderRadius: '14px',
                border: '1.5px solid #cbd5e1',
                background: '#ffffff',
                color: '#0f172a',
                fontSize: '0.92rem',
                fontWeight: 500,
                boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
              }}
            />
          </div>
        ))}
        <p style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '0.35rem', fontWeight: 500 }}>
          💡 At least 1 message required. The rest are optional.
        </p>
      </div>
    </div>
  );
}

// STEP: Special Dates (Anniversary)
function StepSpecialDates({ form, setField, accent }) {
  return (
    <div>
      <StepHeader icon="📅" title="Your special dates" subtitle="These dates will anchor the live anniversary timer." />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
        <div>
          <FieldLabel>Anniversary Date *</FieldLabel>
          <TextInput value={form.anniversaryDate} onChange={(v) => setField('anniversaryDate', v)} placeholder="e.g. 12 February 2022, Feb 12 2022..." />
        </div>
        <div>
          <FieldLabel>The Day You First Met (optional)</FieldLabel>
          <TextInput value={form.firstMetDate} onChange={(v) => setField('firstMetDate', v)} placeholder="e.g. June 5, 2020..." />
        </div>
        <div style={{ padding: '14px 16px', borderRadius: '14px', background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.25)', fontSize: '0.85rem', color: '#b45309', fontWeight: 600 }}>
          🥂 The experience will show a live countdown — years, months, days, hours, minutes & seconds since your anniversary.
        </div>
      </div>
    </div>
  );
}

// STEP: Journey Together (Anniversary)
function StepJourney({ form, setField, accent }) {
  const updateJourney = (index, field, val) => {
    const updated = form.journey.map((j, i) => i === index ? { ...j, [field]: val } : j);
    setField('journey', updated);
  };

  const addEvent = () => {
    if (form.journey.length < 5) setField('journey', [...form.journey, { date: '', memory: '' }]);
  };

  const removeEvent = (index) => {
    if (form.journey.length > 1) setField('journey', form.journey.filter((_, i) => i !== index));
  };

  return (
    <div>
      <StepHeader icon="🗺️" title="Your journey together" subtitle="Add key moments — these form a beautiful timeline in the experience." />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {form.journey.map((event, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              padding: '1.1rem',
              borderRadius: '16px',
              background: '#ffffff',
              border: '1.5px solid #e2e8f0',
              boxShadow: '0 4px 14px rgba(0,0,0,0.03)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Event {i + 1}
              </span>
              {form.journey.length > 1 && (
                <button onClick={() => removeEvent(i)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '1.2rem', fontWeight: 700 }}>×</button>
              )}
            </div>
            <input
              type="text"
              value={event.date}
              onChange={(e) => updateJourney(i, 'date', e.target.value)}
              placeholder="Date (e.g. March 2021)"
              style={{ width: '100%', padding: '11px 14px', borderRadius: '12px', border: '1px solid #cbd5e1', background: '#f8fafc', color: '#0f172a', fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: 500 }}
            />
            <input
              type="text"
              value={event.memory}
              onChange={(e) => updateJourney(i, 'memory', e.target.value)}
              placeholder="Memory (e.g. Our first road trip)"
              style={{ width: '100%', padding: '11px 14px', borderRadius: '12px', border: '1px solid #cbd5e1', background: '#f8fafc', color: '#0f172a', fontSize: '0.9rem', fontWeight: 500 }}
            />
          </motion.div>
        ))}
        {form.journey.length < 5 && (
          <button
            onClick={addEvent}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '14px',
              border: `1.5px dashed ${accent}`,
              background: `${accent}08`,
              color: accent,
              fontWeight: 800,
              fontSize: '0.9rem',
              cursor: 'pointer',
            }}
          >
            + Add another moment
          </button>
        )}
      </div>
    </div>
  );
}

// STEP: Reasons (Anniversary)
function StepReasons({ form, setField, accent }) {
  const updateReason = (i, val) => {
    const updated = [...form.reasons];
    updated[i] = val;
    setField('reasons', updated);
  };

  return (
    <div>
      <StepHeader icon="❤️" title="Why do you love them?" subtitle="5 honest reasons — these will burst out of heart balloons in the experience." />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'rgba(244,63,94,0.12)',
                border: '1.5px solid rgba(244,63,94,0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.88rem',
                fontWeight: 800,
                color: '#e11d48',
                flexShrink: 0,
              }}
            >
              {i + 1}
            </div>
            <input
              type="text"
              value={form.reasons[i] || ''}
              onChange={(e) => updateReason(i, e.target.value)}
              placeholder={`Reason ${i + 1}... (e.g. "Your laugh is contagious")`}
              style={{
                flex: 1,
                padding: '12px 15px',
                borderRadius: '14px',
                border: '1.5px solid #cbd5e1',
                background: '#ffffff',
                color: '#0f172a',
                fontSize: '0.92rem',
                fontWeight: 500,
                boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

// STEP: What Happened (Apology)
function StepWhatHappened({ form, setField, accent }) {
  return (
    <div>
      <StepHeader icon="💔" title="What happened?" subtitle="Being honest is the first step to making things right." />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        {WHAT_HAPPENED_OPTIONS.map((opt) => {
          const isSelected = form.whatHappenedType === opt.id;
          return (
            <motion.button
              key={opt.id}
              whileTap={{ scale: 0.97 }}
              onClick={() => setField('whatHappenedType', opt.id)}
              style={{
                textAlign: 'left',
                padding: '1.1rem 1.2rem',
                borderRadius: '18px',
                border: isSelected ? `2px solid ${accent}` : '1.5px solid #e2e8f0',
                background: isSelected ? `${accent}12` : '#ffffff',
                color: isSelected ? '#0f172a' : '#334155',
                fontWeight: isSelected ? 800 : 500,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.85rem',
                fontSize: '0.98rem',
                transition: 'all 0.2s',
                boxShadow: isSelected ? `0 6px 20px ${accent}20` : '0 2px 6px rgba(0,0,0,0.02)',
              }}
            >
              <span style={{ fontSize: '1.8rem' }}>{opt.emoji}</span>
              {opt.label}
              {isSelected && <span style={{ marginLeft: 'auto', color: accent, fontWeight: 800 }}>✓</span>}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

// STEP: Memories / Photos (shared)
function StepMemories({ form, setField, accent, templateId }) {
  const maxPhotos = templateId === 'birthday' ? 5 : templateId === 'anniversary' ? 5 : 3;

  return (
    <div>
      <StepHeader
        icon="📸"
        title="Add your memories"
        subtitle={`Upload up to ${maxPhotos} photos — they'll be beautifully presented in the experience.`}
      />
      <CloudinaryUpload
        images={form.images}
        setImages={(imgs) => setField('images', imgs)}
        maxImages={maxPhotos}
      />
      {form.images.length === 0 && (
        <div style={{ marginTop: '1rem', padding: '14px 16px', borderRadius: '14px', background: 'rgba(255,255,255,0.8)', border: '1px dashed #cbd5e1', color: '#64748b', fontSize: '0.85rem', textAlign: 'center', fontWeight: 500 }}>
          Photos are optional but they make the experience so much more personal 💫
        </div>
      )}
    </div>
  );
}

// STEP: Letter (shared)
function StepLetter({ templateId, form, setField, accent }) {
  const prompts = {
    proposal: "Write from your heart — this will be typewritten on a parchment letter after they click YES...",
    birthday: "Write a heartfelt birthday letter — it will appear line by line in a beautiful envelope...",
    anniversary: "A love letter to close the experience — take your time, it will be presented beautifully...",
    'emotional-apology': "Pour your heart out — this becomes the handwritten letter they'll read...",
  };

  const charCount = form.letter.length;

  return (
    <div>
      <StepHeader
        icon="✉️"
        title={templateId === 'emotional-apology' ? "Write from your heart" : "Your heartfelt letter"}
        subtitle="This becomes a beautifully animated handwritten letter in their experience."
      />
      <div style={{ position: 'relative' }}>
        <TextArea
          value={form.letter}
          onChange={(v) => setField('letter', v)}
          placeholder={prompts[templateId] || "Write your heartfelt message here..."}
          rows={7}
        />
        <div style={{ textAlign: 'right', fontSize: '0.78rem', color: '#64748b', marginTop: '0.4rem', fontWeight: 600 }}>
          {charCount} characters
        </div>
      </div>
      <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <p style={{ color: '#64748b', fontSize: '0.85rem', textAlign: 'center', margin: 0, fontWeight: 500 }}>
          ✍️ Your exact words will be typewritten line-by-line in their experience
        </p>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   SCREEN 3: CRAFTING EXPERIENCE ANIMATION
───────────────────────────────────────────────────────── */
function CraftingScreen({ template, recipientName, noteId, router }) {
  const [phase, setPhase] = useState(0); // 0: sparkle in, 1: typing, 2: done

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 600);
    const t2 = setTimeout(() => setPhase(2), 2000);
    const t3 = setTimeout(() => {
      if (noteId) router.push(`/preview?id=${noteId}`);
    }, 3200);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [noteId, router]);

  const particles = Array.from({ length: 24 }, (_, i) => ({
    id: i,
    left: `${(i * 37) % 100}%`,
    top: `${(i * 61) % 100}%`,
    delay: `${(i * 0.12).toFixed(2)}s`,
    size: 8 + (i % 4) * 6,
    color: [template.accentColor, '#fff', '#fbbf24', '#f43f5e', '#a855f7'][i % 5],
  }));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed',
        inset: 0,
        background: '#060610',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        overflow: 'hidden',
      }}
    >
      {/* Particles */}
      <style>{`
        @keyframes floatSpark { 0% { transform: translate(0,0) scale(0); opacity: 0; } 20% { opacity: 1; transform: translate(0,0) scale(1); } 100% { transform: translate(var(--tx), var(--ty)) scale(0); opacity: 0; } }
        @keyframes pulse-ring { 0% { transform: scale(0.8); opacity: 0.8; } 100% { transform: scale(2); opacity: 0; } }
      `}</style>

      {particles.map((p) => (
        <div
          key={p.id}
          style={{
            position: 'absolute',
            left: p.left,
            top: p.top,
            width: p.size,
            height: p.size,
            borderRadius: '50%',
            background: p.color,
            animation: `floatSpark 3s ${p.delay} infinite`,
            '--tx': `${((p.id * 17) % 80) - 40}px`,
            '--ty': `${((p.id * 23) % 80) - 40}px`,
            opacity: 0,
          }}
        />
      ))}

      {/* Glowing ring */}
      <div style={{ position: 'relative', marginBottom: '2rem' }}>
        <div style={{
          position: 'absolute',
          inset: '-20px',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${template.glowColor}, transparent)`,
          animation: 'pulse-ring 2s ease-out infinite',
        }} />
        <motion.div
          animate={{ scale: [1, 1.1, 1], rotate: [0, 10, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          style={{ fontSize: '4.5rem', position: 'relative' }}
        >
          {template.emoji}
        </motion.div>
      </div>

      {/* Text */}
      <AnimatePresence mode="wait">
        {phase === 0 && (
          <motion.p key="p0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ color: '#94a3b8', fontSize: '1rem', textAlign: 'center' }}>
            Preparing...
          </motion.p>
        )}
        {phase === 1 && (
          <motion.div key="p1" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={{ textAlign: 'center', padding: '0 2rem' }}>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Crafting something beautiful</p>
            <h2 style={{ fontFamily: "'Dancing Script', cursive", fontSize: '2.2rem', color: '#fff', margin: '0 0 0.5rem' }}>
              For {recipientName || 'them'}...
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '0.88rem' }}>{template.title}</p>
          </motion.div>
        )}
        {phase === 2 && (
          <motion.div key="p2" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
            style={{ textAlign: 'center', padding: '0 2rem' }}>
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.5 }}
              style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}
            >
              ✨
            </motion.div>
            <h2 style={{ color: '#fff', fontWeight: 800, fontSize: '1.3rem', marginBottom: '0.4rem' }}>
              Experience Ready!
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '0.88rem' }}>Opening your private preview...</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress bar */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '3px', background: 'rgba(255,255,255,0.06)' }}>
        <motion.div
          initial={{ width: '0%' }}
          animate={{ width: '100%' }}
          transition={{ duration: 3, ease: 'linear' }}
          style={{ height: '100%', background: template.gradient }}
        />
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────
   STEP: Distance Radar (I Miss You)
───────────────────────────────────────────────────────── */
function StepDistanceRadar({ form, setField, accent }) {
  return (
    <div>
      <StepHeader
        icon="📍"
        title="Orbital Distance Radar"
        subtitle="Connect your two cities across the celestial map."
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div>
          <FieldLabel>Where are you right now? (Origin City)</FieldLabel>
          <TextInput
            value={form.originCity}
            onChange={(val) => setField('originCity', val)}
            placeholder="e.g. Mumbai, India"
          />
        </div>

        <div>
          <FieldLabel>Where are they? (Destination City)</FieldLabel>
          <TextInput
            value={form.destinationCity}
            onChange={(val) => setField('destinationCity', val)}
            placeholder="e.g. London, UK"
          />
        </div>

        <div>
          <FieldLabel>Approximate Distance (Optional)</FieldLabel>
          <TextInput
            value={form.distanceKm}
            onChange={(val) => setField('distanceKm', val)}
            placeholder="e.g. 7,192 km (leave blank to calculate)"
          />
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   STEP: Cassette Tapes (I Miss You)
───────────────────────────────────────────────────────── */
function StepCassettes({ form, setField, accent }) {
  const cassettes = form.cassettes || [];

  const updateCassette = (index, field, value) => {
    const updated = [...cassettes];
    updated[index] = { ...updated[index], [field]: value };
    setField('cassettes', updated);
  };

  return (
    <div>
      <StepHeader
        icon="📼"
        title="5 Cassette Memory Tapes"
        subtitle="Add a short memory note or song idea for each tape."
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
        {cassettes.map((c, i) => (
          <div
            key={c.id || i}
            style={{
              padding: '16px',
              borderRadius: '16px',
              border: '1.5px solid #e2e8f0',
              background: '#f8fafc',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: accent }}>
                TAPE 0{i + 1}
              </span>
              <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>
                {c.track}
              </span>
            </div>
            <TextInput
              value={c.note}
              onChange={(val) => updateCassette(i, 'note', val)}
              placeholder={`Memory note for ${c.track}...`}
            />
          </div>
        ))}
      </div>
    </div>
  );
}


