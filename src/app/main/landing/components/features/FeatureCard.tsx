import React from "react";
import TravelExploreIcon from "@mui/icons-material/TravelExplore";
import { theme } from "tailwind.config";
import Text from "app/shared-components/texts/Text";
import FadeAnimatedContainer from "app/shared-components/containers/FadeAnimatedContainer";

interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  delay?: number;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  title,
  description,
  delay,
  icon,
}) => {
  return (
    <FadeAnimatedContainer delay={delay} direction="bottom">
      <div className="flex flex-col justify-between shadow-xl h-[180px] md:h-[230px] w-[100%] md:w-[250px] bg-white rounded-32 p-20">
        <div className="flex flex-col space-y-10">
          {icon}
          <Text variant="body2">{title}</Text>
        </div>
        <div className="flex flex-col space-y-10">
          <Text variant="body1">{description}</Text>
        </div>
      </div>
    </FadeAnimatedContainer>
  );
};

export default FeatureCard;
