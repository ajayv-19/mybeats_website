import React from "react";
import VideoShowcaseHeader from "./VideoShowcaseHeader";
import FadeAnimatedContainer from "app/shared-components/containers/FadeAnimatedContainer";
import FireBeats from "../../../../../assets/images/TB.png";

function VideoShowcase() {
  return (
    <div className="w-[100%] flex flex-col space-y-20 items-center mt-80">
      <VideoShowcaseHeader />
      <FadeAnimatedContainer direction="bottom">
        <video controls poster={FireBeats}>
          <source
            src="https://fire.engineering.nyu.edu/home/documents/MyBeats_Final.mp4"
            type="video/mp4"
          />
        </video>
      </FadeAnimatedContainer>
    </div>
  );
}

export default VideoShowcase;
