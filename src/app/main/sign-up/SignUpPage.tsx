import Typography from "@mui/material/Typography";
import { Link } from "react-router-dom";
import AvatarGroup from "@mui/material/AvatarGroup";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import { useState } from "react";
import * as React from "react";
import _ from "../../../@lodash/@lodash";
import JwtSignUpTab from "./tabs/JwSignUpTab";
import FirebaseSignUpTab from "./tabs/FirebaseSignUpTab";
import AwsSignUpTab from "./tabs/AwsSignUpTab";

const tabs = [
  {
    id: "jwt",
    title: "JWT",
    logo: "assets/images/logo/jwt.svg",
    logoClass: "h-36 p-4 bg-black rounded-lg",
  },
  {
    id: "firebase",
    title: "Firebase",
    logo: "assets/images/logo/firebase.svg",
    logoClass: "h-36",
  },
  {
    id: "aws",
    title: "AWS",
    logo: "assets/images/logo/aws-amplify.svg",
    logoClass: "h-36",
  },
];

/**
 * The sign up page.
 */
function SignUpPage() {
  const [selectedTabId, setSelectedTabId] = useState(tabs[0].id);

  function handleSelectTab(id: string) {
    setSelectedTabId(id);
  }

  return (
    <div className="flex min-w-0 flex-auto flex-col items-center sm:justify-center">
      <Paper className="min-h-full w-full rounded-0 px-16 py-32 sm:min-h-auto sm:w-auto sm:rounded-xl sm:p-48 sm:shadow">
        <div className="mx-auto w-full max-w-320 sm:mx-0 sm:w-320">
          <img className="w-48" src="assets/images/logo/logo.svg" alt="logo" />

          <Typography className="mt-32 text-4xl font-extrabold leading-tight tracking-tight">
            Sign up
          </Typography>
          <div className="mt-2 flex items-baseline font-medium">
            <Typography>Already have an account?</Typography>
            <Link className="ml-4" to="/sign-in">
              Sign in
            </Link>
          </div>

          <AwsSignUpTab />
        </div>
      </Paper>
    </div>
  );
}

export default SignUpPage;
