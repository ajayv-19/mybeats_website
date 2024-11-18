import React from "react";
import FeatureCard from "./FeatureCard";
import { delay } from "lodash";
import AutoGraphOutlinedIcon from "@mui/icons-material/AutoGraphOutlined";
import GppGoodOutlinedIcon from "@mui/icons-material/GppGoodOutlined";
import MonetizationOnOutlinedIcon from "@mui/icons-material/MonetizationOnOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";

const cardsData = [
  {
    title: "Early detection of health risks reduces unforeseen claims",
    description: "Proactive Risk Management",
    delay: 0,
    icon: <GppGoodOutlinedIcon className="text-orange-400" />,
  },
  {
    title: "Premium pricing based on real-time physiological data",
    description: "Data-driven Premiums",
    delay: 0.3,
    icon: <AutoGraphOutlinedIcon className="text-orange-400" />,
  },
  {
    title: "Early interventions help lower medical costs and claims",
    description: "Cost Reduction and More Profits",
    delay: 0.6,
    icon: <MonetizationOnOutlinedIcon className="text-orange-400" />,
  },
  {
    title: "AI-driven insights improve accuracy in risk assessment",
    description: "Improved Underwriting",
    delay: 0.9,
    icon: <ReceiptLongOutlinedIcon className="text-orange-400" />,
  },
];

const FeatureCards = () => {
  return (
    <div className="flex flex-col space-y-20 md:flex-row md:space-x-20 md:space-y-0">
      {cardsData.map((card) => (
        <FeatureCard
          delay={card.delay}
          title={card.title}
          description={card.description}
          icon={card.icon}
        />
      ))}
    </div>
  );
};

export default FeatureCards;
