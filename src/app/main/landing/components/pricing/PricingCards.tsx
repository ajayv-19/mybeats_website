import React from "react";
import PricingCard from "./PricingCard";
import { delay } from "lodash";

const pricingData = [
  {
    title: "Free Plan",
    description: "Monthly Starter Plan",
    price: "0.00",
    features: [
      "Maximum 100 policyholders",
      "Valid for three months",
      "Access to basic features",
      "Dashboard tutorials",
    ],
    delay: 0,
  },
  {
    title: "Silver Plan",
    description: "Monthly Plan for Small to Mid-sized Companies",
    price: "0.99",
    features: [
      "Access to advanced features",
      "Historical data trends",
      "Report generation",
      "Free training for dashboard",
      "Customer Support Via Email",
    ],
    delay: 0.4,
  },
  {
    title: "Gold Plan",
    description: "Monthly Plan for Large Companies",
    price: "1.99",
    features: [
      "Integration of FINN",
      "Access to advanced features",
      "Historical data trends",
      "Advanced reporting",
      "Periodic free training for dashboard",
      "Dedicated representative for support",
    ],
    delay: 0.8,
  },
];

const PricingCards = () => {
  return (
    <div className="flex flex-col items-center space-y-20 md:flex-row md:justify-between md:space-x-20 md:space-y-0 w-[100%]">
      {pricingData.map((pricing, index) => (
        <PricingCard
          key={index}
          title={pricing.title}
          description={pricing.description}
          features={pricing.features}
          price={pricing.price}
          delay={pricing.delay}
        />
      ))}
    </div>
  );
};

export default PricingCards;
