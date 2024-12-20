import React from "react";
import { motion } from "framer-motion";
import Text from "app/shared-components/texts/Text";
import Button from "app/shared-components/buttons/Button";
import { useNavigate } from "react-router";

interface ShowcaseHeaderProps {
  openModal: () => void;
}

const ShowcaseHeader: React.FC<ShowcaseHeaderProps> = ({ openModal }) => {
  const navigate = useNavigate();
  return (
    <motion.div
      initial={{
        opacity: 0,
        scale: 0.8,
      }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1, ease: "easeOut" }}
      className="flex flex-col md:w-[800px] items-center text-center space-y-20"
    >
      <Text variant="h2">
        AI-enabled Data Driven Analytics for Insurance Companies
      </Text>

      <div className="md:w-[600px] flex flex-col">
        <div className="flex flex-row space-x-10 justify-center">
          <Button variant="contained" onClick={openModal}>
            <span className="text-white">Sign in</span>
          </Button>
          <Button
            variant="outlined"
            onClick={() => {
              navigate("/sign-in?demo=true"), window.location.reload();
            }}
          >
            <span className="text-orange-400">Try it for free</span>
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default ShowcaseHeader;
