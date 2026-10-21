import { Approach } from "@/components/sections/approach";
import { Hero } from "@/components/sections/hero";
import { RequestSection } from "@/components/sections/request-section";
import { Services } from "@/components/sections/services";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Services />
      <Approach />
      <RequestSection />
    </>
  );
}
