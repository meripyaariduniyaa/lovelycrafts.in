'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { springs } from '@/lib/motion';
import { playSfx } from '@/lib/sfx';

/* ─────────────────────────────────────────────────────────
   CURATED STARTER PROMPTS DATABASE
   Tailored by template and step (letters, balloons, reasons, etc.)
───────────────────────────────────────────────────────── */
const PROMPTS_DATABASE = {
  // Balloon pop messages (Virtual Birthday Bash)
  balloons: [
    {
      category: 'Sweet & Loving',
      prompts: [
        'Pop! Surprise: You are officially the cutest human alive! 🥰',
        'Reminder: You make my world infinitely happier just by existing. ✨',
        'Secret revealed: Meeting you is the best thing that ever happened to me. ❤️',
        "Pop! Here's a coupon for unlimited warm hugs redeemable anytime. 🫂",
        'You have a heart of pure gold, never let the world dim your sparkle! 💖',
      ],
    },
    {
      category: 'Playful & Cheeky',
      prompts: [
        "Today's fortune: Endless cake, zero calories, and infinite love! 🎂",
        'Warning: You are loved more than coffee on a Monday morning. ☕',
        'Pop! You survived another year of being my favourite weirdo! 🥳',
        'Fun fact: My smile is 100% bigger whenever you are around. 💫',
        'Pop! I promise to always share my fries with you. (Mostly). 🍟',
      ],
    },
    {
      category: 'Birthday Wishes',
      prompts: [
        'May this year bring you as much happiness as you give to everyone else! 🌟',
        'Another year more radiant, more accomplished, and more loved. 🥂',
        'Blow out the candles, make a wild wish, and watch it come true! 🕯️',
        'Cheers to 365 new days of belly laughs and unforgettable adventures! 🎉',
        'You age like fine wine — effortlessly stunning every single year! 🍷',
      ],
    },
  ],

  // Anniversary reasons why you love them
  reasons: [
    {
      category: 'Everyday Magic',
      prompts: [
        'How you always know when I need a hug before I even say a word.',
        'The goofy little laugh you make when you are genuinely happy.',
        'How you remember the smallest random details I mentioned weeks ago.',
        'The way you effortlessly turn the simplest grocery trip into an adventure.',
        'The warm cup of tea or coffee you bring me just when I need it most.',
      ],
    },
    {
      category: 'How You Care',
      prompts: [
        "How safe and peaceful the entire world feels whenever I'm in your arms.",
        'Your endless kindness and gentle empathy toward everyone around you.',
        'Your unwavering patience with me, even on my hardest days.',
        "How you celebrate my smallest wins like they're world championships.",
        'The quiet sacrifices you make just to see a smile on my face.',
      ],
    },
    {
      category: 'Our Connection',
      prompts: [
        'The way your eyes light up when talking about your passions and dreams.',
        'Our random 2 AM conversations about life, dreams, and silly nonsense.',
        'How we can sit in total comfortable silence and still feel completely connected.',
        'Because loving you feels as natural and essential as breathing.',
        'How choosing you every single day is the easiest decision I have ever made.',
      ],
    },
  ],

  // Proposal quotations
  quotation: [
    {
      category: 'Timeless Romance',
      prompts: [
        'Every moment with you feels like home. 🏡',
        'You make ordinary days feel extraordinary. ✨',
        'I choose you. Again and again, I choose you. 💕',
        "With you, forever doesn't feel long enough. 🌹",
        'You are my favourite hello and hardest goodbye. 💫',
        'Being with you is the best decision I ever made. ❤️',
        'In a sea of people, my eyes will always search for you. 🌊',
      ],
    },
  ],

  // Cassettes for long distance
  cassettes: [
    {
      category: 'Cassette Memories',
      prompts: [
        'That late night drive when we played our favourite songs on repeat until 3 AM.',
        'The rainy afternoon we stayed wrapped in blankets laughing about everything.',
        'The quiet airport goodbye where we both promised distance could never change us.',
        'The first time you held my hand and the whole world suddenly went quiet.',
        'The midnight phone call where we fell asleep still talking to each other.',
      ],
    },
  ],

  // Letters per template
  letter: {
    proposal: [
      {
        category: 'Proposal Confessions',
        prompts: [
          "From the moment you walked into my life, everything became brighter, warmer, and full of purpose. I don't just love you for who you are, but for who I am when I am with you. Will you make me the happiest person and walk this forever journey with me?",
          "I used to think 'soulmates' was just a line in movies until I met you. You are my calm in every storm, my best friend, and my favourite part of every day. I choose you today, tomorrow, and every day for the rest of my life.",
          "Loving you is the easiest, truest thing I have ever done. With you, home isn't a place — it's wherever you are. Marry me and let's turn every dream we've whispered into reality.",
        ],
      },
      {
        category: 'Future Promises',
        prompts: [
          'Every quiet evening, every belly laugh, and every adventure with you has shown me that my future has your name written all over it. I want to build a lifetime of memories, dreams, and endless love with you.',
          "I promise to cheer for you in every victory, hold your hand in every uncertainty, and never stop making you laugh. Let's make this official and spend forever together.",
          "You have this effortless way of making ordinary days feel magical. I can't imagine a single tomorrow without your smile, your warmth, and your hand in mine.",
        ],
      },
      {
        category: 'Sweet & Poetic',
        prompts: [
          'In a world that is always rushing, you are my still point. In a sea of faces, my eyes will always search for you. You have my whole heart, today and forever.',
          'They say when you know, you know. With you, there was never a doubt. You are my greatest discovery and my greatest love.',
        ],
      },
    ],

    birthday: [
      {
        category: 'Birthday Blessings',
        prompts: [
          'Happy Birthday to the one who makes the world brighter simply by being in it! Watching you grow, achieve your dreams, and radiate kindness inspires me endlessly. May this year bring you all the love and happiness you give so freely to others.',
          "Another year wiser, more gorgeous, and even more loved than before. I hope today reminds you just how precious you are to everyone whose life you touch. Here's to another 365 days of laughter, wild dreams, and unforgettable memories!",
        ],
      },
      {
        category: 'Celebrating You',
        prompts: [
          'To my favourite person on their special day: thank you for bringing so much laughter, warmth, and magic into my life. Blow out the candles and make your biggest wish — I will be right beside you cheering you on as it comes true.',
          'Today is all about celebrating you — your quirks, your radiant laugh, your golden heart. Never change, because you are perfection in every way. Have the happiest birthday!',
        ],
      },
      {
        category: 'Milestone Year',
        prompts: [
          "Happy Birthday! Looking back at all the memories we've made this past year makes me even more excited for what's ahead. May your days be sweet, your adventures thrilling, and your heart always full.",
          "Cheers to another trip around the sun with you by my side. Let's make this year your most magical chapter yet!",
        ],
      },
    ],

    anniversary: [
      {
        category: 'Anniversary Reflections',
        prompts: [
          'Happy Anniversary, my love! Looking back at our journey, every laugh we have shared and hurdle we have overcome has only brought us closer. Thank you for being my anchor, my rock, and my greatest adventure.',
          'Time has flown by, yet my heart still skips a beat whenever you look at me. With every passing season, my love for you grows deeper, quieter, and more unbreakable. Cheers to us and the endless chapters still to be written.',
        ],
      },
      {
        category: 'Growing Together',
        prompts: [
          "Another year of building a home inside each other's hearts. You still make me laugh like nobody else can. Here's to all the quiet mornings, late night talks, and big adventures waiting for us.",
          'Through the chaos of life, you have remained my favourite sanctuary. Thank you for choosing me every single day, for understanding my silence, and for celebrating my joy. Happy anniversary to my forever person.',
        ],
      },
      {
        category: 'Forever Promises',
        prompts: [
          'From our very first conversation to this anniversary milestone, you have been my greatest blessing. I love you more today than yesterday, but not half as much as I will tomorrow.',
          'Whatever tomorrow brings, having your hand in mine is all the reassurance I will ever need. Happy anniversary, my heart.',
        ],
      },
    ],

    'emotional-apology': [
      {
        category: 'Heartfelt Apologies',
        prompts: [
          'I am truly, deeply sorry for hurting you. Looking back, I realize my words and actions were thoughtless and caused you unnecessary pain. You mean too much to me for me to ever treat your feelings lightly. I want to listen, learn, and make things right.',
          'I hate that I am the reason there is sadness in your eyes. You deserve nothing but gentleness, patience, and warmth from me. Please take all the time you need, but know that I am committed to earning back your trust with every action moving forward.',
        ],
      },
      {
        category: 'Taking Accountability',
        prompts: [
          'I let my own frustrations get in the way of what truly matters: us, and your peace. I am owning my mistake completely, with no excuses. Your feelings are valid, and I am here whenever you feel ready to talk.',
          'My heart aches knowing I let you down. You have always been there for me with open arms, and I failed to protect your peace. I am so sorry, and I will do whatever it takes to show you how much I cherish you.',
        ],
      },
      {
        category: 'Rebuilding Trust',
        prompts: [
          'Please forgive me for falling short. What we share is precious to me, and I never want pride or carelessness to stand between us. I am listening, and I am here for you unconditionally.',
          'Actions speak louder than words, and I promise to prove through patience, care, and understanding how truly sorry I am. I love you.',
        ],
      },
    ],

    'i-miss-you': [
      {
        category: 'Long-Distance Yearning',
        prompts: [
          "Even across all these miles and time zones, not an hour goes by where my thoughts don't drift to you. Distance may keep us apart physically, but it only proves just how strong and unshakeable our bond truly is. I miss you more than words can say.",
          'Every song reminds me of our car rides, every evening breeze feels like a whisper of your presence. The distance feels heavy today, but knowing I get to hold you again soon makes every single kilometer worth it.',
        ],
      },
      {
        category: 'Late Night Thoughts',
        prompts: [
          'I look at the same moon at night and find comfort knowing you are under it too. You are the first person I want to text when something funny happens and the only arms I want to collapse into after a long day. Come home soon.',
          "Missing you has become my heart's quiet background rhythm. I cannot wait for the day when goodbye is just 'see you tonight'. Until then, hold onto this letter and know you are cherished endlessly.",
        ],
      },
      {
        category: 'Reunion Promises',
        prompts: [
          'Distance is just a test to see how far love can travel. And ours spans oceans, borders, and time. Sending you all my warmth, a million virtual hugs, and all of my heart until we are reunited.',
          'Counting down the days, hours, and minutes until there is zero distance between us. Until then, you are in every thought and every prayer.',
        ],
      },
    ],
  },
};

