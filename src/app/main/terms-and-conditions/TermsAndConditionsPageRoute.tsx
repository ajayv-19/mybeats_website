import { FuseRouteItemType } from "@fuse/utils/FuseUtils";
import authRoles from "../../auth/authRoles";
import TermsAndConditionsPage from "./TermsAndConditionsPage";

const SignInPageRoute: FuseRouteItemType = {
  path: "terms-and-conditions",
  element: <TermsAndConditionsPage />,
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
