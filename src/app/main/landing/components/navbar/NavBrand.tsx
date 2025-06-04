import React from "react";
import desktopLogo from "../../../../../assets/logo/logo-desktop.png";

function NavBrand() {
  return (
    <div className="text-gray-800 font-bold text-4xl">
      <div className="flex flex-row items-center">
        <a href="/" >
          <img
            src={desktopLogo}
            className="object-contain h-[70px] hidden md:block"
            alt="Icon Logo"
          />
          <img src={desktopLogo} className="object-contain h-[70px] md:hidden" />
        </a>

      </div>
    </div>
  );
}

export default NavBrand;
