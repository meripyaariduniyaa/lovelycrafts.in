'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';

const TEMPLATES = [
  { id: 'proposal', label: '💍 The Perfect Proposal', color: '#be185d' },
  { id: 'birthday', label: '🎂 Virtual Birthday Bash', color: '#d97706' },
  { id: 'anniversary', label: '🥂 Anniversary Special', color: '#7c3aed' },
  { id: 'missyou', label: '🌌 I Miss You', color: '#0369a1' },
  { id: 'sorry', label: "🕊️ I'm Sorry", color: '#059669' },
];

const CONTENT_TYPES = [
  { id: 'reel', label: '🎬 Reel / Short' },
  { id: 'story', label: '📸 Instagram Story' },
  { id: 'carousel', label: '🖼️ Carousel Post' },
  { id: 'screen', label: '📱 Screen Recording' },
  { id: 'pov', label: '🎭 POV Video' },
];

const STYLES = [
  { id: 'faceless', label: '🎵 Faceless + Music' },
  { id: 'talking', label: '🗣️ Talking Head' },
  { id: 'cinematic', label: '🎞️ Cinematic' },
  { id: 'comedy', label: '😂 Comedy / Relatable' },
  { id: 'emotional', label: '🥹 Emotional Storytelling' },
  { id: 'reaction', label: '😲 Reaction' },
];

const HOOK_TYPES = [
  { id: 'curiosity', label: '🤔 Curiosity' },
  { id: 'relationship', label: '❤️ Relationship' },
  { id: 'emotional', label: '🥹 Emotional' },
  { id: 'relatable', label: '😂 Relatable' },
  { id: 'challenge', label: '🎯 Challenge / CTA' },
];

