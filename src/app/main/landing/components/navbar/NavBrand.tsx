import React from "react";
import desktopLogo from "../../../../../assets/MyBeats-logo.png";
import phoneLogo from "../../../../../assets/mybeats-phone-logo.png";

const NavBrand = () => {
  return (
    <div className="text-gray-800 font-bold text-4xl">
      <div className="flex flex-row items-center">
        <img
          src={desktopLogo}
          className="object-contain h-[70px] hidden md:block"
          alt="Icon Logo"
        />
        <img src={phoneLogo} className="object-contain h-[70px] md:hidden" />
      </div>
    </div>
  );
};

export default NavBrand;
