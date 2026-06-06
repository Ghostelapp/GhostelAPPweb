import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import WhyGhostel from "@/components/landing/WhyGhostel";
import HowItWorks from "@/components/landing/HowItWorks";
import Stats from "@/components/landing/Stats";
import Pricing from "@/components/landing/Pricing";
import Faq from "@/components/landing/Faq";
import Footer from "@/components/landing/Footer";

export default function Landing() {
  return (
    <div data-testid="landing-page" className="min-h-screen bg-zinc-950 text-white overflow-hidden">
      <Navbar />
      <main>
        <Hero />
        <Features />
        <WhyGhostel />
        <HowItWorks />
        <Stats />
        <Pricing />
        <Faq />
      </main>
      <Footer />
    </div>
  );
}
