import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export const springs = {
  snappy: { type: 'spring' as const, stiffness: 450, damping: 32, mass: 0.8 },
  smooth: { type: 'spring' as const, stiffness: 350, damping: 30, mass: 0.8 },
  bouncy: { type: 'spring' as const, stiffness: 400, damping: 24, mass: 0.8 },
  gliding: { type: 'spring' as const, stiffness: 400, damping: 35, mass: 0.8 },
};

export const appleEase = [0.16, 1, 0.3, 1] as const;
export const drawerEase = [0.32, 0.72, 0, 1] as const;

export const modalVariants = {
  initial: { opacity: 0, scale: 0.96, y: 14 },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 350, damping: 30, mass: 0.8 },
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    y: 10,
    transition: { duration: 0.16, ease: [0.16, 1, 0.3, 1] },
  },
};

export const backdropVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};

export const drawerVariants = {
  initial: { x: '100%' },
  animate: {
    x: 0,
    transition: { type: 'spring', stiffness: 350, damping: 30, mass: 0.8 },
  },
  exit: {
    x: '100%',
    transition: { duration: 0.25, ease: [0.32, 0.72, 0, 1] },
  },
};

let gsapRegistered = false;

export function registerGSAP(): typeof gsap {
  if (typeof window !== 'undefined' && !gsapRegistered) {
    gsap.registerPlugin(ScrollTrigger);
    gsapRegistered = true;
  }
  return gsap;
}

export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export { gsap, ScrollTrigger };
