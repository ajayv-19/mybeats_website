import { lazy } from "react";
import { Navigate } from "react-router-dom";
import { FuseRouteItemType } from "@fuse/utils/FuseUtils";

const AgentFormsTab = lazy(() => import("../settings/tabs/AgentForms"));
const AgentFormsDetails = lazy(
  () => import("../settings/tabs/AgentFormsDetails"),
);

/**
 * The Agent Forms App Route.
 */
const AgentFormsAppRoute: FuseRouteItemType = {
  path: "apps/agent-forms",
  //   element: <AgentFormsTab />,
  children: [
    {
      path: "form/:formId",
      element: <AgentFormsDetails />,
    },
    {
      path: "renewal/:formId",
      element: <AgentFormsDetails />,
    },
    {
      path: "",
      element: <AgentFormsTab />,
    },
  ],
};

export default AgentFormsAppRoute;
