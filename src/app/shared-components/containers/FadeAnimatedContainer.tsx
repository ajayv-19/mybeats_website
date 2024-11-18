import React, { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";

interface FadeAnimatedContainerProps {
  children: React.ReactNode;
  direction?: string;
  delay?: number;
}

const FadeAnimatedContainer: React.FC<FadeAnimatedContainerProps> = ({
  children,
  direction,
  delay = 0,
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  const fadeVariants = {
    leftBottom: { opacity: 0, y: 50, x: -150 },
    left: { opacity: 0, x: -150 },
    right: { opacity: 0, x: 150 },
    bottom: { opacity: 0, y: 100, x: 0 },
    rightBottom: { opacity: 0, y: 0, x: 0, scale: 0.8 },
    animate: { opacity: 1, y: 0, x: 0, scale: 1 },
  };

  const [animationDirection, setAnimationDirection] = useState(direction);

  useEffect(() => {
    const handleResize = () => {
      if (window.matchMedia("(max-width: 768px)").matches) {
        setAnimationDirection("bottom");
      } else {
        setAnimationDirection(direction);
      }
    };

    handleResize(); // Check on initial render
    window.addEventListener("resize", handleResize); // Listen for screen size changes
    return () => window.removeEventListener("resize", handleResize); // Clean up
  }, [direction]);

  console.log("animation direction", animationDirection);

  return (
    <motion.div
      ref={ref}
      initial={fadeVariants[animationDirection]}
      animate={isInView ? fadeVariants.animate : {}}
      transition={{ duration: 0.8, ease: "easeOut", delay }}
      className="w-[100%] h-[100%]"
    >
      {children}
    </motion.div>
  );
};

export default FadeAnimatedContainer;
