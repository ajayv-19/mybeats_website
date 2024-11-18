import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import FadeAnimatedContainer from "app/shared-components/containers/FadeAnimatedContainer";
import ShowcaseCard from "./ShowcaseCard";
import ShowcaseHeader from "./ShowcaseHeader";
import FirebeatsHeader from "./FirebeatsHeader";
import ShowcasePhone from "./ShowcasePhone";
import ArrowRightAltIcon from "@mui/icons-material/ArrowRightAlt";

interface ShowcaseScreenOneProps {
  openModal: () => void;
}

const ShowcaseScreenOne: React.FC<ShowcaseScreenOneProps> = ({ openModal }) => (
  <div className="h-[100%] md:h-[100vh]  w-[100%] flex flex-col items-center justify-center space-y-20">
    <ShowcaseHeader openModal={openModal} />

    <div className="items-center md:space-x-20 justify-center flex flex-row">
      {/* <FadeAnimatedContainer delay={1} direction="leftBottom">
        <ShowcaseCard tiltDirection="right" />
      </FadeAnimatedContainer> */}
      <FadeAnimatedContainer delay={1} direction="bottom">
        <ShowcaseCard scale="large" tiltDirection="center" />
      </FadeAnimatedContainer>
      {/* <FadeAnimatedContainer delay={2} direction="rightBottom">
        <ShowcaseCard tiltDirection="left" />
      </FadeAnimatedContainer> */}
    </div>
  </div>
);

const ShowcaseScreenTwo = () => (
  <div className="md:h-[100vh] w-[100%] overflow-x-hidden overflow-y-hidden flex flex-col justify-center md:flex-row items-center space-y-20">
    {/* Example second screen content */}
    <div className="md:flex-1">
      <FirebeatsHeader />
    </div>
    <div className="md:flex-[1.5]">
      <FadeAnimatedContainer delay={1} direction="rightBottom">
        <div className="hidden md:flex">
          <ShowcasePhone />
        </div>
        <div className="md:hidden">
          {/* <ShowcaseCard scale="large"> */}
          <ShowcasePhone />
          {/* </ShowcaseCard> */}
        </div>
      </FadeAnimatedContainer>
    </div>
  </div>
);

interface ShowcaseProps {
  openModal: () => void;
}

const Showcase: React.FC<ShowcaseProps> = ({ openModal }) => {
  const [currentScreen, setCurrentScreen] = useState(0); // State to manage the current screen

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentScreen((prevScreen) => (prevScreen + 1) % 2); // Toggle between two screens
    }, 5000); // Change screen every 5 seconds

    return () => clearInterval(timer); // Cleanup on unmount
  }, []);

  const toggleCurrentScreen = () => {
    if (currentScreen === 0) setCurrentScreen(1);
    else setCurrentScreen(0);
  };

  return (
    <div className="relative w-[100%] h-[70vh] md:h-[100vh]">
      <AnimatePresence>
        {currentScreen === 0 && (
          <motion.div
            key="screen1"
            initial={{ opacity: 0, x: 100 }} // Start off-screen
            animate={{ opacity: 1, x: 0 }} // Animate to center
            exit={{ opacity: 0, x: -100 }} // Exit to left
            transition={{ duration: 1 }} // Smooth transition
            className="absolute inset-0"
          >
            <ShowcaseScreenOne openModal={openModal} />
          </motion.div>
        )}
        {currentScreen === 1 && (
          <motion.div
            key="screen2"
            initial={{ opacity: 0, x: 100 }} // Start off-screen
            animate={{ opacity: 1, x: 0 }} // Animate to center
            exit={{ opacity: 0, x: -100 }} // Exit to left
            transition={{ duration: 1 }} // Smooth transition
            className="absolute inset-0"
          >
            <ShowcaseScreenTwo />
          </motion.div>
        )}
      </AnimatePresence>
      {/* <button
        onClick={toggleCurrentScreen}
        className="absolute top-[90%] right-[10%] md:right-[-5%] bg-orange-400 shadow-xl p-10 rounded-full"
      >
        <ArrowRightAltIcon className="text-white" />
      </button> */}
    </div>
  );
};

export default Showcase;
