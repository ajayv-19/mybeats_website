import Text from "app/shared-components/texts/Text";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import React from "react";
import FadeAnimatedContainer from "app/shared-components/containers/FadeAnimatedContainer";
import { motion } from "framer-motion";

interface FaqCardProps {
  question: string;
  answer: string;
  isSelected: boolean;
  delay: number;
  onClick: () => void;
  closeExpandedView: () => void;
}

const FaqCard: React.FC<FaqCardProps> = ({
  question,
  answer,
  isSelected,
  delay,
  onClick,
  closeExpandedView,
}) => {
  return (
    <div className="min-h-[100px]">
      <FadeAnimatedContainer direction="bottom" delay={delay}>
        <button
          className="p-20 h-[100%] shadow-xl rounded-32 bg-white flex-1 flex flex-col justify-center cursor-pointer text-left"
          onClick={isSelected ? closeExpandedView : onClick} // Click handler to toggle expansion
        >
          <div className="flex flex-row items-start justify-between w-full">
            <div className="flex-0.8">
              <Text variant="body2">{question}</Text>
            </div>
            <motion.div
              animate={{ rotate: isSelected ? 180 : 0 }} // Rotate icon when expanded
              transition={{ duration: 0.3 }}
              className="flex-0.2"
            >
              <ExpandMoreIcon className="text-orange-400" />
            </motion.div>
          </div>

          {/* Animated answer container */}
          <motion.div
            initial={{ height: 0, opacity: 0 }} // Initial state
            animate={{
              height: isSelected ? "auto" : 0,
              opacity: isSelected ? 1 : 0,
            }} // Animate height and opacity
            transition={{ duration: 0.3, ease: "easeInOut" }} // Smooth transition
            className="overflow-hidden" // Prevent content overflow
          >
            <Text variant="body3">{answer}</Text>
          </motion.div>
        </button>
      </FadeAnimatedContainer>
    </div>
  );
};

export default FaqCard;
