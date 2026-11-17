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
      <header
        className="lc-studio-header"
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          background: 'rgba(255, 255, 255, 0.88)',
          borderBottom: '1px solid rgba(226, 232, 240, 0.85)',
          boxShadow: '0 2px 12px rgba(0, 0, 0, 0.03)',
          padding: '10px 16px',
        }}
      >
        <div
          className="lc-studio-header-inner"
          style={{
            maxWidth: '1240px',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
          }}
        >
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
            className="lc-studio-back-btn"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 16px',
              borderRadius: '999px',
              background: 'rgba(255, 255, 255, 0.95)',
              border: '1px solid rgba(203, 213, 225, 0.8)',
              color: '#334155',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 1px 4px rgba(0, 0, 0, 0.04)',
              fontFamily: "'Inter', sans-serif",
            }}
            aria-label="Back"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            <span>{screen === 'wizard' && stepIndex > 0 ? 'Back' : 'Templates'}</span>
          </motion.button>

          {/* Center: Template badge with icon */}
          <div
            className="lc-studio-template-pill"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 16px',
              borderRadius: '999px',
              background: 'rgba(255, 255, 255, 0.92)',
              border: '1px solid rgba(226, 232, 240, 0.85)',
              boxShadow: '0 1px 4px rgba(0, 0, 0, 0.03)',
              fontWeight: 700,
              fontSize: '0.88rem',
              color: '#0f172a',
              fontFamily: "'Inter', sans-serif",
            }}
          >
            <span style={{ fontSize: '1.1rem', lineHeight: 1 }}>{activeTemplate.emoji}</span>
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '200px' }}>
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
            className="lc-studio-sound-btn"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 14px',
              borderRadius: '999px',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
              background: isMuted ? '#f1f5f9' : '#fff1f2',
              border: isMuted ? '1px solid #cbd5e1' : '1px solid #fecdd3',
              color: isMuted ? '#64748b' : '#be123c',
              fontFamily: "'Inter', sans-serif",
            }}
            title={isMuted ? 'Sound effects muted (tap to enable)' : 'Sound effects active (tap to mute)'}
            aria-label={isMuted ? 'Unmute sound effects' : 'Mute sound effects'}
          >
            <span>{isMuted ? '🔇' : '🔊'}</span>
            <span>{isMuted ? 'Muted' : 'Sound'}</span>
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
            style={{ width: '100%', position: 'relative', zIndex: 10 }}
          >
            {/* ── 3. Apple Segmented Step Ribbon ── */}
            <div className="lc-studio-ribbon-container">
              <AppleStepRibbon
                steps={steps}
                currentIndex={stepIndex}
                maxStepReached={maxStepReached}
                onSelectStep={jumpToStep}
                accentColor={activeTemplate.accentColor}
              />
            </div>

            {/* ── 4. Split-Screen Studio Desk (Desktop) & Wizard (Mobile) ── */}
            <div className="lc-studio-desk-wrapper">
              <div className="lc-studio-split">
                
                {/* Left Column: Interactive Wizard Desk */}
                <div className="lc-studio-form-col">
                  <div className="lc-studio-card">
                    
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
                          style={{
                            marginTop: '16px',
                            padding: '12px 16px',
                            borderRadius: '14px',
                            background: '#fff1f2',
                            border: '1px solid #fecdd3',
                            color: '#e11d48',
                            fontSize: '0.88rem',
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontFamily: "'Inter', sans-serif",
                          }}
                        >
                          <span>⚠️</span>
                          <span>{error}</span>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Bottom Wizard Actions */}
                    <div className="lc-studio-actions">
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
                          className="lc-studio-prev-btn"
                          style={{
                            padding: '11px 20px',
                            borderRadius: '14px',
                            border: '1.5px solid #cbd5e1',
                            background: '#f8fafc',
                            color: '#334155',
                            fontSize: '0.88rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            fontFamily: "'Inter', sans-serif",
                          }}
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
                          marginLeft: 'auto',
                          padding: '12px 28px',
                          borderRadius: '14px',
                          border: 'none',
                          background: activeTemplate.gradient,
                          color: '#ffffff',
                          fontSize: '0.95rem',
                          fontWeight: 700,
                          cursor: busy ? 'not-allowed' : 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '8px',
                          boxShadow: `0 8px 24px ${activeTemplate.glowColor}`,
                          opacity: busy ? 0.7 : 1,
                          fontFamily: "'Inter', sans-serif",
                        }}
                        className="lc-studio-next-btn"
                      >
                        {busy ? (
                          <>
                            <div style={{ width: '16px', height: '16px', borderRadius: '50%', border: '2px solid #ffffff', borderTopColor: 'transparent', animation: 'spin 1s linear infinite' }} />
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
                <div className="lc-studio-preview-col">
                  <LiveStudioPreview
                    template={activeTemplate}
                    form={form}
                    currentStepId={currentStep?.id}
                  />
                </div>

              </div>
            </div>

            {/* ── 4. Mobile Floating Glass Pill '👁️ Peek Live Gift' ── */}
            <div className="lc-studio-mobile-peek-trigger">
              <motion.button
                type="button"
                onClick={() => {
                  playSfx('pop');
                  setShowMobilePeek(true);
                }}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.95 }}
                transition={springs.snappy}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 20px',
                  borderRadius: '999px',
                  background: 'rgba(255, 255, 255, 0.96)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  border: '1px solid rgba(203, 213, 225, 0.9)',
                  color: '#0f172a',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  boxShadow: '0 12px 32px rgba(0,0,0,0.18)',
                  cursor: 'pointer',
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                <span style={{ fontSize: '0.95rem' }}>👁️</span>
                <span>Peek Live Gift</span>
                <span style={{ position: 'relative', display: 'flex', width: '8px', height: '8px', marginLeft: '4px' }}>
                  <span style={{ position: 'absolute', width: '100%', height: '100%', borderRadius: '50%', background: '#34d399', opacity: 0.75 }} />
                  <span style={{ position: 'relative', width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }} />
                </span>
              </motion.button>
            </div>

            {/* ── 4. Mobile Bottom Sheet Peek Preview ── */}
            <AnimatePresence>
              {showMobilePeek && (
                <div
                  style={{
                    position: 'fixed',
                    inset: 0,
                    zIndex: 100,
                    display: 'flex',
                    alignItems: 'flex-end',
                    justifyContent: 'center',
                  }}
                >
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    onClick={() => setShowMobilePeek(false)}
                    style={{
                      position: 'fixed',
                      inset: 0,
                      background: 'rgba(0, 0, 0, 0.65)',
                      backdropFilter: 'blur(8px)',
                      WebkitBackdropFilter: 'blur(8px)',
                    }}
                  />

                  <motion.div
                    initial={{ y: '100%' }}
                    animate={{ y: 0 }}
                    exit={{ y: '100%' }}
                    transition={springs.smooth}
                    style={{
                      position: 'relative',
                      width: '100%',
                      maxHeight: '92vh',
                      background: 'rgba(23, 23, 23, 0.98)',
                      backdropFilter: 'blur(24px)',
                      WebkitBackdropFilter: 'blur(24px)',
                      borderTopLeftRadius: '32px',
                      borderTopRightRadius: '32px',
                      borderTop: '1px solid rgba(255, 255, 255, 0.15)',
                      padding: '20px 16px 32px',
                      overflowY: 'auto',
                      zIndex: 10,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      boxShadow: '0 -20px 50px rgba(0,0,0,0.5)',
                      boxSizing: 'border-box',
                    }}
                  >
                    {/* Header with Grab Handle & Close */}
                    <div
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        paddingBottom: '12px',
                        marginBottom: '8px',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '1.1rem' }}>{activeTemplate.emoji}</span>
                        <span style={{ fontSize: '0.92rem', fontWeight: 700, color: '#ffffff', fontFamily: "'Inter', sans-serif" }}>
                          Live Gift Preview
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          playSfx('pop');
                          setShowMobilePeek(false);
                        }}
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          background: 'rgba(255, 255, 255, 0.15)',
                          color: '#ffffff',
                          border: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.85rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                        aria-label="Close Preview"
                      >
                        ✕
                      </button>
                    </div>

                    {/* Phone Mockup Preview Inside Sheet */}
                    <div style={{ width: '100%', padding: '8px 0', display: 'flex', justifyContent: 'center' }}>
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
    <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
      <nav
        aria-label="Studio steps ribbon"
        className="lc-studio-ribbon"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 10px',
          background: 'rgba(255, 255, 255, 0.88)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          border: '1px solid rgba(226, 232, 240, 0.9)',
          borderRadius: '999px',
          boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
          maxWidth: '100%',
          overflowX: 'auto',
          boxSizing: 'border-box',
        }}
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
              className="lc-studio-ribbon-tab"
              style={{
                position: 'relative',
                zIndex: 10,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 14px',
                borderRadius: '999px',
                fontSize: '0.82rem',
                fontWeight: isActive ? 700 : 600,
                color: isActive ? '#0f172a' : isCompleted ? '#334155' : '#94a3b8',
                border: 'none',
                background: 'transparent',
                cursor: isClickable ? 'pointer' : 'not-allowed',
                whiteSpace: 'nowrap',
                transition: 'color 0.2s ease',
                fontFamily: "'Inter', sans-serif",
                opacity: !isClickable && !isActive ? 0.6 : 1,
              }}
            >
              {/* Apple gliding active pill indicator */}
              {isActive && (
                <motion.div
                  layoutId="activeStepRibbon"
                  style={{
                    position: 'absolute',
                    inset: 0,
                    borderRadius: '999px',
                    background: '#ffffff',
                    border: '1px solid rgba(203, 213, 225, 0.9)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                    zIndex: -1,
                  }}
                  transition={springs.gliding}
                />
              )}

              <span style={{ fontSize: '0.95rem', lineHeight: 1 }}>{step.icon || '✨'}</span>
              <span>{step.label}</span>
              {isCompleted && !isActive && (
                <span style={{ fontSize: '10px', color: '#10b981', fontWeight: 800, marginLeft: '2px' }}>✓</span>
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
      style={{
        maxWidth: '860px',
        margin: '0 auto',
        padding: '40px 16px 64px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'relative',
        zIndex: 10,
        boxSizing: 'border-box',
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={springs.snappy}
          style={{
            display: 'inline-block',
            fontSize: '0.72rem',
            fontWeight: 800,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: '#be123c',
            background: 'rgba(244,63,94,0.1)',
            border: '1px solid rgba(244,63,94,0.25)',
            padding: '6px 16px',
            borderRadius: '999px',
            marginBottom: '12px',
            boxShadow: '0 2px 8px rgba(244,63,94,0.08)',
          }}
        >
          ✨ LovelyCrafts Studio
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{
            fontFamily: "'Dancing Script', cursive",
            fontSize: 'clamp(2.4rem, 6vw, 3.8rem)',
            fontWeight: 700,
            background: 'linear-gradient(135deg, #e11d48 0%, #db2777 50%, #d97706 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            margin: '0 0 8px',
            lineHeight: 1.25,
          }}
        >
          What would you like to craft?
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          style={{ color: '#64748b', fontSize: '0.95rem', maxWidth: '440px', margin: '0 auto', lineHeight: 1.6 }}
        >
          Choose an occasion. We'll help you sculpt an unforgettable personalized experience.
        </motion.p>
      </div>

      {/* Grid of templates */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '16px',
          width: '100%',
          maxWidth: '580px',
        }}
      >
        {templates.map((tmpl, i) => (
          <motion.button
            key={tmpl.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.06, ...springs.snappy }}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => onSelect(tmpl.id)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              padding: '24px 20px',
              borderRadius: '24px',
              background: 'rgba(255, 255, 255, 0.92)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1.5px solid rgba(226, 232, 240, 0.9)',
              boxShadow: '0 8px 30px rgba(0,0,0,0.04)',
              cursor: 'pointer',
              position: 'relative',
              overflow: 'hidden',
              fontFamily: "'Inter', sans-serif",
            }}
          >
            <div style={{ fontSize: '2.5rem', marginBottom: '10px', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.08))' }}>
              {tmpl.emoji}
            </div>
            <h3 style={{ fontWeight: 800, color: '#0f172a', fontSize: '1rem', margin: '0 0 4px', lineHeight: 1.3 }}>
              {tmpl.title}
            </h3>
            <p style={{ color: '#64748b', fontSize: '0.78rem', margin: '0 0 12px' }}>
              {tmpl.time}
            </p>
            <span
              style={{
                backgroundColor: `${tmpl.accentColor}15`,
                color: tmpl.accentColor,
                border: `1px solid ${tmpl.accentColor}35`,
                padding: '4px 12px',
                borderRadius: '999px',
                fontSize: '0.72rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}
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
    <div style={{ marginBottom: '20px' }}>
      <div style={{ fontSize: '2.2rem', marginBottom: '6px', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.06))' }}>{icon}</div>
      <h2
        className="lc-studio-header-title"
        style={{
          fontSize: '1.45rem',
          fontWeight: 800,
          color: '#0f172a',
          margin: '0 0 4px',
          lineHeight: 1.3,
          fontFamily: "'Inter', sans-serif",
          letterSpacing: '-0.02em',
        }}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          className="lc-studio-header-subtitle"
          style={{
            color: '#64748b',
            fontSize: '0.88rem',
            margin: 0,
            lineHeight: 1.55,
            fontFamily: "'Inter', sans-serif",
          }}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}

function FieldLabel({ children }) {
  return (
    <label
      className="lc-studio-label"
      style={{
        display: 'block',
        fontSize: '0.78rem',
        fontWeight: 700,
        color: '#475569',
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
        marginBottom: '6px',
        fontFamily: "'Inter', sans-serif",
      }}
    >
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
      className="lc-studio-input"
      style={{
        width: '100%',
        padding: '13px 16px',
        borderRadius: '14px',
        border: '1.5px solid #cbd5e1',
        background: '#ffffff',
        fontSize: '0.92rem',
        fontWeight: 500,
        color: '#0f172a',
        outline: 'none',
        transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
        boxSizing: 'border-box',
        fontFamily: "'Inter', sans-serif",
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
      className="lc-studio-textarea"
      style={{
        width: '100%',
        padding: '13px 16px',
        borderRadius: '14px',
        border: '1.5px solid #cbd5e1',
        background: '#ffffff',
        fontSize: '0.92rem',
        fontWeight: 500,
        color: '#0f172a',
        outline: 'none',
        transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
        boxSizing: 'border-box',
        resize: 'none',
        lineHeight: 1.6,
        fontFamily: "'Inter', sans-serif",
      }}
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
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
          <div
            style={{
              padding: '14px 16px',
              borderRadius: '14px',
              background: 'rgba(245, 158, 11, 0.08)',
              border: '1px solid rgba(245, 158, 11, 0.25)',
              fontSize: '0.85rem',
              color: '#92400e',
              fontWeight: 600,
              fontFamily: "'Inter', sans-serif",
            }}
          >
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
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
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
                padding: '16px 12px',
                borderRadius: '16px',
                border: isSelected ? `2px solid ${accent}` : '1.5px solid #e2e8f0',
                backgroundColor: isSelected ? `${accent}12` : '#ffffff',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '6px',
                textAlign: 'center',
                cursor: 'pointer',
                fontFamily: "'Inter', sans-serif",
                color: isSelected ? '#0f172a' : '#334155',
                fontWeight: isSelected ? 800 : 600,
                boxShadow: isSelected ? `0 4px 14px ${accent}25` : '0 1px 3px rgba(0,0,0,0.02)',
                transition: 'all 0.2s ease',
              }}
            >
              <span style={{ fontSize: '1.6rem' }}>{opt.emoji}</span>
              <span style={{ fontSize: '0.88rem' }}>{opt.label}</span>
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
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
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
                textAlign: 'left',
                padding: '14px 16px',
                borderRadius: '14px',
                border: isSelected ? `2px solid ${accent}` : '1.5px solid #cbd5e1',
                backgroundColor: isSelected ? `${accent}10` : '#ffffff',
                color: isSelected ? '#0f172a' : '#334155',
                fontSize: '0.88rem',
                fontWeight: isSelected ? 700 : 500,
                cursor: 'pointer',
                fontFamily: "'Inter', sans-serif",
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                transition: 'all 0.2s ease',
              }}
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
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
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
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                padding: '14px 16px',
                borderRadius: '16px',
                border: isSelected ? `2px solid ${cake.accent}` : '1.5px solid #e2e8f0',
                backgroundColor: isSelected ? cake.bg : '#ffffff',
                color: isSelected ? '#ffffff' : '#0f172a',
                textAlign: 'left',
                cursor: 'pointer',
                fontFamily: "'Inter', sans-serif",
                boxShadow: isSelected ? '0 8px 24px rgba(0,0,0,0.18)' : '0 1px 3px rgba(0,0,0,0.02)',
                transition: 'all 0.2s ease',
              }}
            >
              <span style={{ fontSize: '2rem' }}>{cake.emoji}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>{cake.label}</div>
                <div style={{ fontSize: '0.78rem', color: isSelected ? 'rgba(255,255,255,0.85)' : '#64748b' }}>
                  {cake.desc}
                </div>
              </div>
              {isSelected && <span style={{ fontSize: '1.2rem', fontWeight: 800 }}>✓</span>}
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

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: '#fff1f2',
                border: '1px solid #fecdd3',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px',
                flexShrink: 0,
              }}
            >
              🎈
            </div>
            <input
              type="text"
              value={form.balloonMessages[i] || ''}
              onChange={(e) => updateBalloon(i, e.target.value)}
              placeholder={`Message ${i + 1}... (e.g. "You light up my life")`}
              style={{
                flex: 1,
                padding: '11px 14px',
                borderRadius: '12px',
                border: '1.5px solid #cbd5e1',
                background: '#ffffff',
                fontSize: '0.88rem',
                color: '#0f172a',
                outline: 'none',
                fontFamily: "'Inter', sans-serif",
                boxSizing: 'border-box',
              }}
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
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
        <div
          style={{
            padding: '14px 16px',
            borderRadius: '14px',
            background: 'rgba(245, 158, 11, 0.08)',
            border: '1px solid rgba(245, 158, 11, 0.25)',
            fontSize: '0.85rem',
            color: '#92400e',
            fontWeight: 600,
            fontFamily: "'Inter', sans-serif",
          }}
        >
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
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {form.journey.map((event, i) => (
          <div
            key={i}
            style={{
              padding: '14px 16px',
              borderRadius: '16px',
              background: '#ffffff',
              border: '1.5px solid #e2e8f0',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#64748b' }}>
                Milestone {i + 1}
              </span>
              {form.journey.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeEvent(i)}
                  style={{ color: '#94a3b8', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 700 }}
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
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '10px',
                border: '1px solid #cbd5e1',
                background: '#f8fafc',
                fontSize: '0.82rem',
                fontFamily: "'Inter', sans-serif",
                boxSizing: 'border-box',
                outline: 'none',
              }}
            />
            <input
              type="text"
              value={event.memory}
              onChange={(e) => updateJourney(i, 'memory', e.target.value)}
              placeholder="Memory (e.g. Our first road trip to the hills)"
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '10px',
                border: '1px solid #cbd5e1',
                background: '#f8fafc',
                fontSize: '0.82rem',
                fontFamily: "'Inter', sans-serif",
                boxSizing: 'border-box',
                outline: 'none',
              }}
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
            style={{
              width: '100%',
              padding: '11px',
              borderRadius: '12px',
              border: '1.5px dashed #fda4af',
              color: '#e11d48',
              fontWeight: 700,
              fontSize: '0.82rem',
              background: 'rgba(255, 241, 242, 0.5)',
              cursor: 'pointer',
              fontFamily: "'Inter', sans-serif",
            }}
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
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                background: '#fff1f2',
                border: '1px solid #fecdd3',
                color: '#e11d48',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                flexShrink: 0,
              }}
            >
              {i + 1}
            </div>
            <input
              type="text"
              value={form.reasons[i] || ''}
              onChange={(e) => updateReason(i, e.target.value)}
              placeholder={`Reason ${i + 1}... (e.g. "The way your laugh makes me feel")`}
              style={{
                flex: 1,
                padding: '11px 14px',
                borderRadius: '12px',
                border: '1.5px solid #cbd5e1',
                background: '#ffffff',
                fontSize: '0.88rem',
                color: '#0f172a',
                outline: 'none',
                fontFamily: "'Inter', sans-serif",
                boxSizing: 'border-box',
              }}
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
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
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
                textAlign: 'left',
                padding: '14px 16px',
                borderRadius: '16px',
                border: isSelected ? `2px solid ${accent}` : '1.5px solid #cbd5e1',
                backgroundColor: isSelected ? `${accent}12` : '#ffffff',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                cursor: 'pointer',
                fontFamily: "'Inter', sans-serif",
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                transition: 'all 0.2s ease',
              }}
            >
              <span style={{ fontSize: '1.6rem' }}>{opt.emoji}</span>
              <span style={{ flex: 1, fontSize: '0.88rem', fontWeight: isSelected ? 800 : 600, color: isSelected ? '#0f172a' : '#334155' }}>
                {opt.label}
              </span>
              {isSelected && <span style={{ fontWeight: 800, fontSize: '1.1rem', color: accent }}>✓</span>}
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
        <div
          style={{
            marginTop: '12px',
            padding: '12px',
            borderRadius: '12px',
            background: '#f8fafc',
            border: '1.5px dashed #cbd5e1',
            color: '#64748b',
            fontSize: '0.8rem',
            textAlign: 'center',
            fontWeight: 500,
            fontFamily: "'Inter', sans-serif",
          }}
        >
          Photos are optional, but adding them makes the reveal 10x more magical 💫
        </div>
      )}

      {/* Optional Passcode Shield */}
      <div
        style={{
          marginTop: '20px',
          padding: '16px',
          borderRadius: '16px',
          background: 'linear-gradient(135deg, #f8fafc 0%, #fff1f2 100%)',
          border: '1.5px solid #e2e8f0',
          boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
        }}
      >
        <label htmlFor="gift-passcode" style={{ display: 'block', color: '#0f172a', fontWeight: 800, fontSize: '0.88rem', fontFamily: "'Inter', sans-serif" }}>
          Add a 4-digit secret passcode (optional)
        </label>
        <p style={{ color: '#64748b', fontSize: '0.78rem', margin: '4px 0 10px', fontFamily: "'Inter', sans-serif" }}>
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
          style={{
            width: '100%',
            padding: '10px 16px',
            borderRadius: '12px',
            border: '1.5px solid #cbd5e1',
            background: '#ffffff',
            color: '#0f172a',
            textAlign: 'center',
            letterSpacing: '0.4em',
            fontFamily: 'monospace',
            fontSize: '1.1rem',
            outline: 'none',
            boxSizing: 'border-box',
          }}
        />
        <span style={{ display: 'block', fontSize: '0.72rem', color: '#94a3b8', marginTop: '4px', fontFamily: "'Inter', sans-serif" }}>
          Leave blank to allow opening without a code.
        </span>
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
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {cassettes.map((c, i) => (
          <div
            key={c.id || i}
            style={{
              padding: '14px 16px',
              borderRadius: '16px',
              border: '1.5px solid #e2e8f0',
              background: '#ffffff',
              boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#4f46e5', letterSpacing: '0.05em' }}>
                TAPE 0{i + 1}
              </span>
              <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
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

      <div style={{ position: 'relative' }}>
        <TextArea
          value={form.letter}
          onChange={(v) => setField('letter', v)}
          placeholder={prompts[templateId] || "Write your heartfelt message here..."}
          rows={7}
        />
        <div style={{ textAlign: 'right', fontSize: '0.75rem', color: '#64748b', marginTop: '4px', fontWeight: 500, fontFamily: "'Inter', sans-serif" }}>
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
