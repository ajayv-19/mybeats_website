import Button from "app/shared-components/buttons/Button";
import TextInput from "app/shared-components/inputs/TextInput";
import Text from "app/shared-components/texts/Text";
import CloseIcon from "@mui/icons-material/Close";

import React from "react";

interface LoginProps {
  closeModal: () => void;
}

const Login: React.FC<LoginProps> = ({ closeModal }) => {
  return (
    <div className="h-[100%] w-[100%] flex flex-row items-center justify-center bg-grey-800 bg-opacity-60 fixed inset-0">
      <div className="w-[400px] bg-gray-200 rounded-32 relative z-10 shadow-xl p-20 flex flex-col space-y-20">
        <div className="text-center relative">
          <Text variant="h2">Login</Text>
          <button
            onClick={closeModal}
            className="absolute top-[16px] right-0 cursor-pointer"
          >
            <CloseIcon className="text-orange-400" />
          </button>
        </div>
        <div>
          <TextInput label="First Name" />
        </div>
        <div>
          <TextInput label="Last Name" />
        </div>
        <div>
          <TextInput label="Email" />
        </div>
        <div>
          <TextInput label="Password" />
        </div>
        <div>
          <TextInput label="Confirm Password" />
        </div>
        <div className="flex flex-col items-center">
          <Button variant="contained" onClick={() => {}}>
            <span className="text-white">Login</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Login;
