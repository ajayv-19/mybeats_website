import React from "react";
import { useNavigate, useLocation } from "react-router";

interface FooterLinksProps {
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

const FooterLinks = ({ scrollToSection, refs }: FooterLinksProps) => {
  const navigate = useNavigate();
  const location = useLocation(); // Get the current path

  const links = [
    {
      name: "Home",
      ref: refs?.showcaseRef,
      pathname: "/",
    },
    {
      name: "Services",
      ref: refs?.featuresRef,
      pathname: "/",
    },
    {
      name: "Pricing",
      ref: refs?.pricingRef,
      pathname: "/",
    },
    {
      name: "FAQ",
      ref: refs?.faqRef,
      pathname: "/",
    },
    {
      name: "Pilot",
      ref: null,
      linkTo: "/pilot",
      pathname: "/pilot",
    },
    {
      name: "Privacy Policy",
      ref: null, // No section for Privacy Policy, we'll navigate
      linkTo: "/privacy",
      pathname: "/privacy",
    },
    {
      name: "Terms and Conditions",
      ref: null, // No section for Terms of Service, we'll navigate
      linkTo: "/terms-and-conditions",
      pathname: "/terms-and-conditions",
    },
  ];

  return (
    <div className="flex flex-row space-x-20">
      {links.map((link, index) => (
        <button
          key={index}
          onClick={() => {
            if (location.pathname !== link.pathname) {
              navigate(link.pathname);
            }
            if (link.ref && scrollToSection) {
              // If the user is on a different page, navigate to home first
              if (location.pathname !== "/") {
                navigate("/", { state: { targetSection: link.ref } });
              } else {
                // If already on the homepage, scroll to the section
                scrollToSection(link.ref);
              }
            } else if (link.linkTo) {
              // Navigate to the respective static page (e.g. /privacy, /terms-of-service)
              navigate(link.linkTo);
            }
          }}
        >
          <span className="text-white text-xs">{link.name}</span>
        </button>
      ))}
    </div>
  );
};

export default FooterLinks;
