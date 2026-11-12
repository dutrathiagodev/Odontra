import { AnatomySection } from "@/presentation/landing/anatomy-section";
import { Expertise } from "@/presentation/landing/expertise";
import { Hero } from "@/presentation/landing/hero";
import { LandingFooter } from "@/presentation/landing/landing-footer";
import { LandingHeader } from "@/presentation/landing/landing-header";
import { Marquee } from "@/presentation/landing/marquee";
import { ProductTour } from "@/presentation/landing/product-tour";
import { QrSection } from "@/presentation/landing/qr-section";
import { Services } from "@/presentation/landing/services";
import { WhySection } from "@/presentation/landing/why-section";

export default function Home() {
  return (
    <>
      <LandingHeader />
      <main>
        <Hero />
        <Marquee />
        <ProductTour />
        <Expertise />
        <AnatomySection />
        <WhySection />
        <Services />
        <QrSection />
      </main>
      <LandingFooter />
    </>
  );
}
