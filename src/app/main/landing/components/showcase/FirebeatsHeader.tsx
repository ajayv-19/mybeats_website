import React from "react";
import { motion } from "framer-motion";
import Text from "app/shared-components/texts/Text";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import GoToStoreButton from "app/shared-components/buttons/GoToStoreButton";

const FirebeatsHeader = () => {
  return (
    <motion.div
      initial={{
        opacity: 0,
        scale: 0.8,
      }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1, ease: "easeOut" }}
      className="flex flex-col mt-60"
    >
      <Text variant="h2">
        {" "}
        AI-Based Remote Health Monitoring App for Firefighters
      </Text>
      <button className="flex flex-row">
        <span className="text-orange-400">Learn More</span>
        <ChevronRightIcon className="text-orange-400" />
      </button>

      <div className="flex flex-row justify-center md:justify-start space-x-5">
        <GoToStoreButton variant="apple" />
        <GoToStoreButton variant="android" />
      </div>
    </motion.div>
  );
};

export default FirebeatsHeader;
