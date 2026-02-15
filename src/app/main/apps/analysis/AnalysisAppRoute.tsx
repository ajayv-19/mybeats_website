import { lazy } from "react";
import { Navigate } from "react-router-dom";
import { FuseRouteItemType } from "@fuse/utils/FuseUtils";

const AnalysisList = lazy(() => import("./AnalysisList"));
const AnalysisDetail = lazy(() => import("./AnalysisDetail"));

/**
 * The Analysis App Route.
 */
const AnalysisAppRoute: FuseRouteItemType = {
  path: "apps/analysis",
  children: [
    {
      path: ":fire_department_id",
      element: <AnalysisDetail />,
    },
    {
      path: "",
      element: <AnalysisList />,
    },
  ],
};

export default AnalysisAppRoute;

