import React from "react";
import FinnImage from "../../../../../assets/images/1.png";
import FinnChartImage1 from "../../../../../assets/images/3.png";
import FinnChartImage2 from "../../../../../assets/images/4.png";
import FinnChartImage3 from "../../../../../assets/images/2.png";
import FinnResponseAnimationCard from "./FinnResponseAnimationCard";

const FinnCard = () => {
  return (
    <div className="relative h-[100%] w-[100%]">
      <div className="absolute top-0 left-0">
        <FinnResponseAnimationCard delay={3}>
          <img src={FinnChartImage3} />
        </FinnResponseAnimationCard>
      </div>
      <div className="absolute top-0 left-0">
        <FinnResponseAnimationCard delay={4}>
          <img src={FinnChartImage1} />
        </FinnResponseAnimationCard>
      </div>
      <div className="absolute top-0 left-0">
        <FinnResponseAnimationCard delay={5}>
          <img src={FinnChartImage2} />
        </FinnResponseAnimationCard>
      </div>
      <div className="absolute top=0 left-0 z-20 h-[300px] w-100vw md:h-[300px] md:w-[100%]">
        <img src={FinnImage}/>
      </div>
    </div>
  );
};

export default FinnCard;
