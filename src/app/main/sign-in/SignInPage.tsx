import Typography from "@mui/material/Typography";
import { Link } from "react-router-dom";
import AvatarGroup from "@mui/material/AvatarGroup";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import { useState } from "react";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import CardContent from "@mui/material/CardContent";
import _ from "@lodash";
import * as React from "react";
import { alpha } from "@mui/material/styles";
import JwtLoginTab from "./tabs/JwtSignInTab";
import FirebaseSignInTab from "./tabs/FirebaseSignInTab";
import AwsSignInTab from "./tabs/AwsSignInTab";

const tabs = [
  // {
  //   id: "jwt",
  //   title: "JWT",
  //   logo: "assets/images/logo/jwt.svg",
  //   logoClass: "h-36 p-4 bg-black rounded-lg",
  // },
  // {
  //   id: "firebase",
  //   title: "Firebase",
  //   logo: "assets/images/logo/firebase.svg",
  //   logoClass: "h-36",
  // },
  {
    id: "aws",
    title: "AWS",
    logo: "assets/images/logo/aws-amplify.svg",
    logoClass: "h-36",
  },
];

/**
 * The sign in page.
 */
function SignInPage() {
  const [selectedTabId, setSelectedTabId] = useState(tabs[0].id);

  function handleSelectTab(id: string) {
    setSelectedTabId(id);
  }
  const isDemo = window.location.search.includes("demo=true");

  return (
    <div className="flex min-w-0 flex-auto flex-col items-center sm:justify-center">
      <Paper className="min-h-full w-full rounded-0 px-16 py-32 sm:min-h-auto sm:w-auto sm:rounded-xl sm:p-48 sm:shadow">
        <CardContent className="mx-auto w-full max-w-320 sm:mx-0 sm:w-320">
          <img className="w-48" src="assets/images/logo/logo.svg" alt="logo" />
          {isDemo && (
            <Box
              className="mt-16 text-md rounded-lg p-12"
              sx={{
                backgroundColor: (theme) =>
                  theme.palette.mode === "light" ? "#e3f2fd" : "#1e3a5f",
                color: (theme) =>
                  theme.palette.mode === "light" ? "#0d47a1" : "#66b2ff",
              }}
            >
              <Typography>Demo Account</Typography>
            </Box>
          )}

          <Typography className="mt-32 text-4xl font-extrabold leading-tight tracking-tight">
            Sign in
          </Typography>
          <div className="mt-2 flex items-baseline font-medium">
            <Typography>Don't have an account?</Typography>
            <Link className="ml-4" to="/sign-up">
              Sign up
            </Link>
          </div>

          {/* <Box
            className="mt-24 text-md leading-relaxed rounded-lg py-8 px-16"
            sx={{
              backgroundColor: (theme) =>
                alpha(theme.palette.primary.main, 0.2),
              color: "primary.dark",
            }}
          >
            You are browsing <b>Fuse React Demo</b>. Click on the "Sign in"
            button to access the Demo and Documentation.
          </Box> */}

          {/* <Tabs
            value={_.findIndex(tabs, { id: selectedTabId })}
            variant="fullWidth"
            className="w-full mt-24 mb-32"
            classes={{
              indicator: "flex justify-center bg-transparent w-full h-full",
            }}
            TabIndicatorProps={{
              children: (
                <Box
                  sx={{ borderColor: (theme) => theme.palette.secondary.main }}
                  className="border-1 border-solid w-full h-full rounded-lg"
                />
              ),
            }}
          >
            {tabs.map((item) => (
              <Tab
                disableRipple
                onClick={() => handleSelectTab(item.id)}
                key={item.id}
                icon={
                  <img
                    className={item.logoClass}
                    src={item.logo}
                    alt={item.title}
                  />
                }
                className="min-w-0"
                label={item.title}
              />
            ))}
          </Tabs> */}

          {/* {selectedTabId === "jwt" && <JwtLoginTab />}
          {selectedTabId === "firebase" && <FirebaseSignInTab />}
          {selectedTabId === "aws" && <AwsSignInTab />} */}
          <AwsSignInTab />
        </CardContent>
      </Paper>
    </div>
  );
}

export default SignInPage;
