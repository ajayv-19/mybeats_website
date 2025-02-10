import React from "react";
import FooterSocial from "./FooterSocial";
import FooterLinks from "./FooterLinks";

interface FooterProps {
  scrollToSection?: (ref: React.RefObject<HTMLDivElement>) => void;
  refs?: {
    showcaseRef: React.RefObject<HTMLDivElement>;
    featuresRef: React.RefObject<HTMLDivElement>;
    detailedRef: React.RefObject<HTMLDivElement>;
    pricingRef: React.RefObject<HTMLDivElement>;
    faqRef: React.RefObject<HTMLDivElement>;
    contactRef: React.RefObject<HTMLDivElement>;
  };
}

const Footer: React.FC<FooterProps> = ({ scrollToSection, refs }) => {
  return (
    <div className="h-[20vh] p-20 flex flex-col items-center bg-gray-800">
      <div className="w-[1050px] h-[100%] flex flex-col items-center justify-center space-y-20">
        <FooterSocial />
        <FooterLinks scrollToSection={scrollToSection} refs={refs} />
        <div>
          <span className="text-white text-xs">
            &copy; 2025 MyBeats
          </span>
        </div>
      </div>
    </div>
  );
};

export default Footer;
