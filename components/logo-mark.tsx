import { COARSE_STRIPES, FINE_STRIPES, stripePath } from "@/lib/logo.mjs";

function Stripes({ count, clipId, className }: { count: number; clipId: string; className: string }) {
  const { d, width } = stripePath(count);
  return (
    <svg aria-hidden="true" viewBox="0 0 100 100" className={className}>
      <clipPath id={clipId}>
        <circle cx="50" cy="50" r="50" />
      </clipPath>
      <path d={d} clipPath={`url(#${clipId})`} stroke="currentColor" strokeWidth={width} fill="none" />
    </svg>
  );
}

// At header size, the full mark's stripes blur together on lower-density
// screens, so those screens get the coarser version.
export function LogoMark({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-block shrink-0 ${className}`}>
      <Stripes count={FINE_STRIPES} clipId="logo-clip-fine" className="hidden size-full hidpi:block" />
      <Stripes count={COARSE_STRIPES} clipId="logo-clip-coarse" className="block size-full hidpi:hidden" />
    </span>
  );
}
