'use client';

import React, { useState, useEffect, Suspense, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { doc, serverTimestamp, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { nanoid } from 'nanoid';
import { motion, AnimatePresence } from 'motion/react';
import { db } from '@/lib/firebase';
import CloudinaryUpload from '@/components/CloudinaryUpload';
import { templates } from '@/lib/templates';
import { springs } from '@/lib/motion';
import { playSfx, sfx } from '@/lib/sfx';
import LiveStudioPreview from '@/components/create/LiveStudioPreview';
import InspirationVault from '@/components/create/InspirationVault';
import CraftingCeremony from '@/components/create/CraftingCeremony';

/* ─────────────────────────────────────────────────────────
   TEMPLATE CONFIG
───────────────────────────────────────────────────────── */
const TEMPLATES = templates;

/* ─────────────────────────────────────────────────────────
   DYNAMIC ATMOSPHERES PER TEMPLATE
───────────────────────────────────────────────────────── */
const ATMOSPHERES = {
  proposal: {
    name: 'Rose Gold Romance',
    primaryGlow: 'radial-gradient(circle at 25% 15%, rgba(244, 63, 94, 0.20) 0%, rgba(251, 113, 133, 0.10) 40%, transparent 70%)',
    secondaryGlow: 'radial-gradient(circle at 80% 80%, rgba(251, 191, 36, 0.14) 0%, rgba(244, 63, 94, 0.06) 50%, transparent 75%)',
    accent: '#f43f5e',
    pageBg: 'linear-gradient(180deg, #fff7f7 0%, #fdf2f4 50%, #fbf0ee 100%)',
  },
  birthday: {
    name: 'Golden Celebration',
    primaryGlow: 'radial-gradient(circle at 20% 20%, rgba(245, 158, 11, 0.22) 0%, rgba(234, 88, 12, 0.10) 45%, transparent 70%)',
    secondaryGlow: 'radial-gradient(circle at 85% 75%, rgba(225, 29, 72, 0.14) 0%, rgba(245, 158, 11, 0.08) 50%, transparent 75%)',
    accent: '#f59e0b',
    pageBg: 'linear-gradient(180deg, #fffcf5 0%, #fef8eb 50%, #fbf1de 100%)',
  },
  anniversary: {
    name: 'Champagne Warmth',
    primaryGlow: 'radial-gradient(circle at 30% 15%, rgba(217, 119, 6, 0.18) 0%, rgba(245, 208, 140, 0.12) 45%, transparent 70%)',
    secondaryGlow: 'radial-gradient(circle at 75% 85%, rgba(225, 29, 72, 0.12) 0%, rgba(217, 119, 6, 0.06) 50%, transparent 75%)',
    accent: '#d97706',
    pageBg: 'linear-gradient(180deg, #fdfbf7 0%, #fbf5eb 50%, #f5ecdc 100%)',
  },
  'emotional-apology': {
    name: 'Lavender Sanctuary',
    primaryGlow: 'radial-gradient(circle at 25% 20%, rgba(168, 85, 247, 0.18) 0%, rgba(139, 92, 246, 0.10) 45%, transparent 70%)',
    secondaryGlow: 'radial-gradient(circle at 80% 80%, rgba(244, 63, 94, 0.12) 0%, rgba(168, 85, 247, 0.05) 50%, transparent 75%)',
    accent: '#8b5cf6',
    pageBg: 'linear-gradient(180deg, #faf7fc 0%, #f5eff9 50%, #efe7f4 100%)',
  },
  'i-miss-you': {
    name: 'Cosmic Nebula',
    primaryGlow: 'radial-gradient(circle at 25% 15%, rgba(99, 102, 241, 0.22) 0%, rgba(168, 85, 247, 0.12) 45%, transparent 70%)',
    secondaryGlow: 'radial-gradient(circle at 85% 75%, rgba(14, 165, 233, 0.16) 0%, rgba(99, 102, 241, 0.08) 50%, transparent 75%)',
    accent: '#6366f1',
    pageBg: 'linear-gradient(180deg, #f7f7fc 0%, #eff1fa 50%, #e6eaf5 100%)',
  },
};

/* ─────────────────────────────────────────────────────────
   OPTIONS CONSTANTS
───────────────────────────────────────────────────────── */
const PROPOSAL_QUOTES = [
  "Every moment with you feels like home. 🏡",
  "You make ordinary days feel extraordinary. ✨",
  "I choose you. Again and again, I choose you. 💕",
  "With you, forever doesn't feel long enough. 🌹",
  "You are my favourite hello and hardest goodbye. 💫",
  "Being with you is the best decision I ever made. ❤️",
];

const CAKE_OPTIONS = [
  { id: 'chocolate', label: 'Midnight Chocolate', emoji: '🍫', desc: 'Dark, rich & decadent', bg: '#3b1f0a', accent: '#92400e' },
  { id: 'strawberry', label: 'Strawberry Blush', emoji: '🍓', desc: 'Sweet, light & rosy', bg: '#4a0020', accent: '#be123c' },
  { id: 'vanilla', label: 'Vanilla Gold', emoji: '✨', desc: 'Classic, elegant & golden', bg: '#422006', accent: '#b45309' },
];

const WHAT_HAPPENED_OPTIONS = [
  { id: 'hurtful', label: 'I said something hurtful', emoji: '😔' },
  { id: 'fight', label: 'We had a fight', emoji: '💔' },
  { id: 'not_there', label: "I wasn't there for you", emoji: '🥺' },
  { id: 'other', label: 'Another reason', emoji: '✍️' },
];

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
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8f3eb]">
          <div className="w-10 h-10 rounded-full border-2 border-[#a83d46] border-t-transparent animate-spin mb-4" />
          <p className="text-[#746258] text-sm font-medium">Opening Crafting Studio...</p>
        </div>
      }
    >
      <CreatePageContent />
    </Suspense>
  );
}

