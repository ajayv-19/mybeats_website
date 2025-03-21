import React, { createContext, useContext, useState, ReactNode } from "react";

// Define context type
interface ModalContextType {
  qaModal: boolean;
  setQaModal: React.Dispatch<React.SetStateAction<boolean>>;
}

// Create context with default value as undefined
const ModalContext = createContext<ModalContextType | undefined>(undefined);

// Context Provider
export const ModalProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [qaModal, setQaModal] = useState<boolean>(false);

  return (
    <ModalContext.Provider value={{ qaModal, setQaModal }}>
      {children}
    </ModalContext.Provider>
  );
};

// Custom hook to use modal state
export const useModal = (): ModalContextType => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("useModal must be used within a ModalProvider");
  }
  return context;
};