'use client';

import { usePathname } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import StickyCtaBar from '@/components/StickyCtaBar';

const immersiveFlowRoutes = ['/create', '/preview', '/checkout', '/success', '/invoice'];

export default function SiteChrome({ children }) {
  const pathname = usePathname() || '/';
  const hideSiteChrome = immersiveFlowRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );

  return (
    <>
      {!hideSiteChrome && <Header />}
      <div className={hideSiteChrome ? 'page-content immersive-flow' : 'page-content'}>{children}</div>
      {!hideSiteChrome && <Footer />}
      {!hideSiteChrome && <StickyCtaBar />}
    </>
  );
}
