import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import BrowserApp from "@/components/landing/BrowserApp";
import Features from "@/components/landing/Features";
import WhyGhostel from "@/components/landing/WhyGhostel";
import Comparison from "@/components/landing/Comparison";
import HowItWorks from "@/components/landing/HowItWorks";
import Pricing from "@/components/landing/Pricing";
import Faq from "@/components/landing/Faq";
import Footer from "@/components/landing/Footer";

export default function Landing() {
  return (
    <div data-testid="landing-page" className="min-h-screen bg-zinc-950 text-white overflow-hidden">
      <Navbar />
      <main>
        <Hero />
        <BrowserApp />
        <Features />
        <WhyGhostel />
        <Comparison />
        <HowItWorks />
        <Pricing />
        <Faq />
      </main>
      <Footer />
    </div>
  );
}
