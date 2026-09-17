import Link from "next/link";
import { Logo } from "@/components/ui/Logo";

export function Nav() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-ink-950/80 backdrop-blur-md">
      <div className="container-page flex h-16 items-center justify-between">
        <Logo dark />
        <nav className="hidden items-center gap-8 text-sm font-medium text-ink-300 md:flex">
          <a href="#how-it-works" className="transition-colors hover:text-white">
            How it works
          </a>
          <a href="#features" className="transition-colors hover:text-white">
            Features
          </a>
          <a href="#pricing" className="transition-colors hover:text-white">
            Pricing
          </a>
        </nav>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm font-semibold text-ink-200 hover:text-white">
            Log in
          </Link>
          <Link href="/signup" className="btn-accent !px-4 !py-2 text-sm">
            Start free
          </Link>
        </div>
      </div>
    </header>
  );
}
