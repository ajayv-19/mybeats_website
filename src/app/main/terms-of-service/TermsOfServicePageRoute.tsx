import { FuseRouteItemType } from "@fuse/utils/FuseUtils";
import authRoles from "../../auth/authRoles";
import TermsOfServicePage from "./TermsOfServicePage";

const SignInPageRoute: FuseRouteItemType = {
  path: "terms-of-service",
  element: <TermsOfServicePage />,
  settings: {
    layout: {
      config: {
        navbar: {
          display: false,
        },
        toolbar: {
          display: false,
        },
        footer: {
          display: false,
        },
        leftSidePanel: {
          display: false,
        },
        rightSidePanel: {
          display: false,
        },
      },
    },
  },
  auth: authRoles.onlyGuest, // []
};

export default SignInPageRoute;
