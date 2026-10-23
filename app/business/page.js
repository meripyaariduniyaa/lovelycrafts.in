import BusinessLandingClient from './BusinessLandingClient';
import { SITE_URL, SITE_NAME, DEFAULT_OG_IMAGE } from '@/lib/seo';

export const metadata = {
  title: 'Employee Birthday & Work Anniversary Gifts for Teams | LovelyCrafts',
  description:
    'Celebrate employee birthdays, work anniversaries, onboarding, farewells, and team wins with personalized digital gifts managed from one workspace.',
  alternates: { canonical: `${SITE_URL}/business` },
  openGraph: {
    title: 'Personalized Employee Milestone Gifts for Teams | LovelyCrafts',
    description:
      'Effortlessly celebrate employee birthdays, work milestones, and achievements with magical interactive digital experiences.',
    url: `${SITE_URL}/business`,
    siteName: SITE_NAME,
    locale: 'en_IN',
    images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630, alt: 'LovelyCrafts for Business' }],
    type: 'website',
  },
};

export default function BusinessPage() {
  return <BusinessLandingClient />;
}
