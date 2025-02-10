import React from "react";
import TravelExploreIcon from "@mui/icons-material/TravelExplore";
import Text from "app/shared-components/texts/Text";
import CheckIcon from "@mui/icons-material/Check";
import Check from "@mui/icons-material/Check";
import Button from "app/shared-components/buttons/Button";
import FadeAnimatedContainer from "app/shared-components/containers/FadeAnimatedContainer";
import { useNavigate } from "react-router";

interface PricingCardProps {
  title: string;
  price: string;
  description: string;
  features: Array<string>;
  delay?: number;
}

function PricingCard({
  title,
  price,
  description,
  features,
  delay,
}: PricingCardProps) {
  const navigate = useNavigate();

  return (
    <FadeAnimatedContainer delay={delay} direction="bottom">
      <div className="h-[540px] md:w-[320px] w-full bg-white shadow-xl rounded-32 p-20 flex flex-col">
        <div className="flex-1 flex flex-col justify-between">
          <div className="flex flex-col">
            <Text variant="body1">{title}</Text>
            <Text variant="body2">{description}</Text>
          </div>
          <div>
            <Text variant="h2">${price}</Text>/{" "}
            <span className="text-sm">Policyholder</span>
          </div>

          <div>
            <div className="h-[2px] w-[100%] bg-gray-200" />
          </div>
        </div>

        <div className="flex flex-col flex-1 mt-[56px]">
          {features.map((feature) => (
            <div className="flex flex-row space-x-5">
              <div className="flex-0.4">
                <Check className="text-orange-400" />
              </div>
              <div className="flex-0.6">
                <Text variant="body3">{feature}</Text>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col items-center">
          <Button variant="contained" onClick={() => navigate("/sign-in")}>
            <span className="text-white">Select</span>
          </Button>
        </div>
      </div>
    </FadeAnimatedContainer>
  );
}

export default PricingCard;