const IDEAS = {
  'proposal_reel_faceless_curiosity': {
    hook: '"I found a website where the NO button literally runs away from you..."',
    script: '0–2s: Show finger chasing the dodging NO button\n2–8s: Reveal the full proposal — wax seal, polaroid museum, letter\n8–18s: Final ring box reveal with romantic music\n18–25s: "Create yours in 2 minutes — link in bio + use my code for 10% OFF"',
    audio: 'Lo-fi romantic piano',
    caption: 'The NO button literally dodges your finger 😂💍\n\nLink in bio ✨\n👉 Use my code for 10% OFF\n\n#proposal #proposalideas #lovelycrafts #couples #romanticgift'
  },
  'proposal_reel_comedy_curiosity': {
    hook: '"When you want to propose but also want to make it chaotic..."',
    script: '0–2s: Panicked face — "Okay I may have overdone it..."\n2–10s: Show the NO button dodging, cut to their confused reaction\n10–20s: Reveal the letter and ring box\n20–25s: "She said yes. Eventually."',
    audio: 'Comedic sound + romantic switch',
    caption: 'Gave her one option. She tried to escape. She could not. 💍😂\n\nLink in bio.\n👉 10% OFF code in bio\n\n#proposal #proposalvideo #lovelycrafts #couples'
  },
  'proposal_reel_cinematic_emotional': {
    hook: '"Some moments deserve more than a text message."',
    script: '0–2s: Slow cinematic shot — couple silhouette\n2–10s: Wax seal opens in slow motion, music swells\n10–20s: Polaroid museum, letter fills screen\n20–25s: "For the moment you never want to forget."',
    audio: 'Cinematic orchestral or golden hour acoustic',
    caption: 'Some love stories deserve an interactive chapter. 💍\n\nLink in bio to write yours.\n\n#proposal #lovelycrafts #romantic #cinematic #couplegoals'
  },
  'proposal_reel_comedy_relatable': {
    hook: '"When she says she does not want anything for Valentine\'s Day..."',
    script: '0–2s: Worried face — "She said nothing. I panicked."\n2–10s: Show creating the proposal experience\n10–20s: Show her reaction opening it\n20–25s: "Problem solved. Link in bio."',
    audio: 'Comedy panic audio + romantic switch',
    caption: 'She said she did not want anything. She lied. 💍😂\n\nLink in bio — use my code for 10% OFF\n\n#proposal #valentinesday #lovelycrafts #couples'
  },
  'proposal_pov_emotional_emotional': {
    hook: '"POV: You wanted to propose differently."',
    script: '0–2s: Text — "POV: You did not want a boring proposal"\n2–10s: Slow reveal of wax seal opening, polaroid museum, ring box\n10–20s: Final letter appears\n20–25s: "Would you say YES?"',
    audio: 'Soft orchestral or ambient',
    caption: 'POV: She had no idea what was coming 💍\n\nLink in bio to create your moment ✨\n\n#proposal #pov #lovelycrafts #romantic'
  },
  'birthday_reel_faceless_curiosity': {
    hook: '"Your phone can literally become their birthday cake..."',
    script: '0–2s: Text overlay — "This is not a normal birthday wish"\n2–8s: Show microphone candle blowout interaction\n8–18s: Balloon popping with memory reveals\n18–25s: "Send this at midnight. Link in bio + 10% OFF"',
    audio: 'Upbeat birthday lofi',
    caption: 'Your phone can literally be their birthday cake 🎂🎤\n\nThey blow out the candle with their microphone.\n\nLink in bio ✨ | 10% OFF code in bio\n\n#birthday #birthdaysurprise #lovelycrafts #birthdayideas'
  },
  'birthday_reel_comedy_curiosity': {
    hook: '"POV: You forgot their birthday and it\'s 11:58 PM."',
    script: '0–2s: Panicked clock shot — 11:58 PM\n2–8s: Speed-creating the birthday experience\n8–18s: Sending at exactly 12:00 AM\n18–25s: Their reaction — "WAIT HOW DID YOU DO THIS??"',
    audio: 'Panic audio → happy birthday music',
    caption: 'Forgot their birthday. Saved myself in 2 minutes. 🎂😅\n\nLink in bio for the same emergency.\n👉 10% OFF code in bio\n\n#birthday #birthdayfail #lovelycrafts #birthdayideas'
  },
  'birthday_reel_comedy_relatable': {
    hook: '"When they say they don\'t want a big deal for their birthday..."',
    script: '0–2s: "She said do not make it a big deal"\n2–10s: "So I sent her THIS instead"\n10–20s: Show balloon popping and cake cutting on screen\n20–25s: "She cried. Link in bio."',
    audio: 'Comedy sound + birthday music',
    caption: 'She said keep it small. I sent her an entire interactive birthday world. 🎂\n\nLink in bio ✨\n\n#birthday #birthdaysurprise #lovelycrafts #bestfriendgoals'
  },
  'birthday_reel_cinematic_emotional': {
    hook: '"The best birthday wishes are not sent. They are experienced."',
    script: '0–2s: Slow close-up of birthday candle flickering\n2–10s: Screen fills with confetti and balloon pops\n10–20s: Birthday letter reveals, soft music\n20–25s: "Make their next birthday unforgettable."',
    audio: 'Golden hour acoustic or Lo-fi birthday',
    caption: 'Some birthdays deserve more than a voice note. 🎂✨\n\nLink in bio to create theirs.\n\n#birthday #birthdayideas #lovelycrafts #cinematic'
  },
  'anniversary_reel_faceless_curiosity': {
    hook: '"Did you know exactly how many minutes you have been together?"',
    script: '0–2s: Live counter ticking — days, hours, minutes together\n2–10s: Transition to love museum with 3D polaroids\n10–20s: Champagne clink, vow tablets flip open\n20–25s: "Link in bio to create yours + 10% OFF"',
    audio: 'Golden hour instrumental',
    caption: 'We have officially been together for _____ minutes. The counter is live. 🥂✨\n\nLink in bio.\n👉 10% OFF code in bio\n\n#anniversary #anniversarygift #lovelycrafts #couples'
  },
  'anniversary_reel_cinematic_emotional': {
    hook: '"Our entire relationship in one interactive link."',
    script: '0–2s: Slow pan — couple photo fades into experience\n2–10s: Live relationship counter, museum of memories\n10–20s: Vow tablets open one by one\n20–25s: Sealed letter final reveal.',
    audio: 'Cello or romantic piano',
    caption: 'Years together. All of it in one link. 🥂\n\nLink in bio to create yours.\n\n#anniversary #lovelycrafts #romantic #couplegoals'
  },
  'missyou_reel_faceless_curiosity': {
    hook: '"I found a way to send a hug across 10,000 kilometers."',
    script: '0–2s: Live orbital distance radar — city to city\n2–8s: Hold to send hug — heart pulses across the map\n8–18s: Cassette memories play\n18–25s: "For everyone who misses someone far away. Link in bio."',
    audio: 'Celestial ambient or Space song',
    caption: 'Distance is just a number. 🌌\n\nSent them a virtual hug across 10,000 km.\n\nLink in bio ✨ | 10% OFF code in bio\n\n#longdistance #imissyou #lovelycrafts #ldrlove'
  },
  'missyou_reel_comedy_relatable': {
    hook: '"When your person lives in another city and miss you texts are not enough..."',
    script: '0–2s: Sad face to camera — "She is in another city and texting feels inadequate"\n2–10s: "So I sent her THIS instead"\n10–20s: Orbital radar, virtual hug, cassette\n20–25s: Her reaction — "I am literally crying"',
    audio: 'Sad to happy audio transition',
    caption: 'Texting miss you was not cutting it anymore. 🌌\n\nLink in bio — use my code for 10% OFF\n\n#longdistance #imissyou #lovelycrafts #ldrcouple'
  },
  'missyou_pov_emotional_curiosity': {
    hook: '"POV: Your best friend moved 2,000 km away."',
    script: '0–2s: Text — "POV: Your best friend just moved away"\n2–10s: Distance radar tracks the gap between cities\n10–20s: Virtual hug, cassette memories, heartfelt letter\n20–25s: "Miles mean nothing when someone means everything."',
    audio: 'Emotional ambient',
    caption: 'POV: She moved away but I found a way to stay close. 🌌\n\nLink in bio.\n\n#pov #longdistance #lovelycrafts #imissyou' },
  'sorry_reel_cinematic_emotional': {
    hook: '"Some apologies need more than two words."',
    script: '0–2s: Rain-streaked window — slow, quiet opening\n2–8s: Envelope opens, handwritten letter fills screen\n8–18s: Regret scrolls — honest, visible words\n18–25s: "For when you mean it. Link in bio."',
    audio: 'Soft acoustic guitar or rainfall + piano',
    caption: 'Some sorrys deserve to be felt, not just read. 🕊️\n\nLink in bio.\n\n#imsorry #apology #lovelycrafts #relationship #secondchance'
  },
  'sorry_reel_comedy_relatable': {
    hook: '"When sorry feels too small for what you did..."',
    script: '0–2s: Worried face — "Okay I really messed up."\n2–10s: "So I built an entire interactive apology experience"\n10–20s: Show the rain window, letter, commitments\n20–25s: "She is still deciding. But I tried."',
    audio: 'Comedy to sincere audio switch',
    caption: 'Sorry was not enough. So I built a whole experience. 🕊️\n\nLink in bio.\n\n#imsorry #apology #lovelycrafts #relationship'
  },
  'sorry_reel_emotional_emotional': {
    hook: '"I did not know how to say sorry. So I made this instead."',
    script: '0–2s: "I messed up. And a text did not feel like enough."\n2–10s: Rain window, envelope, regret scrolls, commitments\n10–20s: Their reaction — quiet, thoughtful\n20–25s: "Made with LovelyCrafts. Link in bio."',
    audio: 'Emotional piano',
    caption: 'I built an apology instead of sending a text. 🕊️\n\nLink in bio.\n\n#imsorry #apologyletter #lovelycrafts #relationship'
  },
};

function getIdea(template, contentType, style, hookType) {
  const key = `${template}_${contentType}_${style}_${hookType}`;
  if (IDEAS[key]) return IDEAS[key];
  const found = Object.keys(IDEAS).find((k) => k.startsWith(`${template}_${contentType}`));
  if (found) return IDEAS[found];
  const fallback = Object.keys(IDEAS).find((k) => k.startsWith(template));
  return fallback ? IDEAS[fallback] : null;
}

