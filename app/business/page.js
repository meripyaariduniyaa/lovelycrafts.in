import BusinessLandingClient from './BusinessLandingClient';

export const metadata = {
  title: 'LovelyCrafts for Business — Make Every Important Moment at Work Feel Personal',
  description:
    'Create personalized digital experiences for employee birthdays, work anniversaries, onboarding, farewells, and team achievements — all from one automated workspace.',
  openGraph: {
    title: 'LovelyCrafts for Business — Personal Employee Moments at Scale',
    description:
      'Effortlessly celebrate employee birthdays, work milestones, and achievements with magical interactive digital experiences.',
    url: 'https://lovelycrafts.in/business',
    type: 'website',
  },
};

export default function BusinessPage() {
  return <BusinessLandingClient />;
}
