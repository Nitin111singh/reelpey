import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Marquee from "@/components/Marquee";
import CreatorStats from "@/components/CreatorStats";
import HowItWorks from "@/components/HowItWorks";
import BrandsSection from "@/components/BrandsSection";
import CampaignRequestSection from "@/components/CampaignRequestSection";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Marquee />
        <CreatorStats />
        <HowItWorks />
        <BrandsSection />
        <CampaignRequestSection />
      </main>
      <Footer />
    </>
  );
}
