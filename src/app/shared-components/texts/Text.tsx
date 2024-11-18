import React from "react";

interface TextProps {
  variant?: string;
  children: React.ReactNode;
}

const Text: React.FC<TextProps> = ({ variant, children }) => {
  const textVariants = {
    h1: "text-4xl md:text-8xl text-gray-800",
    h2: "text-2xl md:text-5xl font-bold text-gray-800",
    caption: "text font-bold text-orange-400",
    body1: "text-2xl font-bold text-gray-800",
    body2: "text-md md:text-lg text-gray-800",
    body3: "text-sm text-gray-800",
  };

  return <span className={textVariants[variant]}>{children}</span>;
};

export default Text;
