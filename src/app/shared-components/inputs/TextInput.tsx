import React from "react";
import Text from "../texts/Text";

interface TextInputProps {
  label?: string;
  value?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const TextInput: React.FC<TextInputProps> = ({ label, value, onChange }) => {
  return (
    <div className="w-[100%] flex flex-col space-y-5">
      <Text variant="body3">{label}</Text>
      <input className="w-[100%] bg-gray-100 rounded-32 px-20 py-10" onChange={onChange} value={value} />
    </div>
  );
};

export default TextInput;
