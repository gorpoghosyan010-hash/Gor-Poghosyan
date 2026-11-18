// Լոգոն միշտ նույն տեսքով է, ինչ վիդեոներում՝ մուգ տառեր բաց ֆոնի վրա. մուգ էջերում այն դրվում է բաց «թիթեղի» վրա։
export default function Logo({ light = false, compact = false }: { light?: boolean; compact?: boolean }) {
  return (
    <span className={`brandLogo ${light ? 'light' : ''} ${compact ? 'compact' : ''}`} aria-label="GARON Construction">
      <img src="/brand/garon-logo-light.svg" alt="GARON Construction" width={425} height={310} />
    </span>
  );
}
