import React, { ReactNode } from "react";

interface ContainerProps {
  children: ReactNode;
}

const Container: React.FC<ContainerProps> = ({ children }) => {
  return (
    <div className="w-full md:w-[1100px] overflow-y-auto">
      {children}
    </div>
  );
};

export default Container;