/**
 * InspirationVault
 * 
 * An emotional inspiration drawer component that helps creators write heartfelt letters,
 * balloon messages, and anniversary reasons with curated emotional prompts.
 * 
 * @param {Object} props
 * @param {string} [props.templateId='proposal'] - Active template ID ('proposal', 'birthday', 'anniversary', 'emotional-apology', 'i-miss-you')
 * @param {string} [props.stepId='letter'] - Active wizard step ID ('letter', 'balloons', 'reasons', 'quotation', etc.)
 * @param {Function} props.onSelectPrompt - Callback called when a prompt is selected with the prompt string
 */
export default function InspirationVault({ templateId = 'proposal', stepId = 'letter', onSelectPrompt }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');
  const [recentlySelected, setRecentlySelected] = useState(null);

  // Resolve prompts according to stepId and templateId
  const categoryGroups = useMemo(() => {
    if (stepId === 'balloons') {
      return PROMPTS_DATABASE.balloons;
    }
    if (stepId === 'reasons') {
      return PROMPTS_DATABASE.reasons;
    }
    if (stepId === 'quotation') {
      return PROMPTS_DATABASE.quotation;
    }
    if (stepId === 'cassettes') {
      return PROMPTS_DATABASE.cassettes;
    }

    // Default to letters for the specific template or fallback to proposal
    const letterTemplate = PROMPTS_DATABASE.letter[templateId] || PROMPTS_DATABASE.letter.proposal;
    return letterTemplate;
  }, [templateId, stepId]);

  // Extract all categories
  const categories = useMemo(() => {
    return ['All', ...categoryGroups.map((group) => group.category)];
  }, [categoryGroups]);

  // Filtered prompts based on active category
  const filteredPrompts = useMemo(() => {
    if (activeCategory === 'All') {
      return categoryGroups.flatMap((group) =>
        group.prompts.map((text) => ({ text, category: group.category }))
      );
    }
    const group = categoryGroups.find((g) => g.category === activeCategory);
    return group ? group.prompts.map((text) => ({ text, category: group.category })) : [];
  }, [categoryGroups, activeCategory]);

  // Handle prompt click
  const handleSelectPrompt = (promptText) => {
    playSfx('sparkle');
    setRecentlySelected(promptText);
    if (typeof onSelectPrompt === 'function') {
      onSelectPrompt(promptText);
    }
    setTimeout(() => {
      setRecentlySelected((current) => (current === promptText ? null : current));
    }, 2000);
  };

  // Toggle drawer with tactile sound
  const handleToggle = () => {
    playSfx('pop');
    setIsOpen((prev) => !prev);
  };

  return (
    <div
      style={{
        width: '100%',
        margin: '1rem 0 0.5rem 0',
        fontFamily: 'inherit',
      }}
    >
      {/* Toggle Button */}
      <motion.button
        type="button"
        onClick={handleToggle}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.96 }}
        transition={springs.snappy}
        aria-expanded={isOpen}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.75rem 1.15rem',
          borderRadius: '16px',
          background: isOpen
            ? 'linear-gradient(135deg, rgba(254, 242, 242, 0.95) 0%, rgba(255, 241, 242, 0.95) 100%)'
            : 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 247, 246, 0.9) 100%)',
          border: isOpen ? '1.5px solid #fecdd3' : '1px solid #fecdd3',
          boxShadow: isOpen
            ? '0 4px 16px rgba(244, 63, 94, 0.12)'
            : '0 2px 8px rgba(0, 0, 0, 0.03)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          cursor: 'pointer',
          textAlign: 'left',
          userSelect: 'none',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <span
            style={{
              fontSize: '1.15rem',
              lineHeight: 1,
              filter: 'drop-shadow(0 1px 2px rgba(244, 63, 94, 0.25))',
            }}
          >
            ✨
          </span>
          <div>
            <div
              style={{
                fontSize: '0.88rem',
                fontWeight: 700,
                color: '#881337',
                letterSpacing: '-0.01em',
              }}
            >
              Need words? Tap for inspiration
            </div>
            <div
              style={{
                fontSize: '0.74rem',
                color: '#9f1239',
                opacity: 0.8,
                fontWeight: 500,
              }}
            >
              Curated emotional starters tailored for your story
            </div>
          </div>
        </div>

        {/* Dynamic Chevron / Status indicator */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            background: isOpen ? '#fecdd3' : '#fff1f2',
            padding: '4px 10px',
            borderRadius: '999px',
            fontSize: '0.74rem',
            fontWeight: 700,
            color: '#be123c',
          }}
        >
          <span>{isOpen ? 'Close' : 'Browse'}</span>
          <motion.svg
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={springs.snappy}
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="6 9 12 15 18 9" />
          </motion.svg>
        </div>
      </motion.button>

      {/* Smooth Expand/Collapse Drawer */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="inspiration-drawer-content"
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{
              opacity: 1,
              height: 'auto',
              marginTop: 10,
              transition: {
                height: { type: 'spring', stiffness: 350, damping: 30, mass: 0.8 },
                opacity: { duration: 0.25 },
                marginTop: { duration: 0.15 },
              },
            }}
            exit={{
              opacity: 0,
              height: 0,
              marginTop: 0,
              transition: {
                height: { duration: 0.2, ease: [0.32, 0.72, 0, 1] },
                opacity: { duration: 0.15 },
                marginTop: { duration: 0.15 },
              },
            }}
            style={{
              overflow: 'hidden',
              borderRadius: '20px',
              border: '1px solid #ffe4e6',
              background: 'rgba(255, 255, 255, 0.95)',
              boxShadow: '0 8px 30px rgba(136, 19, 55, 0.08)',
              backdropFilter: 'blur(20px) saturate(180%)',
              WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            }}
          >
            <div style={{ padding: '1rem 1rem 1.15rem 1rem' }}>
              {/* Category Filter Chips */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  overflowX: 'auto',
                  paddingBottom: '0.65rem',
                  marginBottom: '0.75rem',
                  scrollbarWidth: 'none',
                  msOverflowStyle: 'none',
                }}
              >
                {categories.map((cat) => {
                  const isSelected = activeCategory === cat;
                  return (
                    <motion.button
                      key={cat}
                      type="button"
                      onClick={() => {
                        playSfx('pop');
                        setActiveCategory(cat);
                      }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.96 }}
                      transition={springs.snappy}
                      style={{
                        position: 'relative',
                        padding: '6px 14px',
                        borderRadius: '999px',
                        border: isSelected ? '1.5px solid transparent' : '1px solid #fecdd3',
                        background: isSelected ? '#be123c' : '#fff1f2',
                        color: isSelected ? '#ffffff' : '#881337',
                        fontSize: '0.76rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        boxShadow: isSelected ? '0 3px 10px rgba(190, 18, 60, 0.25)' : 'none',
                        flexShrink: 0,
                      }}
                    >
                      {cat}
                    </motion.button>
                  );
                })}
              </div>

              {/* Prompts Cards Grid */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.6rem',
                  maxHeight: '320px',
                  overflowY: 'auto',
                  paddingRight: '4px',
                }}
              >
                <AnimatePresence mode="popLayout">
                  {filteredPrompts.map(({ text, category }, idx) => {
                    const isSelectedJustNow = recentlySelected === text;
                    return (
                      <motion.div
                        key={text}
                        layout
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.96 }}
                        transition={{
                          ...springs.snappy,
                          delay: Math.min(idx * 0.03, 0.15),
                        }}
                        onClick={() => handleSelectPrompt(text)}
                        whileHover={{
                          y: -1.5,
                          boxShadow: '0 6px 18px rgba(190, 18, 60, 0.1)',
                          borderColor: '#fda4af',
                        }}
                        whileTap={{ scale: 0.96 }}
                        style={{
                          position: 'relative',
                          padding: '0.85rem 1rem',
                          borderRadius: '14px',
                          border: isSelectedJustNow
                            ? '1.5px solid #10b981'
                            : '1px solid #ffe4e6',
                          background: isSelectedJustNow
                            ? 'rgba(236, 253, 245, 0.95)'
                            : '#ffffff',
                          cursor: 'pointer',
                          transition: 'border-color 0.15s ease, background-color 0.15s ease',
                          userSelect: 'none',
                        }}
                      >
                        {/* Category Label */}
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginBottom: '0.35rem',
                          }}
                        >
                          <span
                            style={{
                              fontSize: '0.68rem',
                              fontWeight: 700,
                              textTransform: 'uppercase',
                              letterSpacing: '0.04em',
                              color: isSelectedJustNow ? '#059669' : '#be123c',
                            }}
                          >
                            {category}
                          </span>

                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                              fontSize: '0.7rem',
                              fontWeight: 700,
                              color: isSelectedJustNow ? '#059669' : '#e11d48',
                            }}
                          >
                            {isSelectedJustNow ? (
                              <>
                                <span>✓</span>
                                <span>Applied!</span>
                              </>
                            ) : (
                              <>
                                <span>+</span>
                                <span>Tap to use</span>
                              </>
                            )}
                          </span>
                        </div>

                        {/* Prompt Body */}
                        <p
                          style={{
                            margin: 0,
                            fontSize: '0.84rem',
                            lineHeight: 1.45,
                            color: isSelectedJustNow ? '#064e3b' : '#334155',
                            fontWeight: 500,
                          }}
                        >
                          &ldquo;{text}&rdquo;
                        </p>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>

              {/* Bottom Pro Tip */}
              <div
                style={{
                  marginTop: '0.75rem',
                  paddingTop: '0.65rem',
                  borderTop: '1px solid #fff1f2',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '0.72rem',
                  color: '#64748b',
                }}
              >
                <span>💡 Tip: Tapping any prompt will fill or inspire your draft.</span>
                <span style={{ fontWeight: 600, color: '#be123c' }}>
                  {filteredPrompts.length} starters available
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
