import React from "react";

interface ButtonProps {
  children: React.ReactNode;
  variant: "contained" | "outlined";
  fullwidth?: boolean;
  onClick: () => void;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant,
  fullwidth,
  onClick,
}) => {
  return (
    <button
      onClick={onClick}
      className={`${variant == "contained" && "bg-orange-400"} ${variant == "outlined" && "border border-orange-400"} rounded-full shadow-lg p-10 hover:opacity-75 transition-all duration-200 w-[150px] md:w-[200px] ${fullwidth && "w-full"}`}
    >
      {children}
    </button>
  );
};

export default Button;
