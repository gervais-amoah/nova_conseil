import Image from "next/image";
import { CircleCheck } from "lucide-react";
import { Eyebrow } from "@/components/ui/eyebrow";
import { APPROACH_POINTS } from "@/lib/constants/site";
import { Reveal } from "@/components/ui/reveal";

export function Approach() {
  return (
    <section
      id="approach"
      className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-20 lg:grid-cols-2"
    >
      <Reveal>
        <div className="relative aspect-3/2 overflow-hidden rounded-xl">
          <Image
            src="https://images.unsplash.com/photo-1651608644982-349c215442f2"
            alt="Consultant discussing a project with two clients around a table"
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
          />
        </div>
      </Reveal>

      <div>
        <Eyebrow>Our approach</Eyebrow>
        <h2 className="mt-4 text-3xl font-medium tracking-tight text-foreground">
          Results over theory.
        </h2>
        <p className="mt-5 max-w-md leading-relaxed text-muted-foreground">
          We believe in a pragmatic approach: listen, analyze, co-create, and
          deliver. No unnecessary complexity, just concrete solutions that
          create value — and last.
        </p>
        <ul className="mt-8 space-y-4">
          {APPROACH_POINTS.map((point) => (
            <li
              key={point}
              className="flex items-center gap-3 text-sm text-foreground"
            >
              <CircleCheck
                aria-hidden
                className="size-5 shrink-0 text-primary"
                strokeWidth={1.5}
              />
              {point}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
