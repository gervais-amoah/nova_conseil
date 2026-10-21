import { SERVICES, type Service } from "@/lib/constants/site";

function ServiceCard({ title, description, icon: Icon }: Service) {
  return (
    <div className="-m-4 rounded-xl p-4 transition duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-[0_12px_32px_-16px_rgba(15,31,61,0.25)]">
      <div className="flex size-12 items-center justify-center rounded-lg bg-accent text-primary transition-colors duration-300 hover:bg-primary hover:text-white">
        <Icon aria-hidden className="size-7" strokeWidth={1.5} animateOnHover />
      </div>
      <h3 className="mt-5 text-[15px] font-medium leading-snug text-foreground">
        {title}
      </h3>
      <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
        {description}
      </p>
    </div>
  );
}

export function Services() {
  return (
    <section id="services" className="scroll-mt-24 bg-card/60 py-20">
      <div className="mx-auto grid max-w-6xl gap-12 px-6 lg:grid-cols-[1fr_3fr]">
        <div>
          <h2 className="text-2xl font-medium tracking-tight text-foreground">
            Our 4 services
          </h2>
          <p className="mt-4 max-w-[16rem] text-sm leading-relaxed text-muted-foreground">
            We support your transformation through four complementary areas of
            expertise.
          </p>
        </div>
        <ul className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {SERVICES.map((service) => (
            <ServiceCard key={service.title} {...service} />
          ))}
        </ul>
      </div>
    </section>
  );
}
