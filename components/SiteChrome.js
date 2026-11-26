'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import StickyCtaBar from '@/components/StickyCtaBar';
import AnyaAssistant from '@/components/AnyaAssistant';
import PetalOverlay from '@/components/PetalOverlay';
import InitialPageLoader from '@/components/InitialPageLoader';
import MobileTabBar from '@/components/MobileTabBar';
import MobileMoreSheet from '@/components/MobileMoreSheet';

const immersiveFlowRoutes = ['/create', '/preview', '/checkout', '/success', '/invoice', '/wedding-invitations/editor', '/wedding-invitations/preview', '/wedding-invitations/checkout', '/w/'];
const privateOrAccountRoutes = ['/p', '/creator', '/profile', '/business'];

/** Routes where we also hide the floating mobile tab bar */
const tabBarHiddenRoutes = [...immersiveFlowRoutes];

export default function SiteChrome({ children }) {
  const pathname = usePathname() || '/';
  const [moreSheetOpen, setMoreSheetOpen] = useState(false);

  const hideSiteChrome = immersiveFlowRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
  const hideAnya = hideSiteChrome || privateOrAccountRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
  const hideTabBar = tabBarHiddenRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );

  return (
    <>
      <InitialPageLoader />
      {!hideSiteChrome && <Header />}

      {/*
        page-content: on mobile, add bottom padding so the floating tab bar
        never obscures the last line of content.
        The tab bar is ~72px tall + 10px bottom offset + safe-area.
        We use a CSS class so it can be overridden per-page if needed.
      */}
      <div
        className={
          hideSiteChrome
            ? 'page-content immersive-flow'
            : hideTabBar
              ? 'page-content'
              : 'page-content page-content--with-tabbar'
        }
      >
        {children}
      </div>

      {!hideSiteChrome && <Footer />}
      {!hideSiteChrome && <StickyCtaBar />}

      {/* AnyaAssistant: on mobile, lifted above the floating tab bar */}
      {!hideAnya && (
        <div className="anya-wrapper--above-tabbar">
          <AnyaAssistant />
        </div>
      )}

      {!hideSiteChrome && <PetalOverlay />}

      {/* Floating mobile tab bar — hidden on desktop via CSS, on immersive/create routes, and while More sheet is open */}
      {!hideTabBar && !moreSheetOpen && (
        <MobileTabBar onMoreClick={() => setMoreSheetOpen(true)} />
      )}

      {/* More sheet (secondary routes) */}
      <MobileMoreSheet isOpen={moreSheetOpen} onClose={() => setMoreSheetOpen(false)} />
    </>
  );
}
