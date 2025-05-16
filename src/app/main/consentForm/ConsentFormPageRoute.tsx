import { FuseRouteItemType } from "@fuse/utils/FuseUtils";
import authRoles from "../../auth/authRoles";
import ConsentFormPage from "./ConsentFormPage";

const ConsentFormPageRoute: FuseRouteItemType = {
  path: "consent",
  element: <ConsentFormPage />,
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

export default ConsentFormPageRoute;
