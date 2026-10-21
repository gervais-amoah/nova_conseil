import { RequestForm } from "@/components/request-form";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Reveal } from "@/components/ui/reveal";

export function RequestSection() {
  return (
    <section id="request" className="mx-auto max-w-6xl scroll-mt-24 px-6 pb-20">
      {/* <Reveal> */}
      <div className="grid gap-10 rounded-2xl bg-card p-8 sm:p-12 lg:grid-cols-[2fr_3fr]">
        <div>
          <Eyebrow>Submit a request</Eyebrow>
          <h2 className="mt-4 text-3xl font-medium tracking-tight text-foreground">
            Tell us about your needs
          </h2>
          <p className="mt-5 max-w-xs text-sm leading-relaxed text-muted-foreground">
            Share a few details about your project or challenge. We&apos;ll get
            back to you as soon as possible.
          </p>
        </div>
        <RequestForm />
      </div>
      {/* </Reveal> */}
    </section>
  );
}
