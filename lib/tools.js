// lib/tools.js — Static tool definitions (client-safe, no Firestore)
// ponytail: flat array + helpers, same pattern as lib/templates.js

export const TOOL_CATEGORIES = [
  { id: 'love',      label: 'Love & Relationship', emoji: '❤️',  color: '#e11d48' },
  { id: 'birthday',  label: 'Birthday & Occasion',  emoji: '🎂',  color: '#d97706' },
  { id: 'generator', label: 'Message Generators',   emoji: '✍️',  color: '#7c3aed' },
  { id: 'gift',      label: 'Gift Decision',        emoji: '🎁',  color: '#059669' },
  { id: 'fun',       label: 'Fun & Viral',          emoji: '🎉',  color: '#f43f5e' },
  { id: 'social',    label: 'Social Media',         emoji: '📱',  color: '#0ea5e9' },
];

export const tools = [
  {
    slug: 'love-calculator',
    title: 'Love Calculator',
    description: 'Enter two names and get a fun love compatibility percentage with personalized insights.',
    category: 'love',
    emoji: '💕',
    keywords: ['love calculator', 'love percentage', 'name compatibility', 'love test'],
    giftCta: { text: 'Turn this into a romantic gift', href: '/templates/proposal' },
  },
  {
    slug: 'crush-compatibility-calculator',
    title: 'Crush Compatibility Calculator',
    description: 'Find out your compatibility with your crush — enter both names and get a fun match percentage.',
    category: 'love',
    emoji: '😍',
    keywords: ['crush compatibility', 'crush calculator', 'crush match', 'do they like me'],
    giftCta: { text: 'Confess your feelings with a gift', href: '/templates/proposal' },
  },
  {
    slug: 'love-language-quiz',
    title: 'Love Language Quiz',
    description: 'A quick 10-question quiz to discover your primary love language and how you express affection.',
    category: 'love',
    emoji: '💬',
    keywords: ['love language test', 'love language quiz', '5 love languages', 'how do i love'],
    giftCta: { text: 'Share your love language as a gift', href: '/templates/proposal' },
  },
  {
    slug: 'age-calculator',
    title: 'Age Calculator',
    description: 'Calculate exact age in years, months, and days from any date of birth — instantly.',
    category: 'birthday',
    emoji: '🎂',
    keywords: ['age calculator', 'exact age', 'how old am i', 'date of birth calculator'],
    giftCta: { text: 'Surprise them with a birthday gift', href: '/templates/birthday' },
  },
  {
    slug: 'birthday-countdown-timer',
    title: 'Birthday Countdown Timer',
    description: 'A live countdown to any birthday — days, hours, minutes, and seconds until the big day.',
    category: 'birthday',
    emoji: '⏳',
    keywords: ['birthday countdown', 'days until birthday', 'birthday timer', 'how many days'],
    giftCta: { text: 'Prepare a birthday surprise', href: '/templates/birthday' },
  },
  {
    slug: 'anniversary-calculator',
    title: 'Anniversary Calculator',
    description: 'Calculate exactly how long you\'ve been together and when your next anniversary is.',
    category: 'birthday',
    emoji: '💍',
    keywords: ['anniversary calculator', 'how long together', 'relationship duration', 'next anniversary'],
    giftCta: { text: 'Celebrate with an anniversary gift', href: '/templates/anniversary' },
  },
  {
    slug: 'birthday-wish-generator',
    title: 'Birthday Wish Generator',
    description: 'Generate heartfelt, funny, or emotional birthday wishes tailored to your relationship.',
    category: 'generator',
    emoji: '🎉',
    keywords: ['birthday wishes', 'birthday message generator', 'happy birthday message', 'birthday quotes'],
    giftCta: { text: 'Send this wish as a gift', href: '/templates/birthday' },
  },
  {
    slug: 'couple-nickname-generator',
    title: 'Couple Nickname Generator',
    description: 'Enter both names and get cute, playful, or royal couple nicknames instantly.',
    category: 'generator',
    emoji: '👩‍❤️‍👨',
    keywords: ['couple nickname', 'ship name', 'couple name generator', 'cute nickname'],
    giftCta: { text: 'Use your couple name in a gift', href: '/templates/proposal' },
  },
  {
    slug: 'gift-idea-generator',
    title: 'Gift Idea Generator',
    description: 'Pick an occasion, budget, and vibe — get personalized gift ideas in seconds.',
    category: 'gift',
    emoji: '🎁',
    keywords: ['gift ideas', 'gift suggestions', 'what gift to give', 'gift finder'],
    giftCta: { text: 'Create a personalized digital gift', href: '/templates' },
  },
  {
    slug: 'emoji-love-translator',
    title: 'Emoji Love Translator',
    description: 'Type a love message and get it translated into a cute emoji-only version to share.',
    category: 'fun',
    emoji: '😘',
    keywords: ['emoji translator', 'love emoji', 'emoji message', 'text to emoji'],
    giftCta: { text: 'Send this as a romantic gift', href: '/templates/proposal' },
  },
  {
    slug: 'who-loves-more-calculator',
    title: 'Who Loves More? Calculator',
    description: 'Enter two names and find out who loves more — a fun love-effort score for couples.',
    category: 'fun',
    emoji: '⚖️',
    keywords: ['who loves more', 'love score', 'couple love test', 'relationship quiz'],
    giftCta: { text: 'Prove your love with a gift', href: '/templates/proposal' },
  },
  {
    slug: 'romantic-caption-generator',
    title: 'Romantic Caption Generator',
    description: 'Get Instagram-ready romantic captions for couple photos, anniversaries, and date nights.',
    category: 'social',
    emoji: '📸',
    keywords: ['romantic captions', 'couple captions', 'instagram captions', 'love quotes for instagram'],
    giftCta: { text: 'Create a romantic surprise', href: '/templates/proposal' },
  },
];

export function getToolBySlug(slug) {
  return tools.find((t) => t.slug === slug) || null;
}

export function getToolsByCategory(categoryId) {
  return tools.filter((t) => t.category === categoryId);
}

export function getCategoryById(id) {
  return TOOL_CATEGORIES.find((c) => c.id === id) || null;
}

