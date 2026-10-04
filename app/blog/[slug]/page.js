import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getAdminDb } from '@/lib/firebase-admin';
import { SITE_URL, SITE_NAME } from '@/lib/seo';
import BlogBlocks from '@/components/BlogBlocks';
import BlogShareButtons from '@/components/BlogShareButtons';

export const revalidate = 60; // ISR

const SEED_POSTS = {
  '10-creative-virtual-birthday-surprises': {
    id: 'seed-1',
    slug: '10-creative-virtual-birthday-surprises',
    title: '10 Creative Virtual Birthday Surprises: Janamdin Wishes & Midnight Gift Ideas',
    excerpt: 'Distance shouldn’t stop you from creating an unforgettable 12 AM celebration. Janamdin wishes, interactive photo puzzles aur romantic music letters se banayein unka birthday super special.',
    coverImage: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=1200&q=80',
    tags: ['birthday', 'janamdin', 'long distance', 'virtual surprise', 'hinglish wishes'],
    author: 'LovelyCrafts Editorial',
    publishedAt: '2026-09-15T00:00:00.000Z',
    blocks: [
      {
        type: 'paragraph',
        content: 'Birthdays are meant to feel magical, chahe aap apne partner, best friend ya family se kitne bhi door kyun na ho. Long-distance relationships (LDR) me sabse badi challenge hoti hai midnight 12:00 AM celebration ko unforgettable banana. Ek standard WhatsApp text forward karne ke bajaye, interactive digital surprises unke dil ko chhu lete hain.',
      },
      {
        type: 'heading',
        level: 2,
        content: '1. Midnight Interactive Janamdin Countdown with Lock Timer',
      },
      {
        type: 'paragraph',
        content: 'Ek custom link banayein jo theek raat 12:00 baje unlock ho. Jaise hi wo link open karein, screen par grand confetti fireworks, birthday background song, aur aapki voice note play hone lage. Ye normal text se 100x zyada exciting lagta hai!',
      },
      {
        type: 'callout',
        calloutType: 'tip',
        title: 'Pro Tip for Midnight Surprises (Janamdin Special)',
        content: 'Unka favorite Bollywood ya acoustic romantic gana background mein lagayein. Music memory se connect karta hai aur dooriyan ekdum gayab ho jati hain.',
      },
      {
        type: 'heading',
        level: 2,
        content: '2. Interactive Photo Puzzle Challenge (Yaadon Ka Khel)',
      },
      {
        type: 'paragraph',
        content: 'Aapki sabse cute selfie ya travel memory ko ek digital jigsaw puzzle mein convert karein. Screen par pieces arrange karne ke baad hi unka hidden birthday love message reveal hoga.',
      },
      {
        type: 'quote',
        content: 'Dooriyan sirf physical hoti hain. Aapke dwara banaya gaya ek digital surprise dikhata hai ki aap dil ke kitne kareeb hain.',
        attribution: 'LovelyCrafts Stories',
      },
      {
        type: 'heading',
        level: 2,
        content: '3. "Open When..." Virtual Envelopes Vault',
      },
      {
        type: 'paragraph',
        content: 'Birthday week ke liye unhe ek interactive collection virtual lifafon (envelopes) ka bhejiye:\n\n• "Open when you miss my tight hug"\n• "Open when you need a good laugh (funny meme)"\n• "Open when you want to remember our first date"',
      },
      {
        type: 'cta',
        title: 'Create Your Birthday Surprise in 2 Minutes',
        content: 'Choose from interactive templates with photo puzzles, memory roadmaps, and custom songs.',
        link: '/templates/birthday',
        buttonText: 'Craft Virtual Birthday Surprise →',
      },
    ],
  },
  'how-to-write-an-emotional-apology-letter': {
    id: 'seed-2',
    slug: 'how-to-write-an-emotional-apology-letter',
    title: 'How to Write a Sincere Apology Letter: Dil Se Maafi Mangne Ka Sahi Tarika',
    excerpt: 'Saying sorry is tough, but jab words fail ho jayein to ek thoughtful apology letter with shared memories aur gentle music gives both of you space to heal. Dil se maafi mangne ke best ideas.',
    coverImage: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=1200&q=80',
    tags: ['apology', 'maafi', 'relationships', 'dil se', 'sorry letter'],
    author: 'LovelyCrafts Editorial',
    publishedAt: '2026-09-10T00:00:00.000Z',
    blocks: [
      {
        type: 'paragraph',
        content: 'Relationship me ladai aur ghalatfehmi (misunderstandings) hona bilkul normal hai. Lekin gusse me kahe gaye shabd dil ko thes pahunchate hain. Call par ya aamne-saamne baat karte waqt arguments badh sakte hain, par ek shaant, respectful digital maafi patra (apology card) healing ka raasta khol deta hai.',
      },
      {
        type: 'heading',
        level: 2,
        content: 'Dil Se Maafi Mangne Ke 4 Zaroori Niyam (The 4 Pillars of Apology)',
      },
      {
        type: 'list',
        ordered: true,
        items: [
          'Bina kisi bahane (excuse) ke apni galti accept karein — no "lekin" or "par".',
          'Samne wale ke hurt feelings ko acknowledge karein: "Mujhe ehsaas hai ki maine tumhe dukh diya."',
          'Aage aisi galti na dohrane ka wada aur solution batayein.',
          'Unhe gussa shaant karne ka waqt dein bina foran forgiveness demand kiye.',
        ],
      },
      {
        type: 'callout',
        calloutType: 'heart',
        title: 'Why a Digital Apology Letter Works Better',
        content: 'WhatsApp par lambe paragraph typing mein tone samajh nahi aati. Ek soft ambient music aur shared purani yaadon ke sath bheja gaya digital card unke dil ko shanti deta hai.',
      },
      {
        type: 'cta',
        title: 'Craft a Gentle Apology Card',
        content: 'Send a quiet, private page with your heartfelt words, a voice apology note, and calm background music.',
        link: '/templates/emotional-apology',
        buttonText: 'Craft Apology Card Dil Se →',
      },
    ],
  },
  'romantic-anniversary-surprises-couples-salgirah': {
    id: 'seed-3',
    slug: 'romantic-anniversary-surprises-couples-salgirah',
    title: 'Romantic Anniversary Surprises: Salgirah Mubarak Wishes & Custom Couple Timeline',
    excerpt: 'Pehli date se lekar shaadi tak ki sweet memories ko ek interactive digital timeline mein celebrate karein. Unique anniversary surprises and heartfelt prem sandesh for couples.',
    coverImage: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=1200&q=80',
    tags: ['anniversary', 'salgirah', 'couples', 'romance', 'pyar'],
    author: 'LovelyCrafts Editorial',
    publishedAt: '2026-09-05T00:00:00.000Z',
    blocks: [
      {
        type: 'paragraph',
        content: 'Marriage ya relationship anniversary sirf ek date nahi hoti — ye do dilon ke sath bitaye gaye har pyare pal, mushkil waqt me ek-dusre ka sath dene aur hazaron meethi yaadon ka jashn hota hai. Salgirah mubarak wishes ko special banane ke liye normal cake & bouquet se aage sochein.',
      },
      {
        type: 'heading',
        level: 2,
        content: '1. The Couple Memory Roadmap (Hamari Prem Kahani Timeline)',
      },
      {
        type: 'paragraph',
        content: 'Interactive timeline banayein jismein "Pehli Mulaqaat", "First Road Trip", "First Valentine" aur "Shaadi Ka Din" chronologically unfold ho. Har milestone ke sath aapki favorite photo aur ek romantic note embed karein.',
      },
      {
        type: 'callout',
        calloutType: 'info',
        title: 'Anniversary Shayari & Wishes Idea',
        content: '"Zindagi ki har subah tere naam se shuru ho, har shaam teri baahon me guzar jaye... Salgirah Mubarak my love!" — Add custom Hindi shayari to your digital scrapbook.',
      },
      {
        type: 'cta',
        title: 'Create Your Anniversary Story Page',
        content: 'Build a gorgeous relationship timeline with interactive chapters and romantic melodies.',
        link: '/templates/anniversary',
        buttonText: 'Create Anniversary Surprise →',
      },
    ],
  },
  'modern-proposal-ideas-interactive-story': {
    id: 'seed-4',
    slug: 'modern-proposal-ideas-interactive-story',
    title: 'The Modern Digital Proposal: Dil Ka Izhaar with an Interactive Story',
    excerpt: 'Take your partner on a nostalgic photo-by-photo journey of your relationship before revealing the ultimate question. Izhaar-e-ishq with custom romantic melodies and confetti surprises.',
    coverImage: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=1200&q=80',
    tags: ['proposal', 'izhaar', 'romance', 'love story', 'guides'],
    author: 'LovelyCrafts Editorial',
    publishedAt: '2026-08-28T00:00:00.000Z',
    blocks: [
      {
        type: 'paragraph',
        content: 'Proposals don’t always require a stadium jumbotron or an expensive setup. Kabhi kabhi sabse khoobsurat dil ka izhaar (proposal) wo hota hai jo bohot personal, intimate aur emotional ho.',
      },
      {
        type: 'heading',
        level: 2,
        content: 'A Walk Down Memory Lane: Izhaar-e-Ishq',
      },
      {
        type: 'paragraph',
        content: 'Apne partner ko ek customized interactive digital scrapbook bhejiye jo chapter by chapter unroll hoti hai — wo pehli coffee date, late night WhatsApp talks, aur wo pal jab aapko pata chala ki yehi wo insaan hai jiske sath aap saari zindagi bitana chahte hain.',
      },
      {
        type: 'cta',
        title: 'Craft Your Digital Proposal Experience',
        content: 'Set up an interactive question reveal with "Yes" confetti fireworks and custom romantic melodies.',
        link: '/templates/proposal',
        buttonText: 'Craft Proposal Surprise →',
      },
    ],
  },
  'valentines-day-pyaar-bhare-sandesh-love-letters': {
    id: 'seed-5',
    slug: 'valentines-day-pyaar-bhare-sandesh-love-letters',
    title: 'Valentine’s Day Surprise Ideas: Pyaar Bhare Sandesh & Digital Love Letters',
    excerpt: 'Is Valentine par normal chocolates ke bajaye bhejiye ek musical digital love letter jismein ho aapki favorite photos, romantic shayari aur cute voice notes. Perfect gift for your girlfriend or boyfriend.',
    coverImage: 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=1200&q=80',
    tags: ['valentines', 'pyaar', 'love letters', 'shayari', 'romantic gifts'],
    author: 'LovelyCrafts Editorial',
    publishedAt: '2026-08-22T00:00:00.000Z',
    blocks: [
      {
        type: 'paragraph',
        content: 'Valentine’s week par Rose Day se lekar Valentine’s Day tak log wahi standard greetings forward karte hain. Agar aap apne boyfriend, girlfriend, husband ya wife ko sach me surprise karna chahte hain, to ek digital musical love letter send karein jismein dil ke jazbaat shabdon aur tasveeron mein bayaan ho.',
      },
      {
        type: 'heading',
        level: 2,
        content: 'Digital Love Letters Kyun Hain Special?',
      },
      {
        type: 'list',
        ordered: false,
        items: [
          'Background mein aapka special couple song auto-play hota hai.',
          'Polaroid style animated photo cards with sweet memories.',
          'Custom Hindi shayari aur prem patra jo hamesha unke phone me save rahega.',
          'WhatsApp par ek simple link ke zariye instant delivery, chahe wo kisi bhi city mein hon.',
        ],
      },
      {
        type: 'cta',
        title: 'Create a Valentine Love Letter Link',
        content: 'Express your feelings with heartwarming romantic templates in under 2 minutes.',
        link: '/templates/love-letter',
        buttonText: 'Craft Valentine Love Letter →',
      },
    ],
  },
  'long-distance-relationship-door-hokar-bhi-paas': {
    id: 'seed-6',
    slug: 'long-distance-relationship-door-hokar-bhi-paas',
    title: 'Long Distance Relationship Hacks: Door Hokar Bhi Paas Feel Karane Ke Digital Surprises',
    excerpt: 'LDR mein physical distance ko mitayein smart virtual surprises se. "Open When" virtual envelopes, shared playlist memory roadmaps aur surprise WhatsApp links jo dil jeet lein.',
    coverImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=80',
    tags: ['long distance', 'ldr', 'dooriyan', 'virtual gifts', 'couples'],
    author: 'LovelyCrafts Editorial',
    publishedAt: '2026-08-15T00:00:00.000Z',
    blocks: [
      {
        type: 'paragraph',
        content: 'Long distance relationships me sabse mushkil hota hai wo feeling jab aap unke paas physical presence nahi de sakte. Lekin technology aur thoughtful creativity ki madad se aap unhe har din mehsoos kara sakte hain ki dooriyan dilon ke beech nahi hain.',
      },
      {
        type: 'heading',
        level: 2,
        content: '5 LDR Surprises Jo Unka Din Bana Denge',
      },
      {
        type: 'list',
        ordered: true,
        items: [
          'Subah uthte hi ek interactive good morning memory puzzle link bhejiye.',
          'Virtual Date Night: Dono same time par ek hi meal order karein aur digital love note open karein.',
          'Audio voice messages record karein jo softly background music ke sath play ho.',
          'Future bucket list timeline banayein ki jab milenge to kahan ghoomne jayenge.',
        ],
      },
      {
        type: 'cta',
        title: 'Surprise Your Long Distance Partner',
        content: 'Explore templates crafted specifically to make distance feel like nothing.',
        link: '/templates/ldr',
        buttonText: 'Explore LDR Gift Cards →',
      },
    ],
  },
  'best-friend-birthday-dosti-yaari-scraps': {
    id: 'seed-7',
    slug: 'best-friend-birthday-dosti-yaari-scraps',
    title: 'Bestie Birthday Surprises: Yaari & Dosti Ke Liye Funny Memes + Memory Scrapbook',
    excerpt: 'Apne jigri dost ya best friend ke birthday par bhejiye ek epic digital roast & memory card. Bachpan ki goofy photos, funny friendship tags aur emotional yaari quotes.',
    coverImage: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=80',
    tags: ['friendship', 'dosti', 'bestie birthday', 'yaari', 'funny gifts'],
    author: 'LovelyCrafts Editorial',
    publishedAt: '2026-08-08T00:00:00.000Z',
    blocks: [
      {
        type: 'paragraph',
        content: 'Sachhe doston ke birthday par sirf "Happy Birthday Bro" bolna kafi nahi hai! Dosti me thodi taang khinchai (friendly roast) aur dher saara pyaar hona chahiye. Apne bestie ke liye ek dynamic digital scrapbook banayein jismein funny memes, unki embarrassing photos aur dil ko chhu lene wale yaari moments shamil hon.',
      },
      {
        type: 'heading',
        level: 2,
        content: 'How to Build an Epic Bestie Birthday Card',
      },
      {
        type: 'paragraph',
        content: 'Add goofy tags like "Sabse bada pagal dost", "Always late", "Bill pay karne se bhagne wala", accompanied by hilarious throwback pictures and your favorite dosti song.',
      },
      {
        type: 'cta',
        title: 'Create a Bestie Birthday Card',
        content: 'Mix funny memories, inside jokes, and heartfelt friendship wishes in a digital card.',
        link: '/templates/birthday',
        buttonText: 'Craft Bestie Birthday Surprise →',
      },
    ],
  },
  'digital-greeting-card-trends-whatsapp-wishes': {
    id: 'seed-8',
    slug: 'digital-greeting-card-trends-whatsapp-wishes',
    title: 'Paper Cards vs Digital Surprises: WhatsApp Par Shubhkaamnaye Bhejne Ka Naya Trend',
    excerpt: 'Simple forwarded message bhejna ab boring ho gaya hai. Interactive digital greeting cards with custom music, hidden reveals aur photo puzzles banate hain har occasion ko yaadgaar.',
    coverImage: 'https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?auto=format&fit=crop&w=1200&q=80',
    tags: ['whatsapp wishes', 'digital cards', 'shubhkaamnaye', 'gifting trends', 'tech'],
    author: 'LovelyCrafts Editorial',
    publishedAt: '2026-08-01T00:00:00.000Z',
    blocks: [
      {
        type: 'paragraph',
        content: 'Pehle zamane me log postal letters aur paper greeting cards bhejte the. Fir WhatsApp text forwards ka daur aaya. Lekin aaj Gen-Z aur modern couples personalized interactive digital links pasand kar rahe hain jo eco-friendly hain, instant deliver hote hain aur hamesha ke liye digital memory book ban jate hain.',
      },
      {
        type: 'heading',
        level: 2,
        content: 'Why Interactive Greeting Cards are Going Viral',
      },
      {
        type: 'list',
        ordered: false,
        items: [
          'No shipping delays: Instant delivery on WhatsApp with a private password if desired.',
          'Multi-sensory experience: Visual animations, audio music, photo galleries, and games.',
          'Zero paper waste: 100% eco-friendly and easily accessible on any smartphone browser.',
          'Fully personalized: Har word, image aur gaana aapki pasand ka.',
        ],
      },
      {
        type: 'cta',
        title: 'Send a Modern Digital Wish Today',
        content: 'Surprise your loved ones on birthdays, anniversaries, or festivals with a LovelyCrafts card.',
        link: '/templates',
        buttonText: 'Explore All Digital Templates →',
      },
    ],
  },
};

