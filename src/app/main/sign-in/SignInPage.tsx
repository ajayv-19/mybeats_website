import Typography from "@mui/material/Typography";
import { Link } from "react-router-dom";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import CardContent from "@mui/material/CardContent";

import AwsSignInTab from "./tabs/AwsSignInTab";

/**
 * The sign in page.
 */
function SignInPage() {
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
          <AwsSignInTab />
        </CardContent>
      </Paper>
    </div>
  );
}

export default SignInPage;
