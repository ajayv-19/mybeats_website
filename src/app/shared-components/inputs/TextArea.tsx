import React from "react";
import Text from "../texts/Text";

interface TextAreaProps {
  label?: string
}

const TextArea = () => {
  return (
    <div className="w-[100%] flex flex-col space-y-5">
      <Text variant="body3">What can we help you with ?</Text>
      <textarea rows={3} className="w-[100%] bg-gray-100 rounded-32 px-20 py-10 resize-none" />
    </div>
  );
};

export default TextArea;
