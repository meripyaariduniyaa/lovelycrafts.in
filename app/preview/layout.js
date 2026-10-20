// Preview is a private creator dashboard — should not be indexed by search engines
export const metadata = {
  title: 'Your Gift Preview | LovelyCrafts',
  description: 'Preview your personalized digital gift before continuing to secure checkout.',
  robots: { index: false, follow: false },
};

export default function PreviewLayout({ children }) {
  return children;
}
