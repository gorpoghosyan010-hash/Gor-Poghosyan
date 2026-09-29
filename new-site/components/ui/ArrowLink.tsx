import Link from 'next/link';

/** Text link with a hairline underline and an arrow that slides on hover. */
export default function ArrowLink({
  href,
  children,
  className = '',
  external = false
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
  external?: boolean;
}) {
  const inner = (
    <>
      <span className="link-line pb-1">{children}</span>
      <span aria-hidden className="relative inline-flex h-4 w-5 overflow-hidden">
        <span className="absolute inset-0 transition-transform duration-500 ease-(--ease-expo) group-hover:translate-x-full">→</span>
        <span className="absolute inset-0 -translate-x-full text-bronze transition-transform duration-500 ease-(--ease-expo) group-hover:translate-x-0">→</span>
      </span>
    </>
  );
  const cls = `group inline-flex items-center gap-3 text-sm tracking-[0.02em] ${className}`;
  return external ? (
    <a href={href} className={cls} target="_blank" rel="noopener noreferrer">
      {inner}
    </a>
  ) : (
    <Link href={href} className={cls}>
      {inner}
    </Link>
  );
}