async function getPostBySlug(slug) {
  try {
    const db = getAdminDb();
    const snap = await db.collection('blogs').where('slug', '==', slug).limit(1).get();

    if (!snap.empty) {
      const doc = snap.docs[0];
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        publishedAt: data.publishedAt?.toDate?.()?.toISOString() || data.publishedAt || data.createdAt?.toDate?.()?.toISOString() || null,
      };
    }
  } catch (err) {
    console.error('Error fetching blog post by slug:', err);
  }

  // Check fallback seed posts
  if (SEED_POSTS[slug]) {
    return SEED_POSTS[slug];
  }

  return null;
}

async function getRelatedPosts(currentSlug, tags = []) {
  try {
    const db = getAdminDb();
    const snap = await db.collection('blogs').where('status', '==', 'published').limit(6).get();
    if (!snap.empty) {
      return snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .filter((p) => p.slug !== currentSlug)
        .slice(0, 3);
    }
  } catch (err) {
    // fallback
  }

  return Object.values(SEED_POSTS)
    .filter((p) => p.slug !== currentSlug)
    .slice(0, 3);
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    return {
      title: 'Post Not Found — LovelyCrafts',
    };
  }

  const title = `${post.title} — LovelyCrafts`;
  const description = post.excerpt || 'Read this inspiring article on digital surprises, gift ideas, and emotional connections on LovelyCrafts.';
  const cover = post.coverImage || `${SITE_URL}/og-banner.jpg`;
  const postUrl = `${SITE_URL}/blog/${post.slug}`;

  return {
    title,
    description,
    alternates: {
      canonical: postUrl,
    },
    openGraph: {
      title: post.title,
      description,
      url: postUrl,
      siteName: SITE_NAME,
      type: 'article',
      publishedTime: post.publishedAt,
      authors: [post.author || 'LovelyCrafts Editorial'],
      images: [
        {
          url: cover,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description,
      images: [cover],
    },
  };
}

export default async function BlogPostPage({ params }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const relatedPosts = await getRelatedPosts(slug, post.tags || []);
  const postUrl = `${SITE_URL}/blog/${post.slug}`;

  // JSON-LD Structured Data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    image: post.coverImage || `${SITE_URL}/og-banner.jpg`,
    author: {
      '@type': 'Organization',
      name: post.author || 'LovelyCrafts Editorial',
      url: SITE_URL,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/icon.png`,
      },
    },
    datePublished: post.publishedAt || new Date().toISOString(),
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': postUrl,
    },
  };

  return (
    <main style={{ minHeight: '100vh', background: '#ffffff', color: '#0f172a', paddingBottom: '100px' }}>
      
      {/* JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* BREADCRUMB & ARTICLE HEADER */}
      <article style={{ maxWidth: '840px', margin: '0 auto', padding: '40px 24px 0' }}>
        
        {/* BREADCRUMB */}
        <nav aria-label="Breadcrumb" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#64748b', marginBottom: '24px' }}>
          <Link href="/" style={{ color: '#64748b', textDecoration: 'none' }}>Home</Link>
          <span>/</span>
          <Link href="/blog" style={{ color: '#64748b', textDecoration: 'none' }}>Blog</Link>
          <span>/</span>
          <span style={{ color: '#0f172a', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '300px' }}>
            {post.title}
          </span>
        </nav>

        {/* TAGS */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
          {(post.tags || []).map((tag) => (
            <span
              key={tag}
              style={{
                background: '#ffe4e6',
                color: '#e11d48',
                padding: '4px 12px',
                borderRadius: '999px',
                fontSize: '0.78rem',
                fontWeight: 700,
                textTransform: 'uppercase',
              }}
            >
              #{tag}
            </span>
          ))}
        </div>

        {/* TITLE */}
        <h1 style={{ fontSize: 'clamp(2rem, 4.5vw, 3.2rem)', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.025em', lineHeight: 1.18, margin: '0 0 20px' }}>
          {post.title}
        </h1>

        {/* EXCERPT SUBTITLE */}
        {post.excerpt && (
          <p style={{ fontSize: '1.25rem', color: '#475569', lineHeight: 1.6, margin: '0 0 28px' }}>
            {post.excerpt}
          </p>
        )}

        {/* AUTHOR & SHARE BAR */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', padding: '18px 0', borderTop: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9', marginBottom: '36px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'linear-gradient(135deg, #f43f5e, #fb7185)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.1rem' }}>
              ❤️
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0f172a' }}>
                {post.author || 'LovelyCrafts Editorial'}
              </div>
              <div style={{ fontSize: '0.82rem', color: '#64748b' }}>
                {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Recently'} • 4 min read
              </div>
            </div>
          </div>

          <BlogShareButtons title={post.title} url={postUrl} />
        </div>

        {/* FEATURED COVER IMAGE */}
        {post.coverImage && (
          <div style={{ borderRadius: '20px', overflow: 'hidden', marginBottom: '40px', boxShadow: '0 12px 35px rgba(0,0,0,0.08)', background: '#f8fafc' }}>
            <img
              src={post.coverImage}
              alt={post.title}
              style={{ width: '100%', maxHeight: '520px', objectFit: 'cover', display: 'block' }}
            />
          </div>
        )}

        {/* ARTICLE BLOCKS */}
        <div style={{ margin: '0 0 56px' }}>
          <BlogBlocks blocks={post.blocks} />
        </div>

        {/* FOOTER SHARE & AUTHOR BOX */}
        <div style={{ background: '#f8fafc', padding: '32px', borderRadius: '20px', border: '1px solid #e2e8f0', marginBottom: '60px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '24px', borderBottom: '1px solid #e2e8f0', paddingBottom: '20px' }}>
            <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#0f172a' }}>
              Enjoyed this guide? Share it with someone special:
            </div>
            <BlogShareButtons title={post.title} url={postUrl} />
          </div>

          <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
            <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'linear-gradient(135deg, #e11d48, #f43f5e)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.4rem', flexShrink: 0 }}>
              ✨
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1rem', color: '#0f172a', marginBottom: '4px' }}>
                About LovelyCrafts
              </div>
              <p style={{ margin: 0, fontSize: '0.9rem', color: '#64748b', lineHeight: 1.6 }}>
                LovelyCrafts is India’s favorite platform for crafting heartfelt, private digital surprises. From midnight birthday count-downs and romantic proposals to apology letters and long-distance gifts, we make your emotions unforgettable.
              </p>
            </div>
          </div>
        </div>

      </article>

      {/* RELATED ARTICLES CAROUSEL / GRID */}
      {relatedPosts.length > 0 && (
        <section style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 24px' }}>
          <h3 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', marginBottom: '24px', textAlign: 'center' }}>
            More Guides &amp; Inspiration
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
            {relatedPosts.map((rPost) => (
              <Link
                key={rPost.id || rPost.slug}
                href={`/blog/${rPost.slug}`}
                style={{
                  textDecoration: 'none',
                  color: 'inherit',
                  background: '#fff',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  border: '1px solid #f1f5f9',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.04)',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                {rPost.coverImage && (
                  <div style={{ height: '160px', overflow: 'hidden' }}>
                    <img
                      src={rPost.coverImage}
                      alt={rPost.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      loading="lazy"
                    />
                  </div>
                )}
                <div style={{ padding: '18px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: '0 0 8px', lineHeight: 1.3 }}>
                    {rPost.title}
                  </h4>
                  <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: 1.5, margin: '0 0 12px', flex: 1 }}>
                    {rPost.excerpt}
                  </p>
                  <span style={{ color: '#e11d48', fontWeight: 700, fontSize: '0.82rem', marginTop: 'auto' }}>
                    Read Guide →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

    </main>
  );
}
