import React, { useRef, useState } from "react";
import { useNavigate } from "react-router";
import Showcase from "./components/showcase/Showcase";
import Navbar from "./components/navbar/Navbar";
import Features from "./components/features/Features";
import Detailed from "./components/detailed/Detailed";
import Pricing from "./components/pricing/Pricing";
import Faq from "./components/faq/Faq";
import Contact from "./components/contact/Contact";
import Footer from "./components/footer/Footer";
import VideoShowcase from "./components/videoShowcase/VideoShowcase";
import Finn from "./components/finn/Finn";
import Login from "./components/login/Login";


function LandingPage() {
  const showcaseRef = useRef<HTMLDivElement | null>(null);
  const featuresRef = useRef<HTMLDivElement | null>(null);
  const detailedRef = useRef<HTMLDivElement | null>(null);
  const pricingRef = useRef<HTMLDivElement | null>(null);
  const faqRef = useRef<HTMLDivElement | null>(null);
  const contactRef = useRef<HTMLDivElement | null>(null);

  const navigate = useNavigate();

  const scrollToSection = (ref: React.RefObject<HTMLDivElement>) => {
    if (ref.current) {
      ref.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const [showLogin, setShowLogin] = useState(false);

  const closeModal = () => {
    setShowLogin(false);
  };

  const openModal = () => {
    navigate("/sign-in");
  };

  return (
    <div className="relative overflow-x-hidden">
      <Navbar
        scrollToSection={scrollToSection}
        refs={{
          showcaseRef,
          featuresRef,
          detailedRef,
          pricingRef,
          faqRef,
          contactRef,
        }}
      />

      {showLogin && (
        <div className="h-[100vh] w-[100vw] z-20 absolute top-0 left-0">
          && <Login closeModal={closeModal} />
        </div>
      )}

      <div className="bg-gray-200 flex flex-col items-center">
        <div className="w-full flex flex-col space-y-80 md:w-[1050px] px-20">
          <div ref={showcaseRef}>
            <Showcase openModal={openModal} />
          </div>
          <div ref={featuresRef}>
            <Features />
          </div>
          <div ref={detailedRef}>
            <Detailed scrollToContactUs={() => scrollToSection(contactRef)} />
          </div>
          <div>
            <VideoShowcase />
          </div>
          <div>
            <Finn />
          </div>
          <div ref={pricingRef}>
            <Pricing />
          </div>
          <div ref={faqRef}>
            <Faq />
          </div>
          <div ref={contactRef}>
            <Contact />
          </div>
        </div>
      </div>
      <Footer
        scrollToSection={scrollToSection}
        refs={{
          showcaseRef,
          featuresRef,
          pricingRef,
          faqRef,
          contactRef,
          detailedRef,
        }}
      />
    </div>
  );
}

export default LandingPage;
