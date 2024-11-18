import FadeText from "app/shared-components/animations/FadeText";
import GoToStoreButton from "app/shared-components/buttons/GoToStoreButton";
import Text from "app/shared-components/texts/Text";
import { useInView, motion } from "framer-motion";
import React, { useRef } from "react";

const VideoShowcaseHeader = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.7 });

  return (
    <div className="md:w-[80%] flex flex-col justify-center items-center">
      <FadeText>
        <div className="flex flex-col space-y-20 items-center justify-center text-center">
          <Text variant="caption">Mobile App for Policyholders</Text>
          <Text variant="h2">
            AI-enabled Health Monitoring of Firefighters
          </Text>
          <Text variant="body2">
            Our mobile app for firefighters continuously collects and monitors
            the physiological data recorded by the various health trackers,
            sends it to the AI models for identifying health risks, and alerts
            the users instantly if health conditions are detected. It enables
            the firefighters to proactively address the health risk in
            consultation with their physician and mitigate the possibility of
            sudden cardiac events.
          </Text>

          <div className="flex flex-row space-x-20">
            <GoToStoreButton variant="apple" />
            <GoToStoreButton variant="android" />
          </div>
        </div>
      </FadeText>
    </div>
  );
};

export default VideoShowcaseHeader;
