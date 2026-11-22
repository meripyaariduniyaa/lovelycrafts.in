'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import styles from './HeartLoader.module.css';

// Continuous heart SVG path starting at bottom center tip (50, 90)
const HEART_PATH =
  'M 50 90 C 50 90, 90 60, 90 35 C 90 20, 78 10, 65 10 ' +
  'C 55 10, 50 18, 50 25 C 50 18, 45 10, 35 10 ' +
  'C 22 10, 10 20, 10 35 C 10 60, 50 90, 50 90 Z';

const DRAW_DURATION_MS = 1000; // 200ms initial dot pause + 800ms stroke draw
const PULSE_DURATION_MS = 400; // Heartbeat pulse before exit
const ANIMATION_MAX_MS = 8000; // Safety timeout — never block user indefinitely

/**
 * HeartLoader — Animated heart-drawing loading experience for LovelyCrafts.in
 *
 * @param {string}   message    - Descriptive status text below the heart
 * @param {boolean}  loading    - Loading state controller (default: true)
 * @param {function} onComplete - Callback executed once fade-out completes
 */
export default function HeartLoader({
  message = 'Made with love from the bottom of Heart',
  loading = true,
  onComplete,
}) {
  const [phase, setPhase] = useState('drawing'); // 'drawing' | 'heartbeat' | 'waiting' | 'exiting' | 'done'
  const [pathLength, setPathLength] = useState(268);
  const pathRef = useRef(null);
  const completedRef = useRef(false);

  // Measure dynamic path length on mount for precise dash offset calculations
  useEffect(() => {
    if (pathRef.current && typeof pathRef.current.getTotalLength === 'function') {
      try {
        const measured = Math.ceil(pathRef.current.getTotalLength()) + 2;
        if (measured > 0) {
          setPathLength(measured);
        }
      } catch (err) {
        setPathLength(268);
      }
    }
  }, []);

  const markDone = useCallback(() => {
    if (completedRef.current) return;
    completedRef.current = true;
    setPhase('done');
    if (typeof document !== 'undefined') {
      document.body.classList.remove(styles.bodyLocked);
    }
    onComplete?.();
  }, [onComplete]);

  // Main animation lifecycle timers:
  // Guarantees the drawing animation (1000ms) always plays on mobile & desktop
  useEffect(() => {
    // 0ms - 1000ms: drawing phase
    const drawTimer = setTimeout(() => {
      setPhase((prev) => (prev === 'drawing' ? 'heartbeat' : prev));
    }, DRAW_DURATION_MS);

    // 8000ms: maximum safety timeout to prevent stalling
    const safetyTimer = setTimeout(() => {
      setPhase((prev) => {
        if (prev !== 'done' && prev !== 'exiting') {
          return 'exiting';
        }
        return prev;
      });
    }, ANIMATION_MAX_MS);

    return () => {
      clearTimeout(drawTimer);
      clearTimeout(safetyTimer);
    };
  }, []);

  // When heart finishes drawing and enters heartbeat:
  // If loading is already false (e.g. entrance loader), allow a brief heartbeat pulse then exit
  useEffect(() => {
    if (phase === 'heartbeat' && !loading) {
      const exitTimer = setTimeout(() => {
        setPhase('exiting');
      }, PULSE_DURATION_MS);
      return () => clearTimeout(exitTimer);
    }
  }, [phase, loading]);

  // When loading state resolves AFTER the drawing phase has completed
  useEffect(() => {
    if (!loading && (phase === 'heartbeat' || phase === 'waiting')) {
      const exitTimer = setTimeout(() => {
        setPhase('exiting');
      }, 250);
      return () => clearTimeout(exitTimer);
    }
  }, [loading, phase]);

  // Fallback timeout for the 350ms exit fade-out transition
  useEffect(() => {
    if (phase === 'exiting') {
      const exitTimer = setTimeout(() => {
        markDone();
      }, 450); // 350ms transition + 100ms safety buffer
      return () => clearTimeout(exitTimer);
    }
  }, [phase, markDone]);

  // Manage body scroll locking cleanly
  useEffect(() => {
    if (typeof document === 'undefined') return;

    if (phase !== 'done') {
      document.body.classList.add(styles.bodyLocked);
    } else {
      document.body.classList.remove(styles.bodyLocked);
    }

    return () => {
      document.body.classList.remove(styles.bodyLocked);
    };
  }, [phase]);

  if (phase === 'done') return null;

  const isHeartbeat = phase === 'heartbeat' || phase === 'exiting';
  const isWaiting = phase === 'waiting';

  return (
    <div
      className={`${styles.overlay} ${phase === 'exiting' ? styles.fadeOut : ''}`}
      onTransitionEnd={(e) => {
        if (e.target === e.currentTarget && phase === 'exiting') {
          markDone();
        }
      }}
      role="status"
      aria-live="polite"
      aria-label="Loading"
    >
      <svg
        className={`${styles.heartSvg} ${isHeartbeat ? styles.heartComplete : ''
          } ${isWaiting ? styles.heartWaiting : ''}`}
        viewBox="0 0 100 100"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <circle
          cx="50"
          cy="90"
          r="1.6"
          className={styles.dot}
        />
        <path
          ref={pathRef}
          className={styles.heartPath}
          d={HEART_PATH}
          style={{ '--heart-length': pathLength }}
        />
      </svg>

      {message && <p className={styles.message}>{message}</p>}

      <span className="sr-only">Loading content, please wait.</span>
    </div>
  );
}
