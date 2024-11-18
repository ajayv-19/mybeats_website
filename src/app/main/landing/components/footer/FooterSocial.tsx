import React from "react";
import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";
import XIcon from "@mui/icons-material/X";

const socials = [
  {
    icon: <FacebookIcon className="text-gray-800" />,
  },
  {
    icon: <InstagramIcon className="text-gray-800" />,
  },
  {
    icon: <XIcon className="text-gray-800" />,
  },
];

const FooterSocial = () => {
  return (
    <div className="flex flex-row space-x-10">
      {socials.map((social) => (
        <button className="rounded-full p-5 bg-white">{social.icon}</button>
      ))}
    </div>
  );
};

export default FooterSocial;