/* ─────────────────────────────────────────────────────────
   MAIN CRAFTING STUDIO COMPONENT
───────────────────────────────────────────────────────── */
function CreatePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const templateParam = searchParams.get('template');
  const couponParam = searchParams.get('coupon');
  const editNoteParam = searchParams.get('noteId');

  // Sound Mute State with localStorage persistence
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedMute = localStorage.getItem('lc_sfx_muted');
      const muted = storedMute === 'true';
      setIsMuted(muted);
      sfx.setMuted(muted);
    }
  }, []);

  const toggleSound = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    sfx.setMuted(nextMuted);
    if (typeof window !== 'undefined') {
      localStorage.setItem('lc_sfx_muted', String(nextMuted));
    }
    if (!nextMuted) {
      playSfx('pop');
    }
  };

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
    TEMPLATES.some((t) => t.id === templateParam) ? templateParam : 'proposal'
  );
  const [stepIndex, setStepIndex] = useState(0);
  const [maxStepReached, setMaxStepReached] = useState(0);
  const [direction, setDirection] = useState(1); // 1 = forward, -1 = back

  // Mobile peek sheet state
  const [showMobilePeek, setShowMobilePeek] = useState(false);

  const activeTemplate = useMemo(() => {
    return TEMPLATES.find((t) => t.id === selectedId) || TEMPLATES[0];
  }, [selectedId]);

  const activeAtmosphere = useMemo(() => {
    return ATMOSPHERES[activeTemplate.id] || ATMOSPHERES.proposal;
  }, [activeTemplate.id]);

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
    passcode: '',
  });

  const setField = (key, val) => setForm((prev) => ({ ...prev, [key]: val }));

  // Submission state
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  // Crafting screen note id
  const [createdId, setCreatedId] = useState(null);
  const [editingNoteId, setEditingNoteId] = useState(null);

  useEffect(() => {
    if (!editNoteParam) return;
    let active = true;
    getDoc(doc(db, 'notes', editNoteParam)).then((snapshot) => {
      if (!active) return;
      if (!snapshot.exists()) { setError('This draft could not be found.'); return; }
      const note = snapshot.data();
      if (note.is_paid) { router.replace(`/success?id=${encodeURIComponent(editNoteParam)}`); return; }
      const details = note.custom_details || {};
      const fill = (values, length) => Array.from({ length }, (_, index) => values?.[index] || '');
      setSelectedId(note.template || templateParam || 'proposal');
      setEditingNoteId(editNoteParam);
      setForm((current) => ({
        ...current,
        recipientName: note.recipient_name || '',
        senderName: details.sender_name || '',
        relationshipType: details.relationship_type || '',
        quotation: details.quotation || '',
        turningAge: details.turning_age || '',
        birthdayDate: details.birthday_date || '',
        balloonMessages: fill(details.balloon_messages, 5),
        anniversaryDate: details.anniversary_date || '',
        firstMetDate: details.first_met_date || '',
        journey: details.journey?.length ? details.journey : current.journey,
        reasons: fill(details.reasons, 5),
        whatHappenedType: details.what_happened_type || '',
        originCity: details.origin_city || '',
        destinationCity: details.destination_city || '',
        distanceKm: details.distance_km || '',
        cassettes: details.cassettes?.length ? details.cassettes : current.cassettes,
        letter: details.letter || note.custom_message || '',
        images: Array.isArray(note.image_urls) ? note.image_urls : [],
        passcode: details.passcode || '',
      }));
      setScreen('wizard');
    }).catch(() => { if (active) setError('Unable to load this gift for editing.'); });
    return () => { active = false; };
  }, [editNoteParam, router, templateParam]);

  // ── SELECT TEMPLATE ──
  const handleSelectTemplate = (id) => {
    playSfx('sparkle');
    setSelectedId(id);
    setStepIndex(0);
    setMaxStepReached(0);
    setError('');
    setScreen('wizard');
  };

  // ── NAVIGATION ──
  const steps = activeTemplate?.steps || [];
  const totalSteps = steps.length;
  const currentStep = steps[stepIndex];

  const goNext = () => {
    if (stepIndex < totalSteps - 1) {
      setDirection(1);
      const nextIndex = stepIndex + 1;
      setStepIndex(nextIndex);
      setMaxStepReached((prev) => Math.max(prev, nextIndex));
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

  const jumpToStep = (index) => {
    if (index >= 0 && index < totalSteps) {
      setDirection(index > stepIndex ? 1 : -1);
      setStepIndex(index);
      setError('');
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
    if (stepId === 'memories' && form.passcode && !/^\d{4}$/.test(form.passcode)) {
      return 'Your passcode must contain exactly 4 digits.';
    }
    return null;
  };

  const handleNext = () => {
    const err = validateStep();
    if (err) {
      setError(err);
      playSfx('waxSeal');
      return;
    }
    playSfx('sparkle');
    goNext();
  };

  // ── SUBMIT TO FIRESTORE ──
  const handleSubmit = async () => {
    setBusy(true);
    setError('');
    try {
      const docId = editingNoteId || nanoid(32);

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
          cassettes: form.cassettes.map((c) => ({
            id: c.id,
            title: c.title,
            track: c.track,
            note: c.note.trim() || `Thinking of you every time this comes to mind.`,
          })),
          letter: form.letter.trim(),
        };
      }

      if (form.passcode) customDetails.passcode = form.passcode;

      // Clean empty values
      Object.keys(customDetails).forEach((k) => {
        if (customDetails[k] === '' || customDetails[k] === null) delete customDetails[k];
      });

      const noteUpdate = {
        recipient_name: form.recipientName.trim(),
        custom_message: form.letter.trim(),
        image_urls: Array.isArray(form.images) ? form.images.filter((img) => typeof img === 'string') : [],
        custom_details: Object.keys(customDetails).length > 0 ? customDetails : null,
        template: selectedId,
        voice_note_url: null,
        updated_at: serverTimestamp(),
      };
      if (editingNoteId) {
        await updateDoc(doc(db, 'notes', docId), noteUpdate);
      } else {
        await setDoc(doc(db, 'notes', docId), {
          ...noteUpdate,
          creator_uid: getDeviceId(),
          is_paid: false,
          custom_slug: null,
          created_at: serverTimestamp(),
          expires_at: null,
        });
      }

      if (!editingNoteId && typeof window !== 'undefined') {
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
    <div
      className="lc-create-page relative min-h-screen overflow-x-hidden selection:bg-rose-200"
      style={{
        fontFamily: "'Inter', sans-serif",
        background: activeAtmosphere.pageBg,
        transition: 'background 0.8s ease',
      }}
    >
      {/* ── 1. Dynamic Atmosphere Glows ── */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden -z-0">
        <motion.div
          key={`glow-top-${activeTemplate.id}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          style={{
            position: 'absolute',
            top: '-12%',
            left: '25%',
            transform: 'translateX(-50%)',
            width: '720px',
            height: '520px',
            background: activeAtmosphere.primaryGlow,
            filter: 'blur(50px)',
          }}
        />
        <motion.div
          key={`glow-bottom-${activeTemplate.id}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          style={{
            position: 'absolute',
            bottom: '5%',
            right: '-10%',
            width: '680px',
            height: '620px',
            background: activeAtmosphere.secondaryGlow,
            filter: 'blur(60px)',
          }}
        />
      </div>

      {/* ── 2. Studio Header ── */}
      <header className="sticky top-0 z-40 backdrop-blur-2xl bg-white/85 border-b border-stone-200/70 shadow-[0_2px_12px_rgba(0,0,0,0.03)] px-4 sm:px-6 py-2.5 transition-colors duration-300">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Back Button with tactile press */}
          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            transition={springs.snappy}
            onClick={() => {
              playSfx('pop');
              if (screen === 'wizard') {
                goBack();
              } else {
                router.push('/templates');
              }
            }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 border border-stone-200/80 text-stone-700 hover:text-stone-900 text-xs sm:text-sm font-semibold shadow-xs transition-colors"
            aria-label="Back"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            <span>{screen === 'wizard' && stepIndex > 0 ? 'Back' : 'Templates'}</span>
          </motion.button>

          {/* Center: Template badge with icon */}
          <div className="flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-full bg-white/90 border border-stone-200/70 shadow-xs backdrop-blur-md">
            <span className="text-base sm:text-lg leading-none">{activeTemplate.emoji}</span>
            <span className="text-xs sm:text-sm font-bold text-stone-800 tracking-tight truncate max-w-[140px] sm:max-w-none">
              {activeTemplate.title}
            </span>
          </div>

          {/* Right: Sound toggle (🔊 / 🔇) */}
          <motion.button
            type="button"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.92 }}
            transition={springs.snappy}
            onClick={toggleSound}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold transition-all shadow-xs ${
              isMuted
                ? 'bg-stone-100 border-stone-300 text-stone-500'
                : 'bg-rose-50/90 border-rose-200 text-rose-700'
            }`}
            title={isMuted ? 'Sound effects muted (tap to enable)' : 'Sound effects active (tap to mute)'}
            aria-label={isMuted ? 'Unmute sound effects' : 'Mute sound effects'}
          >
            <span className="text-sm">{isMuted ? '🔇' : '🔊'}</span>
            <span className="hidden sm:inline">{isMuted ? 'Muted' : 'Sound'}</span>
          </motion.button>
        </div>
      </header>

      {/* ── Main Screen Router ── */}
      <AnimatePresence mode="wait">
        {screen === 'select' && (
          <SelectScreen key="select" templates={TEMPLATES} onSelect={handleSelectTemplate} />
        )}

        {screen === 'wizard' && selectedId && (
          <motion.div
            key="wizard"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={springs.smooth}
            className="w-full relative z-10"
          >
            {/* ── 3. Apple Segmented Step Ribbon ── */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-4 pb-2">
              <AppleStepRibbon
                steps={steps}
                currentIndex={stepIndex}
                maxStepReached={maxStepReached}
                onSelectStep={jumpToStep}
                accentColor={activeTemplate.accentColor}
              />
            </div>

            {/* ── 4. Split-Screen Studio Desk (Desktop) & Wizard (Mobile) ── */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-6">
              <div className="lg:grid lg:grid-cols-12 lg:gap-10 items-start">
                
                {/* Left Column: Interactive Wizard Desk */}
                <div className="lg:col-span-7 xl:col-span-7 flex flex-col justify-start">
                  <div className="bg-white/90 backdrop-blur-xl border border-stone-200/80 rounded-[28px] p-5 sm:p-7 shadow-[0_12px_40px_-10px_rgba(0,0,0,0.06)] relative overflow-hidden">
                    
                    <AnimatePresence custom={direction} mode="wait">
                      <motion.div
                        key={currentStep?.id || stepIndex}
                        custom={direction}
                        variants={{
                          enter: (dir) => ({ x: dir > 0 ? 30 : -30, opacity: 0 }),
                          center: { x: 0, opacity: 1, transition: springs.snappy },
                          exit: (dir) => ({ x: dir > 0 ? -25 : 25, opacity: 0, transition: { duration: 0.16 } }),
                        }}
                        initial="enter"
                        animate="center"
                        exit="exit"
                      >
                        <StepContent
                          stepId={currentStep?.id}
                          templateId={activeTemplate.id}
                          form={form}
                          setField={setField}
                          accent={activeTemplate.accentColor}
                          setError={setError}
                        />
                      </motion.div>
                    </AnimatePresence>

                    {/* Validation Error Message */}
                    <AnimatePresence>
                      {error && (
                        <motion.div
                          initial={{ opacity: 0, y: -8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className="mt-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200/80 text-rose-700 text-sm font-semibold flex items-center gap-2"
                        >
                          <span>⚠️</span>
                          <span>{error}</span>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Bottom Wizard Actions */}
                    <div className="mt-8 pt-5 border-t border-stone-100 flex items-center justify-between gap-3">
                      {stepIndex > 0 ? (
                        <motion.button
                          type="button"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.96 }}
                          transition={springs.snappy}
                          onClick={() => {
                            playSfx('pop');
                            goBack();
                          }}
                          className="px-5 py-3 rounded-xl border border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-700 text-sm font-bold transition-colors"
                        >
                          ← Previous
                        </motion.button>
                      ) : (
                        <div />
                      )}

                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.96 }}
                        transition={springs.snappy}
                        onClick={handleNext}
                        disabled={busy}
                        style={{
                          background: activeTemplate.gradient,
                          boxShadow: `0 6px 20px ${activeTemplate.glowColor}`,
                        }}
                        className="ml-auto px-7 py-3 rounded-xl text-white font-bold text-sm sm:text-base flex items-center gap-2 shadow-md hover:brightness-105 active:brightness-95 transition-all"
                      >
                        {busy ? (
                          <>
                            <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                            <span>Crafting...</span>
                          </>
                        ) : stepIndex === totalSteps - 1 ? (
                          <>
                            <span>✨</span>
                            <span>{editingNoteId ? 'Update My Gift' : 'Craft My Experience'}</span>
                          </>
                        ) : (
                          <>
                            <span>Continue</span>
                            <span>→</span>
                          </>
                        )}
                      </motion.button>
                    </div>

                  </div>
                </div>

                {/* Right Column: LiveStudioPreview (Desktop Split Screen) */}
                <div className="hidden lg:flex lg:col-span-5 xl:col-span-5 flex-col items-center sticky top-20 pt-1">
                  <LiveStudioPreview
                    template={activeTemplate}
                    form={form}
                    currentStepId={currentStep?.id}
                  />
                </div>

              </div>
            </div>

            {/* ── 4. Mobile Floating Glass Pill '👁️ Peek Live Gift' ── */}
            <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
              <motion.button
                type="button"
                onClick={() => {
                  playSfx('pop');
                  setShowMobilePeek(true);
                }}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.95 }}
                transition={springs.snappy}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/95 backdrop-blur-2xl border border-stone-300/80 text-stone-900 text-xs font-bold tracking-wide transition-all shadow-[0_12px_32px_rgba(0,0,0,0.18)]"
              >
                <span className="text-sm">👁️</span>
                <span>Peek Live Gift</span>
                <span className="relative flex h-2 w-2 ml-1">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
              </motion.button>
            </div>

            {/* ── 4. Mobile Bottom Sheet Peek Preview ── */}
            <AnimatePresence>
              {showMobilePeek && (
                <div className="fixed inset-0 z-50 flex items-end justify-center lg:hidden">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    onClick={() => setShowMobilePeek(false)}
                    className="fixed inset-0 bg-black/60 backdrop-blur-md"
                  />

                  <motion.div
                    initial={{ y: '100%' }}
                    animate={{ y: 0 }}
                    exit={{ y: '100%' }}
                    transition={springs.smooth}
                    className="relative w-full max-h-[92vh] bg-stone-900/95 backdrop-blur-3xl rounded-t-[34px] border-t border-white/15 p-4 sm:p-6 overflow-y-auto z-10 flex flex-col items-center shadow-2xl"
                  >
                    {/* Header with Grab Handle & Close */}
                    <div className="w-full flex items-center justify-between pb-3 mb-2 border-b border-white/10">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{activeTemplate.emoji}</span>
                        <span className="text-sm font-bold text-white">Live Gift Preview</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          playSfx('pop');
                          setShowMobilePeek(false);
                        }}
                        className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-sm font-bold transition-colors"
                        aria-label="Close Preview"
                      >
                        ✕
                      </button>
                    </div>

                    {/* Phone Mockup Preview Inside Sheet */}
                    <div className="w-full py-2 flex justify-center">
                      <LiveStudioPreview
                        template={activeTemplate}
                        form={form}
                        currentStepId={currentStep?.id}
                      />
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>

          </motion.div>
        )}

        {/* ── 6. Screen 3: Crafting Ceremony Integration ── */}
        {screen === 'crafting' && (
          <CraftingCeremony
            key="crafting"
            template={activeTemplate}
            recipientName={form.recipientName}
            noteId={createdId}
            router={router}
          />
        )}
      </AnimatePresence>

      <style jsx global>{`
        .lc-create-page { min-height: 70vh; isolation: isolate; color: #43332b; }
        .lc-create-page input, .lc-create-page textarea, .lc-create-page select {
          color: #43332b !important; background-color: #ffffff !important; border-color: #e2e8f0 !important;
        }
        .lc-create-page input::placeholder, .lc-create-page textarea::placeholder { color: #8a786c !important; }
        .lc-create-page :focus-visible { outline: 3px solid #f43f5e; outline-offset: 2px; }
        @media (prefers-reduced-motion: reduce) {
          .lc-create-page *, .lc-create-page *::before, .lc-create-page *::after {
            animation-duration: .01ms !important; animation-iteration-count: 1 !important; transition-duration: .01ms !important;
          }
        }
      `}</style>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   APPLE SEGMENTED STEP RIBBON
───────────────────────────────────────────────────────── */
function AppleStepRibbon({ steps, currentIndex, maxStepReached, onSelectStep, accentColor }) {
  return (
    <div className="w-full flex justify-center">
      <nav
        aria-label="Studio steps ribbon"
        className="relative flex items-center gap-1 sm:gap-1.5 p-1.5 bg-white/80 backdrop-blur-xl border border-stone-200/80 rounded-full shadow-[0_4px_16px_rgba(0,0,0,0.03)] overflow-x-auto max-w-full"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {steps.map((step, idx) => {
          const isActive = idx === currentIndex;
          const isCompleted = idx < currentIndex;
          const isClickable = idx <= maxStepReached;

          return (
            <motion.button
              key={step.id}
              type="button"
              disabled={!isClickable}
              onClick={() => onSelectStep(idx)}
              whileHover={isClickable && !isActive ? { scale: 1.02 } : {}}
              whileTap={isClickable ? { scale: 0.95 } : {}}
              transition={springs.snappy}
              className={`relative z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors duration-200 ${
                isActive
                  ? 'text-stone-900 font-bold'
                  : isCompleted
                  ? 'text-stone-700 hover:text-stone-900 cursor-pointer'
                  : 'text-stone-400 cursor-not-allowed opacity-60'
              }`}
            >
              {/* Apple gliding active pill indicator */}
              {isActive && (
                <motion.div
                  layoutId="activeStepRibbon"
                  className="absolute inset-0 rounded-full bg-white shadow-sm border border-stone-200/90 -z-10"
                  transition={springs.gliding}
                />
              )}

              <span className="text-sm leading-none">{step.icon || '✨'}</span>
              <span>{step.label}</span>
              {isCompleted && !isActive && (
                <span className="text-[10px] text-emerald-600 font-bold ml-0.5">✓</span>
              )}
            </motion.button>
          );
        })}
      </nav>
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
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.35 }}
      className="max-w-4xl mx-auto px-4 sm:px-6 pt-10 pb-16 flex flex-col items-center relative z-10"
    >
      <div className="text-center mb-8">
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={springs.snappy}
          className="inline-block text-xs font-bold tracking-widest uppercase text-rose-700 bg-rose-50 border border-rose-200 px-4 py-1 rounded-full mb-3 shadow-xs"
        >
          ✨ LovelyCrafts Studio
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{ fontFamily: "'Dancing Script', cursive" }}
          className="text-4xl sm:text-5xl md:text-6xl font-bold bg-gradient-to-r from-rose-600 via-pink-600 to-amber-600 bg-clip-text text-transparent pb-2"
        >
          What would you like to craft?
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-stone-600 text-sm sm:text-base max-w-md mx-auto mt-2"
        >
          Choose an occasion. We'll help you sculpt an unforgettable personalized experience.
        </motion.p>
      </div>

      {/* Grid of templates */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-xl">
        {templates.map((tmpl, i) => (
          <motion.button
            key={tmpl.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.06, ...springs.snappy }}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => onSelect(tmpl.id)}
            className="flex flex-col items-center text-center p-6 rounded-3xl bg-white/90 backdrop-blur-xl border border-stone-200/90 hover:border-rose-300 shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_16px_40px_rgba(244,63,94,0.12)] transition-all cursor-pointer relative overflow-hidden group"
          >
            <div className="text-4xl mb-3 filter drop-shadow-sm group-hover:scale-110 transition-transform">
              {tmpl.emoji}
            </div>
            <h3 className="font-bold text-stone-900 text-base mb-1">{tmpl.title}</h3>
            <p className="text-stone-500 text-xs mb-3">{tmpl.time}</p>
            <span
              style={{
                backgroundColor: `${tmpl.accentColor}15`,
                color: tmpl.accentColor,
                borderColor: `${tmpl.accentColor}30`,
              }}
              className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border"
            >
              ✨ Tap to craft
            </span>
          </motion.button>
        ))}
      </div>
    </motion.div>
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
      return <StepQuotation form={form} setField={setField} accent={accent} templateId={templateId} />;
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
    <div className="mb-5">
      <div className="text-3xl mb-1.5 filter drop-shadow-sm">{icon}</div>
      <h2 className="text-xl sm:text-2xl font-bold text-stone-900 tracking-tight mb-1">{title}</h2>
      {subtitle && <p className="text-stone-600 text-xs sm:text-sm leading-relaxed">{subtitle}</p>}
    </div>
  );
}

function FieldLabel({ children }) {
  return (
    <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
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
      className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-white text-stone-900 text-sm font-medium focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 transition-all shadow-xs"
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
      className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-white text-stone-900 text-sm font-medium focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 transition-all shadow-xs resize-none leading-relaxed"
    />
  );
}

/* ─────────────────────────────────────────────────────────
   STEP COMPONENTS WITH INSPIRATION VAULT & AUDIO FEEDBACK
───────────────────────────────────────────────────────── */

// STEP: Person Details
function StepPersonDetails({ templateId, form, setField, accent }) {
  return (
    <div>
      <StepHeader
        icon="👤"
        title="Tell us about you both"
        subtitle="These names will appear throughout your customized experience."
      />
      <div className="flex flex-col gap-4">
        <div>
          <FieldLabel>Their Name *</FieldLabel>
          <TextInput
            value={form.recipientName}
            onChange={(v) => setField('recipientName', v)}
            placeholder="e.g. Priya, Alex, Bestie..."
          />
        </div>
        <div>
          <FieldLabel>Your Name *</FieldLabel>
          <TextInput
            value={form.senderName}
            onChange={(v) => setField('senderName', v)}
            placeholder="e.g. Rahul, Your name..."
          />
        </div>
        {templateId === 'birthday' && (
          <>
            <div>
              <FieldLabel>Turning Age *</FieldLabel>
              <TextInput
                value={form.turningAge}
                onChange={(v) => setField('turningAge', v)}
                placeholder="e.g. 21, 25, 30..."
              />
            </div>
            <div>
              <FieldLabel>Their Birthday</FieldLabel>
              <TextInput
                value={form.birthdayDate}
                onChange={(v) => setField('birthdayDate', v)}
                placeholder="e.g. 15 March, August 7..."
              />
            </div>
          </>
        )}
        {templateId === 'anniversary' && (
          <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200/70 text-xs text-amber-900 font-medium">
            💡 You will set your anniversary timeline and milestone dates in the following steps.
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
      <StepHeader
        icon="💞"
        title="Who are they to you?"
        subtitle="This helps tailor the interactive reveal and tone."
      />
      <div className="grid grid-cols-2 gap-3">
        {RELATIONSHIP_OPTIONS.map((opt) => {
          const isSelected = form.relationshipType === opt.id;
          return (
            <motion.button
              key={opt.id}
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
              transition={springs.snappy}
              onClick={() => {
                playSfx('pop');
                setField('relationshipType', opt.id);
              }}
              style={{
                borderColor: isSelected ? accent : undefined,
                backgroundColor: isSelected ? `${accent}12` : '#ffffff',
              }}
              className={`p-4 rounded-2xl border flex flex-col items-center gap-1.5 text-center transition-all shadow-xs ${
                isSelected ? 'border-2 text-stone-900 font-bold' : 'border-stone-200 text-stone-700 font-semibold'
              }`}
            >
              <span className="text-2xl">{opt.emoji}</span>
              <span className="text-sm">{opt.label}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

// STEP: Quotation (Proposal)
function StepQuotation({ form, setField, accent, templateId }) {
  return (
    <div>
      <StepHeader
        icon="💬"
        title="A confession quote"
        subtitle="Choose a meaningful quote or write one straight from your heart."
      />
      <div className="flex flex-col gap-2.5 mb-4">
        {PROPOSAL_QUOTES.map((q) => {
          const isSelected = form.quotation === q;
          return (
            <motion.button
              key={q}
              type="button"
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                playSfx('pop');
                setField('quotation', isSelected ? '' : q);
              }}
              style={{
                borderColor: isSelected ? accent : undefined,
                backgroundColor: isSelected ? `${accent}10` : '#ffffff',
              }}
              className={`text-left p-3.5 rounded-xl border text-xs sm:text-sm transition-all shadow-xs ${
                isSelected ? 'border-2 text-stone-900 font-bold' : 'border-stone-200 text-stone-700 font-medium'
              }`}
            >
              {q}
            </motion.button>
          );
        })}
      </div>

      <FieldLabel>Or write your own quote</FieldLabel>
      <TextArea
        rows={3}
        value={PROPOSAL_QUOTES.includes(form.quotation) ? '' : form.quotation}
        onChange={(v) => setField('quotation', v)}
        placeholder="Write something heartfelt..."
      />

      {/* Inspiration Vault for quotation */}
      <InspirationVault
        templateId={templateId || 'proposal'}
        stepId="quotation"
        onSelectPrompt={(prompt) => {
          setField('quotation', prompt);
        }}
      />
    </div>
  );
}

// STEP: Cake (Birthday)
function StepCake({ form, setField, accent }) {
  return (
    <div>
      <StepHeader
        icon="🎂"
        title="Choose their celebration cake"
        subtitle="This virtual cake will be presented with interactive sparklers."
      />
      <div className="flex flex-col gap-3">
        {CAKE_OPTIONS.map((cake) => {
          const isSelected = form.cakeType === cake.id;
          return (
            <motion.button
              key={cake.id}
              type="button"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.96 }}
              transition={springs.snappy}
              onClick={() => {
                playSfx('pop');
                setField('cakeType', cake.id);
              }}
              style={{
                backgroundColor: isSelected ? cake.bg : '#ffffff',
                borderColor: isSelected ? cake.accent : '#e2e8f0',
                color: isSelected ? '#ffffff' : '#0f172a',
              }}
              className={`flex items-center gap-3.5 p-3.5 sm:p-4 rounded-2xl border text-left transition-all shadow-xs ${
                isSelected ? 'border-2 shadow-md' : ''
              }`}
            >
              <span className="text-3xl">{cake.emoji}</span>
              <div className="flex-1">
                <div className="font-bold text-sm sm:text-base">{cake.label}</div>
                <div className={`text-xs ${isSelected ? 'text-white/80' : 'text-stone-500'}`}>{cake.desc}</div>
              </div>
              {isSelected && <span className="text-lg font-bold">✓</span>}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

// STEP: Balloons (Birthday) with InspirationVault
function StepBalloons({ form, setField, accent }) {
  const updateBalloon = (index, val) => {
    const updated = [...form.balloonMessages];
    updated[index] = val;
    setField('balloonMessages', updated);
  };

  const handleSelectBalloonPrompt = (prompt) => {
    const updated = [...form.balloonMessages];
    const emptyIndex = updated.findIndex((m) => !m?.trim());
    if (emptyIndex !== -1) {
      updated[emptyIndex] = prompt;
    } else {
      updated[0] = prompt;
    }
    setField('balloonMessages', updated);
  };

  return (
    <div>
      <StepHeader
        icon="🎈"
        title="Balloon pop reveals"
        subtitle="Add up to 5 surprise messages — one per balloon. They will pop with sound effects!"
      />

      <div className="flex flex-col gap-2.5">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center text-sm flex-shrink-0">
              🎈
            </div>
            <input
              type="text"
              value={form.balloonMessages[i] || ''}
              onChange={(e) => updateBalloon(i, e.target.value)}
              placeholder={`Message ${i + 1}... (e.g. "You light up my life")`}
              className="flex-1 px-3.5 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-900 text-sm focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 shadow-xs"
            />
          </div>
        ))}
      </div>

      {/* ── 5. Integrated InspirationVault for Balloons ── */}
      <InspirationVault
        templateId="birthday"
        stepId="balloons"
        onSelectPrompt={handleSelectBalloonPrompt}
      />
    </div>
  );
}

// STEP: Special Dates (Anniversary)
function StepSpecialDates({ form, setField, accent }) {
  return (
    <div>
      <StepHeader
        icon="📅"
        title="Your special dates"
        subtitle="These dates anchor the live anniversary odometer."
      />
      <div className="flex flex-col gap-4">
        <div>
          <FieldLabel>Anniversary Date *</FieldLabel>
          <TextInput
            value={form.anniversaryDate}
            onChange={(v) => setField('anniversaryDate', v)}
            placeholder="e.g. 12 February 2022, Feb 12 2022..."
          />
        </div>
        <div>
          <FieldLabel>The Day You First Met (optional)</FieldLabel>
          <TextInput
            value={form.firstMetDate}
            onChange={(v) => setField('firstMetDate', v)}
            placeholder="e.g. June 5, 2020..."
          />
        </div>
        <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200/70 text-xs text-amber-900 font-semibold">
          🥂 The gift will display a live timer counting every year, month, day, and second since you fell in love.
        </div>
      </div>
    </div>
  );
}

// STEP: Journey Together (Anniversary)
function StepJourney({ form, setField, accent }) {
  const updateJourney = (index, field, val) => {
    const updated = form.journey.map((j, i) => (i === index ? { ...j, [field]: val } : j));
    setField('journey', updated);
  };

  const addEvent = () => {
    if (form.journey.length < 5) {
      playSfx('pop');
      setField('journey', [...form.journey, { date: '', memory: '' }]);
    }
  };

  const removeEvent = (index) => {
    if (form.journey.length > 1) {
      playSfx('pop');
      setField('journey', form.journey.filter((_, i) => i !== index));
    }
  };

  return (
    <div>
      <StepHeader
        icon="🗺️"
        title="Your story roadmap"
        subtitle="Add memorable milestones to build a visual relationship timeline."
      />
      <div className="flex flex-col gap-3">
        {form.journey.map((event, i) => (
          <div key={i} className="p-3.5 rounded-2xl bg-white border border-stone-200 shadow-xs flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-500">Milestone {i + 1}</span>
              {form.journey.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeEvent(i)}
                  className="text-stone-400 hover:text-rose-600 text-sm font-bold"
                >
                  ✕
                </button>
              )}
            </div>
            <input
              type="text"
              value={event.date}
              onChange={(e) => updateJourney(i, 'date', e.target.value)}
              placeholder="Date (e.g. March 2021)"
              className="w-full px-3 py-2 rounded-lg border border-stone-200 bg-stone-50 text-xs font-medium"
            />
            <input
              type="text"
              value={event.memory}
              onChange={(e) => updateJourney(i, 'memory', e.target.value)}
              placeholder="Memory (e.g. Our first road trip to the hills)"
              className="w-full px-3 py-2 rounded-lg border border-stone-200 bg-stone-50 text-xs font-medium"
            />
          </div>
        ))}

        {form.journey.length < 5 && (
          <motion.button
            type="button"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.97 }}
            transition={springs.snappy}
            onClick={addEvent}
            className="w-full py-2.5 rounded-xl border border-dashed border-rose-300 text-rose-600 font-bold text-xs bg-rose-50/50 hover:bg-rose-50"
          >
            + Add Another Milestone
          </motion.button>
        )}
      </div>
    </div>
  );
}

// STEP: Reasons (Anniversary) with InspirationVault
function StepReasons({ form, setField, accent }) {
  const updateReason = (i, val) => {
    const updated = [...form.reasons];
    updated[i] = val;
    setField('reasons', updated);
  };

  const handleSelectReasonPrompt = (prompt) => {
    const updated = [...form.reasons];
    const emptyIndex = updated.findIndex((r) => !r?.trim());
    if (emptyIndex !== -1) {
      updated[emptyIndex] = prompt;
    } else {
      updated[0] = prompt;
    }
    setField('reasons', updated);
  };

  return (
    <div>
      <StepHeader
        icon="❤️"
        title="Why you love them"
        subtitle="Up to 5 reasons that will burst out of floating heart balloons."
      />
      <div className="flex flex-col gap-2.5">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-rose-50 border border-rose-200 text-rose-600 font-bold flex items-center justify-center text-xs flex-shrink-0">
              {i + 1}
            </div>
            <input
              type="text"
              value={form.reasons[i] || ''}
              onChange={(e) => updateReason(i, e.target.value)}
              placeholder={`Reason ${i + 1}... (e.g. "The way your laugh makes me feel")`}
              className="flex-1 px-3.5 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-900 text-sm focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 shadow-xs"
            />
          </div>
        ))}
      </div>

      {/* ── 5. Integrated InspirationVault for Reasons ── */}
      <InspirationVault
        templateId="anniversary"
        stepId="reasons"
        onSelectPrompt={handleSelectReasonPrompt}
      />
    </div>
  );
}

// STEP: What Happened (Apology)
function StepWhatHappened({ form, setField, accent }) {
  return (
    <div>
      <StepHeader
        icon="💔"
        title="What happened?"
        subtitle="Vulnerability and sincerity are the fastest path to healing."
      />
      <div className="flex flex-col gap-2.5">
        {WHAT_HAPPENED_OPTIONS.map((opt) => {
          const isSelected = form.whatHappenedType === opt.id;
          return (
            <motion.button
              key={opt.id}
              type="button"
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                playSfx('pop');
                setField('whatHappenedType', opt.id);
              }}
              style={{
                borderColor: isSelected ? accent : undefined,
                backgroundColor: isSelected ? `${accent}12` : '#ffffff',
              }}
              className={`text-left p-3.5 rounded-2xl border flex items-center gap-3 transition-all shadow-xs ${
                isSelected ? 'border-2 text-stone-900 font-bold' : 'border-stone-200 text-stone-700 font-medium'
              }`}
            >
              <span className="text-2xl">{opt.emoji}</span>
              <span className="flex-1 text-sm">{opt.label}</span>
              {isSelected && <span className="font-bold">✓</span>}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

// STEP: Memories / Photos (Shared)
function StepMemories({ form, setField, accent, templateId }) {
  const maxPhotos = templateId === 'birthday' ? 5 : templateId === 'anniversary' ? 5 : 3;

  return (
    <div>
      <StepHeader
        icon="📸"
        title="Cherished memories"
        subtitle={`Upload up to ${maxPhotos} photos — they will be presented as polaroids with heartfelt captions.`}
      />
      <CloudinaryUpload
        images={form.images}
        setImages={(imgs) => setField('images', imgs)}
        maxImages={maxPhotos}
      />
      {form.images.length === 0 && (
        <div className="mt-3 p-3 rounded-xl bg-stone-50 border border-dashed border-stone-300 text-stone-600 text-xs text-center font-medium">
          Photos are optional, but adding them makes the reveal 10x more magical 💫
        </div>
      )}

      {/* Optional Passcode Shield */}
      <div className="mt-5 p-4 rounded-2xl bg-gradient-to-br from-stone-50 to-rose-50/30 border border-stone-200/80 shadow-xs">
        <label htmlFor="gift-passcode" className="block text-stone-800 font-bold text-sm">
          Add a 4-digit secret passcode (optional)
        </label>
        <p className="text-stone-500 text-xs mt-1 mb-2">
          Your recipient will need to enter this secret code before opening the envelope.
        </p>
        <input
          id="gift-passcode"
          type="password"
          inputMode="numeric"
          autoComplete="new-password"
          pattern="[0-9]{4}"
          maxLength={4}
          placeholder="••••"
          value={form.passcode || ''}
          onChange={(e) => setField('passcode', e.target.value.replace(/\D/g, '').slice(0, 4))}
          className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-900 text-center tracking-[0.4em] font-mono text-base focus:border-rose-500 shadow-xs"
        />
        <span className="block text-[11px] text-stone-500 mt-1">Leave blank to allow opening without a code.</span>
      </div>
    </div>
  );
}

// STEP: Distance Radar (I Miss You)
function StepDistanceRadar({ form, setField, accent }) {
  return (
    <div>
      <StepHeader
        icon="📍"
        title="Orbital Distance Radar"
        subtitle="Connect your two cities across the celestial map."
      />
      <div className="flex flex-col gap-4">
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
            placeholder="e.g. 7,192 km"
          />
        </div>
      </div>
    </div>
  );
}

// STEP: Cassette Tapes (I Miss You)
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
        subtitle="Add a memory or dedicate a soundtrack song to each tape."
      />
      <div className="flex flex-col gap-3">
        {cassettes.map((c, i) => (
          <div key={c.id || i} className="p-3.5 rounded-2xl border border-stone-200 bg-white shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-indigo-600">TAPE 0{i + 1}</span>
              <span className="text-xs text-stone-500 font-medium">{c.track}</span>
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

// STEP: Letter (Shared) with InspirationVault
function StepLetter({ templateId, form, setField, accent }) {
  const prompts = {
    proposal: "Write from your heart — this will be typewritten on a parchment letter after they click YES...",
    birthday: "Write a heartfelt birthday letter — it will appear line by line in a beautiful envelope...",
    anniversary: "A love letter to close the experience — take your time, it will be presented beautifully...",
    'emotional-apology': "Pour your heart out — this becomes the handwritten letter they will read...",
    'i-miss-you': "Write your unsent letter across the miles — every word matters...",
  };

  const charCount = form.letter.length;

  return (
    <div>
      <StepHeader
        icon="✉️"
        title={templateId === 'emotional-apology' ? 'Write from your heart' : 'Your heartfelt letter'}
        subtitle="This letter will be revealed line-by-line in their ceremonial keepsake."
      />

      <div className="relative">
        <TextArea
          value={form.letter}
          onChange={(v) => setField('letter', v)}
          placeholder={prompts[templateId] || "Write your heartfelt message here..."}
          rows={7}
        />
        <div className="text-right text-xs text-stone-500 mt-1 font-medium">
          {charCount} characters
        </div>
      </div>

      {/* ── 5. Integrated InspirationVault for Letter ── */}
      <InspirationVault
        templateId={templateId}
        stepId="letter"
        onSelectPrompt={(prompt) => {
          setField('letter', prompt);
        }}
      />
    </div>
  );
}