const TEMPLATE_BLUEPRINTS = [
  {
    id: 'proposal',
    title: 'The Perfect Proposal & Confession',
    icon: '💕',
    badge: '🔥 Highest Viral Potential',
    vibe: 'Romantic, Playful & Shock Reaction',
    targetAudience: 'Couples, Crushes, Valentine’s, Anniversaries',
    hooks: [
      {
        title: 'The Dodging "NO" Button Prank',
        hook: '“I sent my partner this link and the NO button literally dodges away when they try to click it 😂”',
        format: 'Screen-record finger tapping while NO button dodges, ending in the YES letter unlock.',
        viralAngle: 'Relatable humor + romantic payoff.',
      },
      {
        title: 'The 2 AM Confession Link',
        hook: '“Stop sending long boring paragraphs. I coded this secret interactive confession link for them instead...”',
        format: 'Aesthetic room lighting, phone in hand showing wax seal opening.',
        viralAngle: 'Aesthetic FOMO & mystery.',
      },
      {
        title: 'Reaction Stitched Video',
        hook: '“Asked my partner to open this during our FaceTime call... watch what happened when they reached the letter 🥺”',
        format: 'FaceTime reaction split-screen with screen capture.',
        viralAngle: 'Emotional empathy & authentic reaction.',
      },
    ],
    script: `[0:00 - 0:02] Hook: "If you want to surprise your favorite person today, do NOT send a standard message..."
[0:02 - 0:08] Show phone screen with the dodging NO button bouncing away from their finger.
[0:08 - 0:15] Reveal the heartfelt confession letter, background music playing, and polaroid photo stack.
[0:15 - 0:20] Call to action: "You can create one in 2 minutes for free at LovelyCrafts. Link in bio + use my code for 10% OFF!"`,
    audioSuggestion: 'Romantic acoustic guitar, Lo-Fi piano beat, or cute cartoon boing sound effect.',
    caption: `Stop sending boring text messages 💕 Made this interactive confession link where the NO button literally dodges away 😂\n\nLink in my bio to craft yours in 2 minutes!\n👉 Use my code for 10% OFF 🎟️\n\n#lovelycrafts #relationshipgoals #romanticgift #couples #proposalideas #boyfriendgift #girlfriendgift`,
  },
  {
    id: 'birthday',
    title: 'Virtual Birthday Bash',
    icon: '🎂',
    badge: '⭐ Highest Conversion',
    vibe: 'Celebratory, Festive & Midnight Reveals',
    targetAudience: 'Best friends, Siblings, Partners, Long Distance',
    hooks: [
      {
        title: '11:59 PM Midnight Countdown',
        hook: '“It’s 11:59 PM. Sending my best friend this private surprise link right at midnight 🎂🎈”',
        format: 'Clock ticking 11:59 -> 12:00 -> WhatsApp link click -> Balloon popping & cake cutting animation.',
        viralAngle: 'Urgency & wholesome friendship.',
      },
      {
        title: 'Virtual Cake Cutting Across Miles',
        hook: '“We live in different cities, so I sent them a digital cake they can actually cut on their phone!”',
        format: 'Finger dragging across the cake to cut slice + confetti shower.',
        viralAngle: 'Long-distance relatability.',
      },
      {
        title: 'The 5 Balloon Memory Pop',
        hook: '“Every balloon you pop reveals a secret memory note from the past 5 years...”',
        format: 'Tapping each balloon to pop sound with memory photos fading in.',
        viralAngle: 'Nostalgia & deep emotional value.',
      },
    ],
    script: `[0:00 - 0:03] "Here's the cutest midnight birthday surprise you can send someone in under 2 minutes 🎈"
[0:03 - 0:09] Screen record: Tap to pop personalized balloons, revealing funny inside jokes.
[0:09 - 0:14] Slice the birthday cake on screen with celebratory music.
[0:14 - 0:18] "Custom link + WhatsApp 1-click delivery. Use my code in bio for 10% off!"`,
    audioSuggestion: 'Upbeat birthday lofi, Taylor Swift / romantic celebration sound, or upbeat pop instrumental.',
    caption: `The cutest midnight birthday surprise for your favorite human 🎂🎈 They get to pop balloons, cut virtual cake, and read your letter!\n\nCreate yours in 2 mins via link in bio!\n👉 Use code for 10% OFF ✨\n\n#birthdaygift #bestfriendgift #midnightsurprise #birthdayideas #lovelycrafts #longdistancegift`,
  },
  {
    id: 'anniversary',
    title: 'Anniversary Special',
    icon: '🥂',
    badge: '💍 High Order Value',
    vibe: 'Nostalgic, Heartfelt & Cinematic',
    targetAudience: 'Couples, 1st Anniversary, Milestone Years, Married Partners',
    hooks: [
      {
        title: 'The Exact Minutes We’ve Loved Each Other',
        hook: '“Did you know we’ve been together for exactly 1,095 days, 26,280 hours, and 1,576,800 minutes? Look at this live counter...”',
        format: 'Zoom in on live ticking anniversary odometer.',
        viralAngle: 'Crazy stats & sentimental love.',
      },
      {
        title: 'The 5 Reasons Why I Love You Card',
        hook: '“Instead of buying an expensive anniversary card that gets thrown away, I made this forever keepsake link 🥂”',
        format: 'Flipping through glowing polaroids and champagne clink moment.',
        viralAngle: 'Eco-friendly, modern, interactive card.',
      },
    ],
    script: `[0:00 - 0:03] "For our anniversary, I didn't want another paper card that ends up in a drawer..."
[0:03 - 0:10] Show live milestone timer calculating days/hours together, plus animated timeline.
[0:10 - 0:15] Show them clinking virtual glasses and reading sealed heartfelt letter.
[0:15 - 0:20] "You can customize everything in minutes. Link in bio + discount code!"`,
    audioSuggestion: 'Golden Hour instrumental, Romantic cello/piano, or vintage vinyl aesthetic audio.',
    caption: `Our entire relationship story in one private interactive link 🥂✨ Live timer, photo timeline, and a sealed letter they can keep forever.\n\nCraft one for your partner via link in bio!\n👉 10% OFF code in bio 💌\n\n#anniversarygift #relationshipmilestone #couplesgift #anniversarysurprise #lovelycrafts`,
  },
  {
    id: 'missyou',
    title: 'I Miss You & Distance Radar',
    icon: '🌌',
    badge: '🚀 High Share Rate',
    vibe: 'Celestial, Deep Emotional & Long Distance',
    targetAudience: 'LDR couples, friends who moved away, exchange students, travelers',
    hooks: [
      {
        title: 'The 10,000 km Virtual Hug Transmitter',
        hook: '“We are 8,400 kilometers apart right now. Watch this virtual hug transmitter send across the world...”',
        format: 'Live orbital distance radar tracking distance between 2 cities + heart pulsing transmitter.',
        viralAngle: 'Heartstrings, distance empathy, high comment engagement.',
      },
      {
        title: '5 Cassette Tape Memories',
        hook: '“I made them 5 digital cassette tapes with our special songs and secret late-night notes 📼”',
        format: 'Spinning retro cassette wheels with audio waveforms playing.',
        viralAngle: 'Retro aesthetic + personalized nostalgia.',
      },
    ],
    script: `[0:00 - 0:03] "Missing someone far away today? Send them this celestial memory bridge 🌌"
[0:03 - 0:09] Show orbital distance radar showing their exact km gap, then tap virtual hug.
[0:09 - 0:15] Play 5 cassette tapes with memory photos across the miles.
[0:15 - 0:20] "Made this on LovelyCrafts in 3 mins. Link in bio + discount code!"`,
    audioSuggestion: 'Celestial ambient synth, Space song / Beach House, or soft emotional violin.',
    caption: `Miles mean nothing when someone means so much 🌌 Sent my person an orbital distance radar and virtual hug transmitter across the miles 🫂\n\nCraft yours for your long-distance person via link in bio!\n👉 Use code for 10% OFF 🚀\n\n#longdistancerelationship #ldrcouples #imissyou #longdistancegift #lovelycrafts #ldrlove`,
  },
  {
    id: 'sorry',
    title: "I'm Sorry & Second Chances",
    icon: '🥺',
    badge: '❤️ Sincere & Relatable',
    vibe: 'Forgiving, Gentle, Healing',
    targetAudience: 'Partners after a fight, friends making amends, apologies',
    hooks: [
      {
        title: 'The Forgiveness Interactive Letter',
        hook: '“When standard ‘sorry’ texts feel empty... this gave them the space to truly feel my words 🥺”',
        format: 'Soft lighting, opening wax seal, handwritten cursive animation.',
        viralAngle: 'Real vulnerability and relationship reconciliation.',
      },
    ],
    script: `[0:00 - 0:03] "If you owe someone a sincere apology, here is how to say it from the heart..."
[0:03 - 0:09] Show wax seal breaking open, cursive handwritten apology letter filling the screen.
[0:09 - 0:15] Forgiving YES/NO moment giving them space to smile again.
[0:15 - 0:20] "Link in bio to craft an apology experience on LovelyCrafts."`,
    audioSuggestion: 'Soft melancholic acoustic guitar or quiet rainfall with soft piano.',
    caption: `Saying sorry is hard, but saying it sincerely matters most 🥺 Sincere handwritten letter experience sealed with love.\n\nLink in bio to craft yours.\n👉 10% OFF with code in bio 💌\n\n#imsorry #apologyletter #secondchance #relationshiprepair #lovelycrafts`,
  },
];

