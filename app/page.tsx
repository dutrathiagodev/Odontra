import { AnatomySection } from "@/presentation/landing/anatomy-section";
import { FlowSection } from "@/presentation/landing/flow-section";
import { Hero } from "@/presentation/landing/hero";
import { LandingFooter } from "@/presentation/landing/landing-footer";
import { LandingHeader } from "@/presentation/landing/landing-header";
import { MobileTabBar } from "@/presentation/landing/mobile-tab-bar";
import { PainPoints } from "@/presentation/landing/pain-points";
import { ProductTour } from "@/presentation/landing/product-tour";
import { QrSection } from "@/presentation/landing/qr-section";
import { SmoothScroll } from "@/presentation/landing/smooth-scroll";

export default function Home() {
  return (
    <>
      <SmoothScroll />
      <LandingHeader />
      <main>
        <Hero />
        <PainPoints />
        <FlowSection />
        <ProductTour />
        <AnatomySection />
        <QrSection />
      </main>
      <LandingFooter />
      <MobileTabBar />
    </>
  );
}
