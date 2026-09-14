export default function Logo({ light = false, compact = false }: { light?: boolean; compact?: boolean }) {
  return (
    <span className={`brandLogo ${light ? 'light' : ''} ${compact ? 'compact' : ''}`} aria-label="GARON Construction">
      <img src={light ? '/brand/garon-logo-dark.png' : '/brand/garon-logo-light.png'} alt="GARON Construction" />
    </span>
  );
}
