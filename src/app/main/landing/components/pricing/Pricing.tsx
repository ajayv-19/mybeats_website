import React from "react";
import PricingHeader from "./PricingHeader";
import PricingCards from "./PricingCards";

const Pricing = () => {
  return (
    <div className="mt-80 w-[100%] flex flex-col space-y-20 items-center justify-center">
      <PricingHeader />
      <PricingCards />
    </div>
  );
};

export default Pricing;