const PROVEN_COPY_TEMPLATES = [
  {
    channel: 'Instagram Story (3-Frame Strategy)',
    emoji: '📸',
    frames: [
      {
        frame: 'Frame 1 (Poll Sticker)',
        text: 'Who has an anniversary / birthday coming up this month? 👀 [ Yes! / Next Month / Need gift ideas ]',
      },
      {
        frame: 'Frame 2 (Video Preview)',
        text: 'Instead of buying a regular paper card that gets thrown away, check this interactive surprise studio I partnered with ❤️✨',
      },
      {
        frame: 'Frame 3 (Link Sticker + Code)',
        text: 'Use my code [YOUR_CODE] for 10% OFF your entire order! 🎁 Tap the link sticker below to customize yours in 2 minutes 👇',
      },
    ],
  },
  {
    channel: 'WhatsApp Broadcast / Status',
    emoji: '📲',
    text: `✨ Hey everyone! If you have someone special you want to surprise (Birthday, Proposal, Anniversary, or just missing them 💖), I partnered with LovelyCrafts to give you an exclusive discount!

🎁 Create a private, animated memory link with music, sealed letters & photos in 2 minutes!

👉 Visit my link: lovelycrafts.in/c/[YOUR_SLUG]
🏷️ Use code *[YOUR_CODE]* for *10% OFF* at checkout!`,
  },
  {
    channel: 'Instagram / TikTok Bio Optimization',
    emoji: '🔗',
    text: `✨ Personalized Digital Surprises & Keepsakes 💕
🎁 Use code [YOUR_CODE] for 10% OFF
👇 Craft your private surprise link:
lovelycrafts.in/c/[YOUR_SLUG]`,
  },
];

const GOLDEN_RULES = [
  {
    title: '1. The 3-Second Hook Rule',
    desc: 'Never start by saying "Hey guys today I will show you...". Start directly with the action: "Watch what happens when they click this..." or show the dodging button immediately.',
    icon: '⚡',
  },
  {
    title: '2. Maximize Screen Recording Clarity',
    desc: 'Turn phone brightness to 100%, enable Do Not Disturb, and record the interactive animations smoothly so text and photos look crisp on phone feeds.',
    icon: '📱',
  },
  {
    title: '3. Highlight WhatsApp 1-Click Sharing',
    desc: 'Viewers love convenience. Explicitly mention: "Once unlocked, you get a private WhatsApp link to send instantly whenever you are ready."',
    icon: '🚀',
  },
  {
    title: '4. Best Posting Windows',
    desc: 'Relationship and emotional content performs best between 8:30 PM – 11:30 PM when users are winding down and texting loved ones.',
    icon: '🌙',
  },
  {
    title: '5. Always Pin Your Comment',
    desc: 'Pin your comment on Instagram/TikTok: "Craft your surprise link in bio! Use code [CODE] for 10% OFF 💕"',
    icon: '📌',
  },
];

const PILLARS = [
  { emoji: '❤️', title: 'Love', ideas: ['Couples & partners', 'Romantic confessions', 'Long-distance relationships', 'Proposals & love letters'] },
  { emoji: '🎂', title: 'Birthdays', ideas: ['Midnight surprise sends', 'Best-friend birthday Reels', 'Birthday reaction videos', 'Balloon & cake interactions'] },
  { emoji: '🥂', title: 'Anniversaries', ideas: ['Relationship milestones', 'Live time counter', 'Photo memory museum', 'Vow tablets reveal'] },
  { emoji: '🥹', title: 'Missing Someone', ideas: ['Long-distance couples', 'Friends studying abroad', 'Family living far away', 'Moving-away content'] },
  { emoji: '🕊️', title: 'Apologies', ideas: ['Saying sorry sincerely', 'Rebuilding trust', 'Heartfelt messages', 'Second chance stories'] },
  { emoji: '😂', title: 'Relatable', ideas: ['"Tag someone who would do this"', '"Send this to the person who owes you an apology"', '"Your sign to stop sending boring texts"'] },
  { emoji: '🎁', title: 'Gift Ideas', ideas: ['5 gifts you can send without a store', '"What to send when they say I don\'t want anything"', 'Gifts that need no delivery'] },
  { emoji: '✨', title: 'Discovery', ideas: ['"I just found a website that..."', '"This is not a normal birthday website"', '"Wait until you see what happens at the end"'] },
  { emoji: '🎥', title: 'Behind the Scenes', ideas: ['Creating the surprise', 'Choosing photos', 'Writing the message', 'Recipient opening it live'] },
  { emoji: '💬', title: 'Community', ideas: ['"Who would you send this to?"', '"What memory would you add?"', '"Birthday or Anniversary?"'] },
];

