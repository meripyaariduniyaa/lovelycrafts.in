/**
 * Haptic feedback helper for mobile web
 * Safely triggers micro-vibrations on supported Android devices.
 * Gracefully no-ops on iOS Safari and desktop.
 */
export function triggerHaptic(type = 'light') {
  if (typeof window === 'undefined' || typeof navigator === 'undefined' || !navigator.vibrate) {
    return;
  }

  try {
    switch (type) {
      case 'selection':
      case 'light':
        navigator.vibrate(10);
        break;
      case 'medium':
        navigator.vibrate(20);
        break;
      case 'success':
        navigator.vibrate([12, 40, 15]);
        break;
      case 'warning':
        navigator.vibrate([25, 50, 25]);
        break;
      case 'error':
        navigator.vibrate([30, 60, 30, 60, 40]);
        break;
      default:
        navigator.vibrate(12);
        break;
    }
  } catch {
    // Non-blocking catch for restricted browser contexts
  }
}
