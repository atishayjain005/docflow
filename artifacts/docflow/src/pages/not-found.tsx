import { ArrowLeft, Compass } from 'lucide-react';
import { Link } from 'wouter';

export default function NotFound() {
  return (
    <div className="flex min-h-[100dvh] w-full items-center justify-center bg-[hsl(var(--background))] px-6">
      <div className="max-w-md text-center">
        <div className="mx-auto mb-6 grid h-16 w-16 place-items-center rounded-[22px] bg-[hsl(var(--accent)/.32)] text-[hsl(var(--foreground))]"><Compass className="h-7 w-7" /></div>
        <p className="mb-3 text-[10px] font-bold uppercase tracking-[.2em] text-[hsl(var(--primary))]">A little off course</p>
        <h1 className="text-4xl font-extrabold tracking-[-.07em]">That page isn’t here.</h1>
        <p className="mt-3 text-sm leading-relaxed text-[hsl(var(--muted-foreground))]">The link may be old, or the page is still becoming something.</p>
        <Link href="/" data-testid="link-not-found-home" className="mx-auto mt-7 flex w-fit items-center gap-2 rounded-lg bg-[hsl(var(--primary))] px-4 py-2.5 text-xs font-bold text-[hsl(var(--primary-foreground))] transition hover:brightness-105 active:scale-[0.98]"><ArrowLeft className="h-3.5 w-3.5" /> Back to workspace</Link>
      </div>
    </div>
  );
}
