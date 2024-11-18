import FadeText from "app/shared-components/animations/FadeText";
import Text from "app/shared-components/texts/Text";
import React from "react";

const PricingHeader = () => {
  return (
    <div className="md:w-[60%]">
      <FadeText>
        <div className="flex flex-col justify-center items-center text-center space-y-20">
          <Text variant="caption">PRICING</Text>
          <Text variant="h2">Choose Your Plan</Text>
          <Text variant="body2">
            Explore flexible plans designed to protect what matters most,
            tailored specifically to meet your unique insurance needs.
          </Text>
        </div>
      </FadeText>
    </div>
  );
};

export default PricingHeader;