const REEL_FORMATS = [
  { num: 1, title: '"I Made This For..."', hook: '"I made my girlfriend a surprise she wasn\'t expecting..."', steps: ['Show creating it', 'Show the template & customization', 'Show sending', 'Show their reaction'], end: '"Would you make one for someone?"' },
  { num: 2, title: '"Normal Message vs LovelyCrafts"', hook: '"There\'s a difference between wishing someone and making them feel special."', steps: ['Scene 1: Normal WhatsApp "Happy Birthday ❤️"', 'Scene 2: Interactive experience → animations → memories → letter'] },
  { num: 3, title: '"Wait Until The End"', hook: '"I made my boyfriend something... wait until the end."', steps: ['Slowly reveal the experience', 'Keep the final scene for last', 'Works for: Proposal, Birthday, Anniversary, Apology, I Miss You'] },
  { num: 4, title: '"Their Reaction"', hook: 'Keep focus entirely on the recipient.', steps: ['0–2s: Reaction teaser', '2–5s: "I made this for her."', '5–15s: Show the experience', '15–25s: Full reaction', 'Final: "Sometimes the best gift is the feeling."'] },
  { num: 5, title: 'POV', hook: '"POV: Your girlfriend opens the birthday surprise you made at midnight."', steps: ['Show entire experience from recipient perspective', 'Add emotional music', 'Final text overlay CTA'] },
  { num: 6, title: '"3 Reasons"', hook: '"3 reasons I\'d choose an interactive surprise over a normal message."', steps: ['1. It\'s personal', '2. They actually interact with it', '3. They can keep the experience'] },
  { num: 7, title: '"Things I Wish I Knew"', hook: '"Things I wish I knew before sending a long-distance surprise."', steps: ['Tell a relatable story', 'Demonstrate the experience', 'Show what you\'d do differently'] },
  { num: 8, title: '"Send This To..."', hook: '"Send this to your long-distance best friend."', steps: ['Pick your audience', 'Show the right template for them', 'End with "Tag them in the comments"'] },
  { num: 9, title: '"Rating My Gift"', hook: '"I made my girlfriend an interactive anniversary surprise. Rate my gift out of 10."', steps: ['Create the experience on screen', 'Show it to recipient', 'Show their rating/reaction'] },
  { num: 10, title: '"I Bet You Can\'t..."', hook: '"I bet you can\'t watch the final scene without smiling."', steps: ['Create curiosity', 'Slowly build to the reveal', 'Final scene lands the emotional payoff'] },
];

const CALENDAR = [
  ['1', 'Introduce LovelyCrafts'], ['2', '"Normal message vs interactive surprise"'], ['3', 'Birthday Reel'],
  ['4', 'Story poll'], ['5', 'I Miss You Reel'], ['6', 'Behind the scenes'],
  ['7', '"Who would you send this to?"'], ['8', 'Proposal Reel'], ['9', 'Template walkthrough'],
  ['10', 'Couple POV'], ['11', 'Anniversary Reel'], ['12', 'Question box'],
  ['13', 'Reaction video'], ['14', '"5 gift ideas" Carousel'], ['15', 'I\'m Sorry Reel'],
  ['16', 'Creator talking-head Reel'], ['17', 'Screen recording'], ['18', 'Audience poll'],
  ['19', 'Long-distance POV'], ['20', '"Wait until the end" Reel'], ['21', 'Birthday reaction'],
  ['22', 'Relationship meme'], ['23', 'Template comparison'], ['24', '"Things I wish I knew"'],
  ['25', 'Emotional storytelling'], ['26', 'Creator code reminder'], ['27', '"Send this to..." Reel'],
  ['28', 'Best template compilation'], ['29', 'Audience Q&A'], ['30', '"Who should I make one for next?"'],
];

