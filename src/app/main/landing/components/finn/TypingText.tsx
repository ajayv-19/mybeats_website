import React, { useState, useEffect, useRef } from "react";
import { motion, useAnimation, useInView } from "framer-motion";

const TypingText = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  const message = "Hey Finn, give me health trends!";
  const [isTypingDone, setIsTypingDone] = useState(false);

  const buttonControls = useAnimation(); // Controls for button animation

  // Framer Motion Variants for animation
  const container = {
    hidden: { opacity: 1 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08, // Delay between each letter
      },
    },
  };

  const child = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  const buttonVariants = {
    rest: { scale: 1 },
    bounce: {
      scale: [1, 1.2, 1],
      transition: {
        duration: 0.4,
        delay: 0.2, // Delay for button bounce
        ease: "easeInOut",
      },
    },
  };

  // Trigger the bounce animation automatically with a delay
  useEffect(() => {
    if (isTypingDone) {
      buttonControls.start("bounce"); // Start bounce animation after typing
    }
  }, [isTypingDone, buttonControls]);

  return (
    <motion.div
      ref={ref}
      variants={container}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      className="bg-gray-100 rounded-32 p-10 flex flex-row justify-between items-center"
      onAnimationComplete={() => setIsTypingDone(true)} // Trigger after typing animation completes
    >
      <div>
        {message.split("").map((char, index) => (
          <motion.span key={index} variants={child}>
            {char}
          </motion.span>
        ))}
      </div>
      <motion.div
        className="bg-orange-400 shadow-xl rounded-32 p-5 px-20"
        variants={buttonVariants}
        initial="rest"
        animate={isInView ? buttonControls : {}} // Controls for triggering bounce animation
      >
        <span className="text-white">Ask</span>
      </motion.div>
    </motion.div>
  );
};

export default TypingText;
