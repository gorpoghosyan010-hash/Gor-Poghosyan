export default function Logo({ light = false, compact = false }: { light?: boolean; compact?: boolean }) {
  return (
    <span className={`brandLogo ${light ? 'light' : ''} ${compact ? 'compact' : ''}`} aria-label="GARON Construction">
      <img src={light ? '/brand/garon-logo-dark.svg' : '/brand/garon-logo-light.svg'} alt="GARON Construction" width={425} height={310} />
    </span>
  );
}
