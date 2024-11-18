import React from "react";
import hand from "../../../../../assets/images/Hand.png";

const ShowcasePhone = () => {
  return (
    <div className="p-20 h-[350px] w-[300px] md:h-[auto] md:w-[100%]">
      <img
        src={hand}
        alt="hand-img-on-phone"
        className="h-[100%] w-auto object-fit"
      />
    </div>
  );
};

export default ShowcasePhone;
