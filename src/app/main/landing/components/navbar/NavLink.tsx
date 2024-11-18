import Text from "app/shared-components/texts/Text";
import React from "react";

interface NavLinkProps {
  linkName: string;
  variant?: string;
  onClick: () => void;
}

const NavLink: React.FC<NavLinkProps> = ({ linkName, variant, onClick }) => {
  return (
    <button className="cursor group" onClick={onClick}>
      {variant === "phone" ? (
        <Text variant="h2">{linkName}</Text>
      ) : (
        <span className="relative text-gray-800 cursor-pointer pb-10">
          {linkName}
          <span className="absolute left-0 bottom-0 w-0 h-[2px] bg-gray-800 transition-all duration-300 ease-out transform group-hover:w-full group-hover:scale-x-100 origin-center"></span>
        </span>
      )}
    </button>
  );
};

export default NavLink;