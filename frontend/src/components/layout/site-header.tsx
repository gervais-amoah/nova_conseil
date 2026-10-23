import Link from "next/link";
import { ButtonLink } from "@/components/ui/button";
import { NAV_LINKS, SITE } from "@/lib/constants/site";
import { Logo } from "./logo";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-transparent bg-background/80 backdrop-blur supports-backdrop-filter:bg-background/70">
      <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-6">
        <Link
          href="/"
          aria-label={SITE.name}
          className="rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
        >
          <Logo />
        </Link>

        <nav aria-label="Main" className="flex items-center gap-8">
          <ul className="hidden items-center gap-8 md:flex">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <ButtonLink
            className="bg-white text-primary! hover:text-white! border-2 border-primary"
            href="/admin"
          >
            Admin Panel
          </ButtonLink>
        </nav>
      </div>
    </header>
  );
}
