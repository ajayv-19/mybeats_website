import Button from "app/shared-components/buttons/Button";
import TextArea from "app/shared-components/inputs/TextArea";
import TextInput from "app/shared-components/inputs/TextInput";
import React from "react";

function ContactForm() {
  return (
    <div className="flex flex-col p-20 bg-white shadow-xl rounded-32 space-y-20">
      <div className="flex flex-row space-x-20">
        <TextInput label="First name" />
        <TextInput label="Last name" />
      </div>
      <TextInput label="Email" />
      <TextArea />
      <div className="flex flex-col items-center justify-center">
        <Button variant="contained" onClick={() => {}}>
          <span className="text-white">Submit</span>
        </Button>
      </div>
    </div>
  );
};

export default ContactForm;
