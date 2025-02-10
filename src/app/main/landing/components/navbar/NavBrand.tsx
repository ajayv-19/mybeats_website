import React from "react";
import desktopLogo from "../../../../../assets/logo/mybeats-logo-desktop.svg";
import phoneLogo from "../../../../../assets/logo/mybeats-logo-phone.svg";

function NavBrand() {
  return (
    <div className="text-gray-800 font-bold text-4xl">
      <div className="flex flex-row items-center">
        <img
          src={desktopLogo}
          className="object-contain h-[70px] hidden md:block"
          alt="Icon Logo"
        />
        <img src={desktopLogo} className="object-contain h-[70px] md:hidden" />
      </div>
    </div>
  );
}

export default NavBrand;
