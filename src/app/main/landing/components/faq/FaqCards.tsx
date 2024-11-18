import React, { useState } from "react";
import FaqCard from "./FaqCard";

const faqData = [
  {
    question: "Is the platform HIPAA compliant?",
    answer:
      "Yes, we adhere to strict HIPAA guidelines to ensure all health data is secure and confidential.",
    delay: 0,
  },
  {
    question: "How can our platform help reduce insurance claims?",
    answer:
      "Our platform uses real-time data from wearables to detect early signs of health risks enabling preventative action before serious medical conditions arise, thereby reducing high-cost claims.",
    delay: 0.2,
  },
  {
    question: "What types of health data do you collect from wearables?",
    answer:
      "We collect heart rate, sleep patterns, activity levels, and other physiological data from wearable devices. This data is processed through our AI models to assess potential health risks.",
    delay: 0.4,
  },
  {
    question:
      "Some random question that needs answering by anyone or it can be commonly?",
    answer:
      "Some random answer that was for the question which is answered by anyone or it can be commonly answered by someone possible some random words?",
    delay: 0.6,
  },

  {
    question: "How can policyholders access their own data?",
    answer:
      "Policyholders can view their personal health data and insights via the mobile app, which provides them with a user-friendly interface and access to reports.",
    delay: 0.8,
  },
  {
    question: "How frequently is data updated on the platform?",
    answer:
      "Data is updated in real-time, allowing insurers to view the most recent health metrics and risk assessments for their policyholders.",
    delay: 1,
  },
];

const FaqCards = () => {
  const [expandedCard, setExpandedCard] = useState(null);

  const expandCard = (cardIndex: number) => {
    setExpandedCard(cardIndex);
  };

  return (
    <div className="w-[100%] grid grid-cols-1 md:grid-cols-2 gap-20">
      {faqData.map((faq, index) => (
        <FaqCard
          onClick={() => expandCard(index)}
          closeExpandedView={() => setExpandedCard(null)}
          question={faq.question}
          answer={faq.answer}
          isSelected={expandedCard === index}
          delay={faq.delay}
        />
      ))}
    </div>
  );
};

export default FaqCards;