export default function ContentIdeasPage() {
  const [activeMainTab, setActiveMainTab] = useState('generator'); // 'generator' | 'blueprints' | 'captions' | 'calendar' | 'rules'
  
  // Generator State
  const [genTemplate, setGenTemplate] = useState('proposal');
  const [genType, setGenType] = useState('reel');
  const [genStyle, setGenStyle] = useState('faceless');
  const [genHook, setGenHook] = useState('curiosity');
  const [generatedIdea, setGeneratedIdea] = useState(null);
  const [copiedKey, setCopiedKey] = useState(null);
  const ideaRef = useRef(null);

  // Blueprint Tab State
  const [activeBlueprintTab, setActiveBlueprintTab] = useState('proposal');

  const selectedBlueprint =
    TEMPLATE_BLUEPRINTS.find((t) => t.id === activeBlueprintTab) || TEMPLATE_BLUEPRINTS[0];

  const handleGenerate = () => {
    const idea = getIdea(genTemplate, genType, genStyle, genHook);
    setGeneratedIdea(idea);
    setTimeout(() => {
      ideaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const copyToClipboard = (text, key) => {
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2500);
    });
  };

  return (
    <main className="lc-page-shell" style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #fff1f2 0%, #ffffff 30%, #f8fafc 100%)', padding: '32px 16px 90px' }}>
      <div style={{ maxWidth: '1080px', margin: '0 auto' }}>

        {/* TOP BREADCRUMB & PORTAL ACTIONS */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.88rem', color: '#64748b' }}>
            <Link href="/creator/dashboard" style={{ color: '#e11d48', textDecoration: 'none', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <span>←</span> Creator Dashboard
            </Link>
            <span>/</span>
            <span style={{ fontWeight: 600, color: '#0f172a' }}>Viral Content Playbook</span>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <Link
              href="/creator/dashboard"
              style={{
                background: '#fff',
                color: '#334155',
                border: '1px solid #e2e8f0',
                padding: '8px 14px',
                borderRadius: '10px',
                fontSize: '0.82rem',
                fontWeight: 700,
                textDecoration: 'none',
                boxShadow: '0 2px 4px rgba(0,0,0,0.03)',
              }}
            >
              👑 My Dashboard
            </Link>
            <Link
              href="/creators"
              style={{
                background: '#ffe4e6',
                color: '#be123c',
                padding: '8px 14px',
                borderRadius: '10px',
                fontSize: '0.82rem',
                fontWeight: 700,
                textDecoration: 'none',
              }}
            >
              ⭐ Creator Club
            </Link>
          </div>
        </div>

        {/* HERO BANNER */}
        <header
          style={{
            background: 'linear-gradient(135deg, #be185d 0%, #e11d48 50%, #7c3aed 100%)',
            borderRadius: '24px',
            padding: '40px 28px',
            color: '#fff',
            textAlign: 'center',
            marginBottom: '32px',
            boxShadow: '0 20px 45px -10px rgba(225, 29, 72, 0.3)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div style={{ position: 'absolute', top: '-60px', right: '-60px', width: '240px', height: '240px', background: 'rgba(255,255,255,0.12)', borderRadius: '50%', filter: 'blur(30px)', pointerEvents: 'none' }} />
          <div style={{ position: 'relative', zIndex: 2 }}>
            <span style={{ display: 'inline-block', background: 'rgba(255, 255, 255, 0.22)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.3)', padding: '5px 14px', borderRadius: '999px', fontSize: '0.78rem', fontWeight: 800, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '14px' }}>
              💡 Creator Content Engine &amp; Viral Playbook
            </span>
            <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 900, margin: '0 0 12px', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
              Never Run Out Of Content Ideas Again
            </h1>
            <p style={{ maxWidth: '640px', margin: '0 auto', fontSize: '1rem', color: '#ffe4e6', lineHeight: 1.6 }}>
              Proven 20-second Reel blueprints, viral video hooks, high-converting copy, and an interactive script generator designed to turn views into orders.
            </p>
          </div>
        </header>

        {/* MAIN NAVIGATION TABS */}
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '28px', scrollbarWidth: 'none' }}>
          {[
            { id: 'generator', label: '⚡ Interactive Script Generator', icon: '🪄' },
            { id: 'blueprints', label: '🎬 Template Blueprints & Hooks', icon: '📋' },
            { id: 'captions', label: '📝 Ready-To-Post Captions', icon: '💬' },
            { id: 'calendar', label: '🗓️ 30-Day Content Roadmap', icon: '📅' },
            { id: 'rules', label: '🧠 Golden Rules & Best Practices', icon: '💎' },
          ].map((tab) => {
            const isActive = activeMainTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveMainTab(tab.id)}
                style={{
                  background: isActive ? '#e11d48' : '#fff',
                  color: isActive ? '#fff' : '#475569',
                  border: isActive ? '1px solid #e11d48' : '1px solid #e2e8f0',
                  padding: '10px 18px',
                  borderRadius: '12px',
                  fontSize: '0.86rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  boxShadow: isActive ? '0 4px 12px rgba(225,29,72,0.25)' : '0 1px 3px rgba(0,0,0,0.03)',
                  transition: 'all 0.15s ease',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: INTERACTIVE SCRIPT GENERATOR */}
        {activeMainTab === 'generator' && (
          <section style={{ background: '#fff', borderRadius: '24px', padding: '32px', border: '1px solid #e2e8f0', boxShadow: '0 8px 30px rgba(0,0,0,0.04)', marginBottom: '32px' }}>
            <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#ffe4e6', color: '#a64036', padding: '4px 12px', borderRadius: '999px', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '8px' }}>
                Instant AI-Style Strategy Tool
              </div>
              <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0f172a', margin: '0 0 6px' }}>
                Customize Your Video Hook &amp; Script
              </h2>
              <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0 }}>
                Select your digital gift template, post format, creator style, and hook tone to generate a custom 20-second blueprint with audio recommendations.
              </p>
            </div>

            {/* SELECTION CONTROLS */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                  1. Choose Template
                </label>
                <select
                  value={genTemplate}
                  onChange={(e) => setGenTemplate(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.88rem', fontWeight: 600, color: '#43332b', background: '#f8fafc' }}
                >
                  {TEMPLATES.map((t) => (
                    <option key={t.id} value={t.id}>{t.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                  2. Content Type
                </label>
                <select
                  value={genType}
                  onChange={(e) => setGenType(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.88rem', fontWeight: 600, color: '#43332b', background: '#f8fafc' }}
                >
                  {CONTENT_TYPES.map((t) => (
                    <option key={t.id} value={t.id}>{t.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                  3. Creator Style
                </label>
                <select
                  value={genStyle}
                  onChange={(e) => setGenStyle(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.88rem', fontWeight: 600, color: '#43332b', background: '#f8fafc' }}
                >
                  {STYLES.map((s) => (
                    <option key={s.id} value={s.id}>{s.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                  4. Hook Angle
                </label>
                <select
                  value={genHook}
                  onChange={(e) => setGenHook(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.88rem', fontWeight: 600, color: '#43332b', background: '#f8fafc' }}
                >
                  {HOOK_TYPES.map((h) => (
                    <option key={h.id} value={h.id}>{h.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGenerate}
              style={{
                background: 'linear-gradient(135deg, #e11d48 0%, #be123c 100%)',
                color: '#fff',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '12px',
                fontSize: '0.95rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 14px rgba(225,29,72,0.3)',
              }}
            >
              <span>🪄</span> Generate Script &amp; Strategy
            </button>

            {/* GENERATED RESULT CARD */}
            {generatedIdea && (
              <div
                ref={ideaRef}
                style={{
                  marginTop: '28px',
                  background: '#fdf2f8',
                  borderRadius: '20px',
                  padding: '24px',
                  border: '1px solid #fbcfe8',
                  boxShadow: '0 4px 20px rgba(225,29,72,0.06)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
                  <span style={{ background: '#be185d', color: '#fff', padding: '4px 10px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 800 }}>
                    Generated Blueprint ✨
                  </span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(`${generatedIdea.hook}\n\nSCRIPT:\n${generatedIdea.script}\n\nCAPTION:\n${generatedIdea.caption}`, 'gen_all')}
                    style={{ background: copiedKey === 'gen_all' ? '#f8f3eb' : '#fff', color: copiedKey === 'gen_all' ? '#fff' : '#a64036', border: '1px solid #f472b6', padding: '6px 14px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}
                  >
                    {copiedKey === 'gen_all' ? '✓ Copied All!' : 'Copy Entire Blueprint 📋'}
                  </button>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#be185d', textTransform: 'uppercase', marginBottom: '4px' }}>
                    1. The 3-Second Viral Hook
                  </div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#43332b', background: '#fff', padding: '12px 16px', borderRadius: '12px', border: '1px solid #fce7f3' }}>
                    {generatedIdea.hook}
                  </div>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#be185d', textTransform: 'uppercase', marginBottom: '4px' }}>
                    2. 20-Second Scene Breakdown
                  </div>
                  <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', fontSize: '0.9rem', color: '#43332b', background: '#fff', padding: '14px 16px', borderRadius: '12px', border: '1px solid #fce7f3', margin: 0, lineHeight: 1.6 }}>
                    {generatedIdea.script}
                  </pre>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#be185d', textTransform: 'uppercase', marginBottom: '4px' }}>
                      3. Recommended Audio Vibe
                    </div>
                    <div style={{ fontSize: '0.9rem', color: '#43332b', background: '#fff', padding: '12px 16px', borderRadius: '12px', border: '1px solid #fce7f3', fontWeight: 600 }}>
                      🎵 {generatedIdea.audio}
                    </div>
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#be185d', textTransform: 'uppercase' }}>
                        4. 1-Click Caption &amp; Hashtags
                      </div>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(generatedIdea.caption, 'gen_caption')}
                        style={{ background: 'transparent', border: 'none', color: '#a64036', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                      >
                        {copiedKey === 'gen_caption' ? '✓ Copied' : 'Copy Caption 📋'}
                      </button>
                    </div>
                    <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', fontSize: '0.85rem', color: '#43332b', background: '#fff', padding: '12px 16px', borderRadius: '12px', border: '1px solid #fce7f3', margin: 0, lineHeight: 1.5 }}>
                      {generatedIdea.caption}
                    </pre>
                  </div>
                </div>
              </div>
            )}
          </section>
        )}

        {/* TAB 2: TEMPLATE BLUEPRINTS & HOOKS */}
        {activeMainTab === 'blueprints' && (
          <section style={{ marginBottom: '32px' }}>
            {/* SUB-TABS: CHOOSE TEMPLATE */}
            <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '12px', marginBottom: '20px' }}>
              {TEMPLATE_BLUEPRINTS.map((tmpl) => {
                const isActive = activeBlueprintTab === tmpl.id;
                return (
                  <button
                    key={tmpl.id}
                    type="button"
                    onClick={() => setActiveBlueprintTab(tmpl.id)}
                    style={{
                      background: isActive ? '#fff' : '#f1f5f9',
                      color: isActive ? '#e11d48' : '#475569',
                      border: isActive ? '2px solid #e11d48' : '1px solid #cbd5e1',
                      padding: '10px 18px',
                      borderRadius: '12px',
                      fontSize: '0.88rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      boxShadow: isActive ? '0 4px 12px rgba(225,29,72,0.15)' : 'none',
                    }}
                  >
                    <span>{tmpl.icon}</span>
                    <span>{tmpl.title}</span>
                  </button>
                );
              })}
            </div>

            {/* BLUEPRINT DETAILS CARD */}
            <div style={{ background: '#fff', borderRadius: '24px', padding: '32px', border: '1px solid #e2e8f0', boxShadow: '0 8px 30px rgba(0,0,0,0.04)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '24px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <span style={{ fontSize: '1.8rem' }}>{selectedBlueprint.icon}</span>
                    <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                      {selectedBlueprint.title}
                    </h2>
                  </div>
                  <div style={{ display: 'flex', gap: '12px', fontSize: '0.84rem', color: '#64748b', flexWrap: 'wrap' }}>
                    <span>Vibe: <strong style={{ color: '#0f172a' }}>{selectedBlueprint.vibe}</strong></span>
                    <span>•</span>
                    <span>Audience: <strong style={{ color: '#0f172a' }}>{selectedBlueprint.targetAudience}</strong></span>
                  </div>
                </div>

                <span style={{ background: '#fdf2f8', color: '#a64036', padding: '6px 14px', borderRadius: '999px', fontSize: '0.78rem', fontWeight: 800, border: '1px solid #fbcfe8' }}>
                  {selectedBlueprint.badge}
                </span>
              </div>

              {/* VIRAL HOOKS SECTION */}
              <div style={{ marginBottom: '28px' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>🎯</span> 3 High-Retention Hooks For This Template:
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
                  {selectedBlueprint.hooks.map((h, i) => (
                    <div key={i} style={{ background: '#f8fafc', borderRadius: '16px', padding: '18px', border: '1px solid #e2e8f0' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#e11d48', textTransform: 'uppercase' }}>{h.title}</span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(h.hook, `hook_${activeBlueprintTab}_${i}`)}
                          style={{ background: 'transparent', border: 'none', color: '#43332b', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                        >
                          {copiedKey === `hook_${activeBlueprintTab}_${i}` ? '✓ Copied' : 'Copy 📋'}
                        </button>
                      </div>
                      <p style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.92rem', margin: '0 0 8px', lineHeight: 1.4 }}>{h.hook}</p>
                      <div style={{ fontSize: '0.78rem', color: '#64748b', lineHeight: 1.4 }}>
                        <div><strong>Format:</strong> {h.format}</div>
                        <div><strong>Viral Angle:</strong> {h.viralAngle}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* TIMED SCRIPT BREAKDOWN */}
              <div style={{ marginBottom: '28px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    ⏱️ 20-Second Scene-By-Scene Script
                  </h3>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(selectedBlueprint.script, `script_${activeBlueprintTab}`)}
                    style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '4px 10px', borderRadius: '8px', color: '#43332b', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                  >
                    {copiedKey === `script_${activeBlueprintTab}` ? '✓ Copied' : 'Copy Script 📋'}
                  </button>
                </div>
                <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', fontSize: '0.88rem', color: '#43332b', background: '#f8fafc', padding: '16px', borderRadius: '14px', border: '1px solid #e2e8f0', margin: 0, lineHeight: 1.6 }}>
                  {selectedBlueprint.script}
                </pre>
              </div>

              {/* AUDIO & CAPTION */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: '0 0 8px' }}>
                    🎵 Audio Suggestion
                  </h3>
                  <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '14px', border: '1px solid #e2e8f0', fontSize: '0.88rem', color: '#43332b', lineHeight: 1.5 }}>
                    {selectedBlueprint.audioSuggestion}
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                      📝 Ready-to-Use Caption
                    </h3>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(selectedBlueprint.caption, `cap_${activeBlueprintTab}`)}
                      style={{ background: '#ffe4e6', color: '#a64036', border: 'none', padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                    >
                      {copiedKey === `cap_${activeBlueprintTab}` ? '✓ Copied!' : 'Copy Caption 📋'}
                    </button>
                  </div>
                  <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', fontSize: '0.82rem', color: '#43332b', background: '#f8fafc', padding: '16px', borderRadius: '14px', border: '1px solid #e2e8f0', margin: 0, lineHeight: 1.5 }}>
                    {selectedBlueprint.caption}
                  </pre>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* TAB 3: READY-TO-POST CAPTIONS & STATUS */}
        {activeMainTab === 'captions' && (
          <section style={{ background: '#fff', borderRadius: '24px', padding: '32px', border: '1px solid #e2e8f0', boxShadow: '0 8px 30px rgba(0,0,0,0.04)', marginBottom: '32px' }}>
            <div style={{ marginBottom: '24px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#e11d48', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Distribution Templates
              </span>
              <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0f172a', margin: '4px 0 6px' }}>
                Copy-Paste Social &amp; WhatsApp Templates
              </h2>
              <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0 }}>
                Replace <code>[YOUR_CODE]</code> and <code>[YOUR_SLUG]</code> with your actual creator credentials to start generating orders immediately.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
              {PROVEN_COPY_TEMPLATES.map((tmpl, idx) => (
                <div key={idx} style={{ background: '#f8fafc', borderRadius: '18px', padding: '22px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                      <span style={{ fontSize: '1.3rem' }}>{tmpl.emoji}</span>
                      <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>{tmpl.channel}</h3>
                    </div>

                    {tmpl.frames ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
                        {tmpl.frames.map((f, fIdx) => (
                          <div key={fIdx} style={{ background: '#fff', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '0.84rem' }}>
                            <strong style={{ color: '#e11d48', display: 'block', marginBottom: '4px' }}>{f.frame}:</strong>
                            <span style={{ color: '#334155' }}>{f.text}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace', fontSize: '0.84rem', color: '#43332b', background: '#fff', padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0', margin: '0 0 16px', lineHeight: 1.5 }}>
                        {tmpl.text}
                      </pre>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => copyToClipboard(tmpl.text || tmpl.frames.map((f) => `${f.frame}:\n${f.text}`).join('\n\n'), `tmpl_${idx}`)}
                    style={{
                      background: copiedKey === `tmpl_${idx}` ? '#f8f3eb' : '#fff',
                      color: copiedKey === `tmpl_${idx}` ? '#fff' : '#334155',
                      border: '1px solid #cbd5e1',
                      borderRadius: '10px',
                      padding: '10px',
                      fontSize: '0.84rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      width: '100%',
                    }}
                  >
                    {copiedKey === `tmpl_${idx}` ? '✓ Copied Template!' : 'Copy Template 📋'}
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* TAB 4: 30-DAY CONTENT ROADMAP & PILLARS */}
        {activeMainTab === 'calendar' && (
          <section style={{ background: '#fff', borderRadius: '24px', padding: '32px', border: '1px solid #e2e8f0', boxShadow: '0 8px 30px rgba(0,0,0,0.04)', marginBottom: '32px' }}>
            <div style={{ marginBottom: '24px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#e11d48', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Consistency Blueprint
              </span>
              <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0f172a', margin: '4px 0 6px' }}>
                30-Day Creator Growth Calendar
              </h2>
              <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0 }}>
                Creators who maintain 100+ orders each month follow a structured posting schedule. Use this 30-day framework to stay top of mind.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px', marginBottom: '36px' }}>
              {CALENDAR.map(([day, concept]) => (
                <div key={day} style={{ background: '#f8fafc', padding: '14px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'inline-block', background: '#ffe4e6', color: '#a64036', padding: '2px 8px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 800, marginBottom: '6px' }}>
                    DAY {day}
                  </div>
                  <div style={{ fontSize: '0.84rem', fontWeight: 600, color: '#1e293b', lineHeight: 1.4 }}>
                    {concept}
                  </div>
                </div>
              ))}
            </div>

            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: '0 0 16px' }}>
              🎯 10 High-Converting Content Pillars
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
              {PILLARS.map((pillar) => (
                <div key={pillar.title} style={{ background: '#f8fafc', padding: '16px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '1.4rem', marginBottom: '6px' }}>{pillar.emoji}</div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', margin: '0 0 8px' }}>{pillar.title}</h4>
                  <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '0.78rem', color: '#64748b', lineHeight: 1.5 }}>
                    {pillar.ideas.map((idea, i) => (
                      <li key={i}>{idea}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* TAB 5: GOLDEN RULES & WHAT NOT TO DO */}
        {activeMainTab === 'rules' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginBottom: '32px' }}>
            {/* 5 GOLDEN RULES */}
            <section style={{ background: '#fff', borderRadius: '24px', padding: '32px', border: '1px solid #e2e8f0', boxShadow: '0 8px 30px rgba(0,0,0,0.04)' }}>
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#e11d48', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Conversion Optimization
                </span>
                <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', margin: '4px 0 0' }}>
                  5 Golden Rules for Viral Conversions
                </h2>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
                {GOLDEN_RULES.map((rule, idx) => (
                  <div key={idx} style={{ background: '#f8fafc', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '1.8rem', marginBottom: '8px' }}>{rule.icon}</div>
                    <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: '0 0 6px' }}>{rule.title}</h4>
                    <p style={{ color: '#64748b', fontSize: '0.86rem', lineHeight: 1.5, margin: 0 }}>{rule.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* WHAT NOT TO DO */}
            <section style={{ background: '#fff', borderRadius: '24px', padding: '32px', border: '1px solid #fecdd3', boxShadow: '0 8px 28px rgba(225,29,72,0.06)' }}>
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#be123c', margin: 0 }}>
                  🚫 What Not To Do (Mistakes That Kill Conversions)
                </h3>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '10px', marginBottom: '20px' }}>
                {[
                  'Repeatedly posting: "LovelyCrafts is amazing! Buy now!"',
                  'Copy-pasting the same caption every time',
                  'Using the same Reel concept repeatedly',
                  'Making every video an aggressive sales pitch',
                  'Fake or exaggerated reactions that break trust',
                  'Revealing every scene immediately (kills viewer suspense)',
                  'Spamming your audience with identical Stories',
                  'Over-promising what the digital experience does'
                ].map((w, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', background: '#fff5f5', borderRadius: '12px', padding: '12px 14px', border: '1px solid #fecdd3' }}>
                    <span style={{ color: '#e11d48', fontSize: '1rem', flexShrink: 0 }}>✗</span>
                    <span style={{ color: '#7f1d1d', fontSize: '0.85rem', lineHeight: 1.45 }}>{w}</span>
                  </div>
                ))}
              </div>
              <div style={{ background: '#f0fdf4', borderRadius: '14px', padding: '16px 20px', border: '1px solid #bbf7d0', textAlign: 'center' }}>
                <div style={{ fontWeight: 800, color: '#15803d', fontSize: '0.95rem', marginBottom: '2px' }}>✅ The Golden Mindset</div>
                <div style={{ color: '#166534', fontSize: '0.88rem' }}>
                  <strong>Story first. Product second.</strong> People do not share advertisements — they share reactions, relationships, memories, and authentic emotions.
                </div>
              </div>
            </section>
          </div>
        )}

      </div>
    </main>
  );
}
