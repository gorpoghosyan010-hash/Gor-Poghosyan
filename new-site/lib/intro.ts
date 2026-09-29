/** Seconds to wait before hero entrance animations, so they start as the first-visit loader lifts. */
export const introDelay = () =>
  typeof document !== 'undefined' && document.documentElement.hasAttribute('data-seen') ? 0.1 : 2.3;
