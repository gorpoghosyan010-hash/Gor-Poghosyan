// Every navigation: a bronze hairline sweeps across while a dark sheet lifts off the new page.
// Pure CSS (no JS needed), so the page is never left covered if scripts are slow to load.
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div aria-hidden className="page-sheet pointer-events-none fixed inset-0 z-[80] origin-top bg-graphite" />
      <div aria-hidden className="page-line pointer-events-none fixed inset-x-0 top-1/2 z-[81] h-px origin-left bg-bronze" />
      {children}
    </>
  );
}
