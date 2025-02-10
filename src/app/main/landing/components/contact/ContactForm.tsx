import Button from "app/shared-components/buttons/Button";
import TextArea from "app/shared-components/inputs/TextArea";
import TextInput from "app/shared-components/inputs/TextInput";
import axios from "axios";
import React, { useState } from "react";

function ContactForm() {
  const [firstName, setFirstName] = useState<string>();
  const [lastName, setLastName] = useState<string>();
  const [email, setEmail] = useState<string>();
  const [message, setMessage] = useState<string>();

  const handleSubmit = async () => {
    try {
      
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="flex flex-col p-20 bg-white shadow-xl rounded-32 space-y-20">
      <div className="flex flex-row space-x-20">
        <TextInput
          onChange={(e) => setFirstName(e.target.value)}
          value={firstName}
          label="First name"
        />
        <TextInput
          onChange={(e) => setLastName(e.target.value)}
          value={lastName}
          label="Last name"
        />
      </div>
      <TextInput
        label="Email"
        onChange={(e) => setEmail(e.target.value)}
        value={email}
      />
      <TextArea value={message} onChange={(e) => setMessage(e.target.value)} />
      <div className="flex flex-col items-center justify-center">
        <Button variant="contained" onClick={() => handleSubmit()}>
          <span className="text-white">Submit</span>
        </Button>
      </div>
    </div>
  );
}

export default ContactForm;
