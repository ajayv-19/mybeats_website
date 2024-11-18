import Text from "app/shared-components/texts/Text";
import React from "react";
import FeatureHeader from "./FeatureHeader";
import FeatureCards from "./FeatureCards";

const Features = () => {
  return (
    <div className="w-[100%] flex flex-col space-y-20 items-center">
      <FeatureHeader />
      <FeatureCards />
    </div>
  );
};

export default Features;
