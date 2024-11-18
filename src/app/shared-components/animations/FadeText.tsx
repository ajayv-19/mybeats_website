import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";

interface FadeTextProps {
  children: React.ReactNode;
}

const FadeText: React.FC<FadeTextProps> = ({ children }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <motion.div 
      initial={{
        opacity: 0,
        scale: 0.8,
      }}
      animate={isInView ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 1, ease: "easeOut" }}
      ref={ref}
    >
      {children}
    </motion.div>
  );
};

export default FadeText;
