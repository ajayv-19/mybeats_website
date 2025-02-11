import React from "react";
import PricingCard from "./PricingCard";

const pricingData = [
  {
    title: "Bronze Plan",
    description: "Monthly Starter Plan",
    price: "0.99",
    features: [
      "Access to basic features",
      "Dashboard tutorials",
      "One business account",
    ],
    delay: 0,
  },
  {
    title: "Silver Plan",
    description: "Monthly Plan for Small to Mid-sized Companies",
    price: "1.99",
    features: [
      "Access to advanced features",
      "Historical data trends",
      "Report generation",
      "Free training for dashboard",
      "Customer Support Via Email",
      "Five business accounts",
    ],
    delay: 0.4,
  },
  {
    title: "Gold Plan",
    description: "Monthly Plan for Large Companies",
    price: "2.99",
    features: [
      "Integration of FINN - AI Agent",
      "Access to advanced features",
      "Historical data trends",
      "Advanced reporting",
      "Periodic free training for dashboard",
      "Dedicated representative for support",
      "Ten business accounts",
    ],
    delay: 0.8,
  },
];

function PricingCards() {
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
}

export default PricingCards;
