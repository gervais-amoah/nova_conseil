import { ButtonLink } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/eyebrow";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import { AnimatedWords } from "./animated-words";

export function Hero() {
  return (
    <section className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-16 lg:grid-cols-2 lg:py-20">
      <div className="max-w-md">
        <Eyebrow className="animate-fade-up motion-reduce:animate-none">
          Digital &amp; organizational transformation
        </Eyebrow>
        <h1 className="mt-5 text-4xl font-medium leading-[1.1] tracking-tight text-foreground sm:text-5xl">
          <AnimatedWords text="Pragmatic consulting for lasting impact." />
        </h1>
        <p
          className="mt-6 animate-fade-up leading-relaxed text-muted-foreground motion-reduce:animate-none"
          style={{ animationDelay: "500ms" }}
        >
          Novae Conseil helps SMEs and mid-sized companies turn change into
          measurable results. We combine strategic thinking with hands-on
          support to solve real business challenges.
        </p>
        <div
          className="mt-8 animate-fade-up motion-reduce:animate-none"
          style={{ animationDelay: "700ms" }}
        >
          <ButtonLink href="#request" size="lg">
            Submit a request
            <ArrowRight
              aria-hidden
              className="size-4 transition-transform group-hover:translate-x-1"
            />
          </ButtonLink>
        </div>
      </div>

      <div
        className="relative aspect-4/3 animate-fade-up overflow-hidden rounded-xl motion-reduce:animate-none"
        style={{ animationDelay: "300ms" }}
      >
        <Image
          src="https://images.unsplash.com/photo-1764588029885-d115de3bda1e"
          // src="/images/hero.jpg"
          alt="Bright meeting room with a laptop and notebook on a wooden table"
          fill
          priority
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-cover"
        />
      </div>
    </section>
  );
}
