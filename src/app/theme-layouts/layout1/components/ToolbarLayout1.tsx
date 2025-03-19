import { ThemeProvider } from "@mui/material/styles";
import AppBar from "@mui/material/AppBar";
import Hidden from "@mui/material/Hidden";
import Toolbar from "@mui/material/Toolbar";
import clsx from "clsx";
import { memo, useEffect, useState } from "react";
import Button from "@mui/material/Button";
import Avatar from "@mui/material/Avatar";
import Typography from "@mui/material/Typography";
import {
  selectFuseCurrentLayoutConfig,
  selectToolbarTheme,
} from "@fuse/core/FuseSettings/fuseSettingsSlice";
import { Layout1ConfigDefaultsType } from "app/theme-layouts/layout1/Layout1Config";
import NotificationPanelToggleButton from "src/app/main/apps/notifications/NotificationPanelToggleButton";
import NavbarToggleButton from "app/theme-layouts/shared-components/navbar/NavbarToggleButton";
import { selectFuseNavbar } from "app/theme-layouts/shared-components/navbar/navbarSlice";
import { useAppSelector } from "app/store/hooks";
import AdjustFontSize from "../../shared-components/AdjustFontSize";
import FullScreenToggle from "../../shared-components/FullScreenToggle";
import { useLocation, useNavigate } from "react-router-dom";
import useAuth from "src/app/auth/useAuth";
import {
  selectAccount,
} from "src/app/features/account/accountSlice";
import { useSelector } from "react-redux";
import { useModal } from "src/app/context/dashboardmodelcontext";

type ToolbarLayout1Props = {
  className?: string;
};

/**
 * The toolbar layout 1.
 */
function ToolbarLayout1(props: ToolbarLayout1Props) {
  const { qaModal, setQaModal } = useModal();
  const location = useLocation();
  const account = useSelector(selectAccount);
  const [showDemo, setShowDemo] = useState<boolean>();
  const [fullName, setFullName] = useState<string>("");
  const [profileImage, setProfileImage] = useState<string>("");

  useEffect(() => {
    if (account) {
      setShowDemo(account.isactive);
      setFullName(account.user?.Customer_Name || "Guest");
      setProfileImage(account.user?.image || "");
    }
  }, [account]);

  const { className } = props;
  const { signOut } = useAuth();
  const config = useAppSelector(
    selectFuseCurrentLayoutConfig
  ) as Layout1ConfigDefaultsType;
  const navbar = useAppSelector(selectFuseNavbar);
  const toolbarTheme = useAppSelector(selectToolbarTheme);
  const navigate = useNavigate();

  const handleFreeTrial = () => {
    signOut();
    navigate("/sign-out");
    setTimeout(() => {
      navigate("/sign-in?demo=true"), window.location.reload();
    }, 1000);
  };

  return (
    <ThemeProvider theme={toolbarTheme}>
      <AppBar
        id="fuse-toolbar"
        className={clsx("relative z-20 flex border-b", className)}
        color="default"
        sx={{
          backgroundColor: (theme) =>
            theme.palette.mode === "light"
              ? toolbarTheme.palette.background.paper
              : toolbarTheme.palette.background.default,
        }}
        position="static"
        elevation={0}
      >
        <Toolbar className="min-h-48 p-0 md:min-h-64">
          {/* Left Section: Image and Name */}
          <div className="flex items-center space-x-8 px-8 md:px-16">
            <Avatar
              sx={{
                background: (theme) => theme.palette.background.default,
                color: (theme) => theme.palette.text.secondary,
              }}
              className="w-40 h-40"
              alt="User Photo"
              src={profileImage}
            >
              {fullName?.[0]} {/* Show the first letter of the name if no image */}
            </Avatar>
            <Typography className="text-lg font-semibold truncate">
            Welcome back,{fullName} !
            </Typography>
          </div>

          {/* Navbar Toggle and Shortcuts */}
          <div className="flex flex-1 px-8 md:px-16 space-x-8">
            {config.navbar.display && config.navbar.position === "left" && (
              <>
                <Hidden lgDown>
                  {(config.navbar.style === "style-3" ||
                    config.navbar.style === "style-3-dense") && (
                    <NavbarToggleButton className="mx-0 h-40 w-40 p-0" />
                  )}

                  {config.navbar.style === "style-1" && !navbar.open && (
                    <NavbarToggleButton className="mx-0 h-40 w-40 p-0" />
                  )}
                </Hidden>

                <Hidden lgUp>
                  <NavbarToggleButton className="mx-0 h-40 w-40 p-0 sm:mx-8" />
                </Hidden>
              </>
            )}

            <Hidden lgDown>
              {/* Navigation Shortcuts */}
            </Hidden>
          </div>

          {/* Right Section: Buttons and Toggles */}
          <div className="flex items-center overflow-x-auto px-8 md:px-16 space-x-6">
            <AdjustFontSize />
            <FullScreenToggle />
            {!showDemo && (
              <Button
                variant="contained"
                onClick={handleFreeTrial}
                size="small"
                color="secondary"
                className="mt-4 m-6 z-10 rounded p-0 text-md min-h-0  w-auto min-w-0 px-8 py-4 h-40"
                classes={{ startIcon: "mr-4" }}
              >
                View Demo
              </Button>
            )}
            {location.pathname === "/dashboards/analytics" && (
              <Button
                variant="contained"
                size="small"
                color="secondary"
                className="mt-4 m-6 z-10 rounded p-0 text-md min-h-0  w-auto min-w-0 px-8 py-4 h-40"
                classes={{ startIcon: "mr-4" }}
                onClick={() => setQaModal(true)}
              >
                Ask FINN
              </Button>
            )}
          </div>

          {config.navbar.display && config.navbar.position === "right" && (
            <>
              <Hidden lgDown>
                {(config.navbar.style === "style-3" ||
                  config.navbar.style === "style-3-dense") && (
                  <NavbarToggleButton className="mx-0 h-40 w-40 p-0" />
                )}

                {config.navbar.style === "style-1" && !navbar.open && (
                  <NavbarToggleButton className="mx-0 h-40 w-40 p-0" />
                )}
              </Hidden>

              <Hidden lgUp>
                <NavbarToggleButton className="mx-0 h-40 w-40 p-0 sm:mx-8" />
              </Hidden>
            </>
          )}
        </Toolbar>
      </AppBar>
    </ThemeProvider>
  );
}

export default memo(ToolbarLayout1);