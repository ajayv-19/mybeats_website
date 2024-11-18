import Text from "app/shared-components/texts/Text";
import React from "react";
import ContactForm from "./ContactForm";
import FadeAnimatedContainer from "app/shared-components/containers/FadeAnimatedContainer";

const Contact = () => {
  return (
    <div className="flex flex-col space-y-20 md:flex-row md:space-x-20 py-40">
      <div className="flex-1">
        <FadeAnimatedContainer direction="left">
          <div className="flex flex-col space-y-20">
            <Text variant="caption">CONTACT US</Text>
            <Text variant="h2">Get in touch with us for more information</Text>
            <Text variant="body2">
              Request a demo of the dashboard and help us understand your
              requirements
            </Text>
          </div>
        </FadeAnimatedContainer>
      </div>
      <div className="flex-1">
        <FadeAnimatedContainer delay={0.4} direction="right">
          <ContactForm />
        </FadeAnimatedContainer>
      </div>
    </div>
  );
};

export default Contact;
