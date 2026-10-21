import Link from "next/link";
import { FOOTER_LINKS, SITE } from "@/lib/constants/site";
import { Logo } from "./logo";

export function SiteFooter() {
  return (
    <footer className="mx-auto max-w-6xl px-6 pb-10">
      <div className="flex flex-col items-start justify-between gap-4 border-t border-border pt-8 sm:flex-row sm:items-center">
        <div className="flex items-center gap-8">
          <Logo />
          <p className="text-xs text-muted-foreground">{SITE.tagline}</p>
        </div>
        <ul className="flex items-center gap-8">
          {FOOTER_LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}
