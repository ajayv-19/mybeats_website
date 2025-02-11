import React, { ReactElement, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { selectAccount } from "../features/account/accountSlice";
import FuseLoading from "@fuse/core/FuseLoading";

function PrivateRoute({ children }: { children: ReactElement }) {
  const { user } = useSelector(selectAccount);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsChecking(false);
    }, 2000); // 2-second delay

    return () => clearTimeout(timer); // Cleanup on unmount
  }, []);

  if (isChecking) {
    return <FuseLoading />; // Show loading state for 2 seconds
  }

  if (user === null) {
    return <Navigate to="/apps/settings/account" />; // Redirect if no user
  }

  return <>{children}</>;
}

export default PrivateRoute;
