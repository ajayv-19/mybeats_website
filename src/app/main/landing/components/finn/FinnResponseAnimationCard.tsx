import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";

interface FinnResponseAnimationCardProps {
  children: React.ReactNode;
  delay: number;
}

const FinnResponseAnimationCard: React.FC<FinnResponseAnimationCardProps> = ({
  children,
  delay,
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <motion.div
      ref={ref}
      initial={{ scale: 0 }}
      animate={isInView ? { scale: 1 } : {}}
      transition={{ delay: delay, duration: 1 }}
    >
      {children}
    </motion.div>
  );
};

export default FinnResponseAnimationCard;
