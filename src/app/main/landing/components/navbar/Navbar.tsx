import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom"; // Import the hooks
import { motion } from "framer-motion";
import Container from "app/shared-components/containers/Container";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import NavBrand from "./NavBrand";
import NavLink from "./NavLink";

const NAV_LINKS = [
  {
    linkName: "Home",
    refName: "showcaseRef",
  },
  {
    linkName: "Services",
    refName: "featuresRef",
  },
  {
    linkName: "Pricing",
    refName: "pricingRef",
  },
  {
    linkName: "FAQ",
    refName: "faqRef",
  },
  {
    linkName: "Contact Us",
    refName: "contactRef",
  },
];

interface NavbarProps {
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

function Navbar({ scrollToSection, refs }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false); // State to manage the menu open/close
  const [isSticky, setIsSticky] = useState(false); // State to track when the navbar should be sticky
  const location = useLocation(); // Get the current route
  const navigate = useNavigate(); // To navigate programmatically

  const toggleNavbar = () => {
    setIsOpen(!isOpen);
  };

  const handleNavLinkClick = (refName: string) => {
    console.log("ref name", refName);
    if (location.pathname === "/home" || location.pathname === "/") {
      // If the user is on the home dashboard, scroll to section
      scrollToSection(refs[refName]);
    } else {
      // Otherwise, navigate to the root ("/")
      navigate("/");
    }
  };

  // Function to handle scroll and toggle sticky class
  const handleScroll = () => {
    if (window.scrollY > 100) {
      setIsSticky(true);
    } else {
      setIsSticky(false);
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div
      className={`${
        isSticky ? "fixed top-0 left-0 right-0 bg-white shadow-md z-50" : ""
      } h-[100px] w-full bg-gray-200 flex justify-center items-center transition-all duration-300`}
    >
      <Container>
        <div className="relative flex flex-row items-center justify-between w-full">
          <div className="flex flex-row justify-center md:justify-between items-center md:space-x-10 w-full px-10">
            <NavBrand />
            {/* Hamburger Icon for Mobile View */}
            <button onClick={toggleNavbar} className="absolute right-20 z-20">
              <div className="md:hidden">
                {isOpen ? (
                  <CloseIcon className="text-orange-400" />
                ) : (
                  <MenuIcon className="text-orange-400" />
                )}
              </div>
            </button>

            {/* Nav Links for Desktop View */}
            <div className="hidden md:flex flex-row items-center space-x-20">
              {NAV_LINKS.map((navLink) => (
                <NavLink
                  onClick={() => handleNavLinkClick(navLink.refName)} // Use the conditional handler
                  key={navLink.linkName}
                  linkName={navLink.linkName}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <motion.div
            className="fixed top-0 bg-gray-200 h-[100vh] w-full flex flex-col p-32 md:hidden z-10"
            initial={isOpen ? { opacity: 0, y: -50 } : { opacity: 1, y: 0 }} // Initial state
            animate={isOpen ? { opacity: 1, y: 0 } : { opacity: 0, y: -50 }} // Animates up or down based on isOpen
            transition={{ duration: 0.5 }} // Duration of animation
          >
            <div className="flex flex-col space-y-20">
              {NAV_LINKS.map((navLink) => (
                <NavLink
                  onClick={() => {
                    handleNavLinkClick(navLink.refName);
                    toggleNavbar();
                  }}
                  variant="phone"
                  key={navLink.linkName}
                  linkName={navLink.linkName}
                />
              ))}
            </div>
          </motion.div>
        )}
      </Container>
    </div>
  );
}

export default Navbar;
