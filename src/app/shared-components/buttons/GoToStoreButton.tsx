import React from "react";
import appStore from "../../../assets/images/appStore.png";
import googlePlay from "../../../assets/images/googlePlay.png";

interface GoToStoreButtonProps {
  variant?: "apple" | "android";
}

const GoToStoreButton: React.FC<GoToStoreButtonProps> = ({ variant }) => {
  return (
    <button className="h-[70px] md:h-[90px]">
      <img
        src={variant === "android" ? googlePlay : appStore}
        className={`${variant === "apple" ? "h-[68%]" : "h-[100%]"} w-auto`}
      />
    </button>
  );
};

export default GoToStoreButton;
