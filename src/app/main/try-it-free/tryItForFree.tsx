import { FuseRouteItemType } from "@fuse/utils/FuseUtils";
import { Navigate } from "react-router-dom";
import authRoles from "../../auth/authRoles";

const TryItFreeRoute: FuseRouteItemType = {
  path: "try-it-free",
  element: <Navigate to="/sign-in?demo=true" replace />,
  settings: {
    layout: {
      config: {
        navbar: { display: false },
        toolbar: { display: false },
        footer: { display: false },
        leftSidePanel: { display: false },
        rightSidePanel: { display: false },
      },
    },
  },
  auth: authRoles.onlyGuest,
};

export default TryItFreeRoute;
