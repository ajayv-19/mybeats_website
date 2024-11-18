import React from "react";
import { motion } from "framer-motion";
import dashboard from "../../../../../assets/Dashboard.png";

interface ShowcaseCardProps {
  scale?: string;
  children?: React.ReactNode;
  tiltDirection?: "left" | "center" | "right";
}

const ShowcaseCard: React.FC<ShowcaseCardProps> = ({
  scale,
  children,
  tiltDirection,
}) => {
  const tiltVariants = {
    left: { y: 10 },
    center: { y: 5 },
    right: { y: 10 },
    initial: { y: 0 },
  };

  return (
    // <motion.div
    //   className={`bg-white rounded-32 shadow-2xl w-[100%] md:w-[300px] h-[250px] ${
    //     scale === "large" && "h-[350px] w-[300px] md:w-[100%]"
    //   }`}
    //   whileHover={
    //     tiltDirection ? tiltVariants[tiltDirection] : tiltVariants.initial
    //   }
    //   initial={tiltVariants.initial}
    //   transition={{ duration: 0.3, ease: "easeOut" }}
    // >
    //   {children}
    // </motion.div>
    <div className="shadow-xl rounded-[35px]">
      <img src={dashboard}/>
    </div>
  );
};

export default ShowcaseCard;
