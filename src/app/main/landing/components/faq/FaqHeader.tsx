import FadeText from "app/shared-components/animations/FadeText";
import Text from "app/shared-components/texts/Text";
import React from "react";

const FaqHeader = () => {
  return (
    <div className="w-[60%]">
      <FadeText>
        <div className="flex flex-col justify-center items-center text-center space-y-20">
          <Text variant="caption">QUESTIONS & ANSWERS</Text>
          <Text variant="h2">Frequently Asked Questions</Text>
        </div>
      </FadeText>
    </div>
  );
};

export default FaqHeader;
