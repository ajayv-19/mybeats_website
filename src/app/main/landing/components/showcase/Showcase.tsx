import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import FadeAnimatedContainer from "app/shared-components/containers/FadeAnimatedContainer";
import ShowcaseHeader from "./ShowcaseHeader";
import MyBeats from "../../../../../assets/MyBeats.png";

interface ShowcaseScreenOneProps {
  openModal: () => void;
}

function ShowcaseScreenOne({ openModal }: ShowcaseScreenOneProps) {
  return (
    <div className="h-[100%] md:h-[100vh]  w-[100%] flex flex-col items-center justify-center space-y-20">
      <ShowcaseHeader openModal={openModal} />

      <div className="items-center md:space-x-20 justify-center flex flex-row">
        {/* <FadeAnimatedContainer delay={1} direction="leftBottom">
        <ShowcaseCard tiltDirection="right" />
      </FadeAnimatedContainer> */}
        <FadeAnimatedContainer delay={1} direction="bottom">
          {/* <ShowcaseCard scale="large" tiltDirection="center" /> */}
          <div className="relative w-[300px] h-[200px] md:w-[1000px] md:h-[600px]">
            {/* 615 ÷ 800 = 0.76875 → 76.875%; this preserves your original aspect */}
            <iframe
              width="100%"
              height="100%"
              src="https://www.youtube.com/embed/S4HS7PSCn4s?si=lCV62Re_t-PXnRfU"
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          </div>
        </FadeAnimatedContainer>
        {/* <FadeAnimatedContainer delay={2} direction="rightBottom">
        <ShowcaseCard tiltDirection="left" />
      </FadeAnimatedContainer> */}
      </div>
    </div>
  );
}

interface ShowcaseProps {
  openModal: () => void;
}

function Showcase({ openModal }: ShowcaseProps) {
  const [currentScreen] = useState(0); // State to manage the current screen

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
      </AnimatePresence>
    </div>
  );
}

export default Showcase;
