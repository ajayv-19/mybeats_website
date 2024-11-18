import FadeText from "app/shared-components/animations/FadeText";
import Text from "app/shared-components/texts/Text";
import { useInView, motion } from "framer-motion";
import React, { useRef } from "react";

const FeatureHeader = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.7 });

  return (
    <div className="md:w-[80%] flex flex-col justify-center items-center">
      <FadeText>
        <div className="flex flex-col space-y-20 items-center justify-center text-center">
          <Text variant="caption">WHY CHOOSE US</Text>
          <Text variant="h2">
            Monitor Data, Detect Health Risks, and Protect your policyholders
          </Text>
          <Text variant="body2">
            Despite the risks of burns/smoke inhalation and other myriad
            physical dangers inherent in firefighting, cardiovascular diseases
            are a leading cause of firefighter morbidity and on- duty deaths.
            Our AI models continuously monitor data through various health
            trackers, identifying critical health risks (e.g. arrhythmia,
            hypertension, sleep apnea, etc.), helping you safeguard the health
            of your policyholders.
          </Text>
        </div>
      </FadeText>
    </div>
  );
};

export default FeatureHeader;
