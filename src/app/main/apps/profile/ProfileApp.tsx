import FusePageSimple from "@fuse/core/FusePageSimple";
import { styled } from "@mui/material/styles";
import Avatar from "@mui/material/Avatar";
import Typography from "@mui/material/Typography";
import { motion } from "framer-motion";
import { SyntheticEvent, useState } from "react";
import useThemeMediaQuery from "@fuse/hooks/useThemeMediaQuery";
import FuseTabs from "app/shared-components/tabs/FuseTabs";
import FuseTab from "app/shared-components/tabs/FuseTab";
import AboutTab from "./tabs/about/AboutTab";
import PhotosVideosTab from "./tabs/photos-videos/PhotosVideosTab";
import TimelineTab from "./tabs/timeline/TimelineTab";
import Button from "@mui/material/Button";
import { useNavigate } from "react-router-dom";
import { fetchAuthSession } from "@aws-amplify/auth";
import axios from "axios";
import { fetchProfileData } from "../../../backendServices/ProfileServices";

import React, { useEffect, useRef } from "react";
import { checkUserExist } from "./ProfileApis/checkUserApi";
const Root = styled(FusePageSimple)(({ theme }) => ({
  "& .FusePageSimple-header": {
    backgroundColor: theme.palette.background.paper,
    borderBottomWidth: 1,
    borderStyle: "solid",
    borderColor: theme.palette.divider,
    "& > .container": {
      maxWidth: "100%",
    },
  },
}));

/**
 * The profile page.
 */
function ProfileApp() {
  //const [selectedTab, setSelectedTab] = useState("about");
  const navigate = useNavigate();

  useEffect(() => {
    checkUserExist()
      .then((res) => {
        console.log(res, "res");

        if (res.status !== 200) {
          navigate("/apps/settings/account");
        }
      })
      .catch((error) => {
        console.log(error);
        navigate("/apps/settings/account");
      });
  }, []);

  //const navigate = useNavigate();
  const handleDashbaordClick = () => {
    // navigate(`${window.origin}/dashboards/project`);
    navigate("/dashboards/analytics");
  };

  const handleSettingClick = () => {
    // navigate(`${window.origin}/dashboards/project`);
    navigate(`/apps/settings/account`);
  };

  const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down("lg"));

  //New State variables for user data
  const [companyName, setCompanyName] = useState("");
  const [createdTimestamp, setCreatedTimestamp] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [image, setImage] = useState();
  console.log(image, "image");

  const [role, setRole] = useState("");
  const [username, setUsername] = useState("");
  const [usertype, setUsertype] = useState("");
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const getUserData = await fetchProfileData();
        //console.log(getUserData, "getUserData");

        if (getUserData.status === 200) {
          const userData = getUserData.data.userdata.user;

          // Extracting and setting the user data fields
          setCompanyName(userData["Company_Name"] || "");
          setCreatedTimestamp(userData["created_timestamp"] || "");
          setCustomerName(userData["Customer_Name"] || "");
          setImage(userData["image"] || "");
          setRole(userData["role"] || "");
          setUsername(userData["username"] || "");
          setUsertype(userData["usertype"] || "");
          setUserEmail(userData["email"] || "");

          //console.log(userData);
        }
      } catch (error) {
        console.log(error);
      }
    };

    fetchUserData();
  }, []);

  return (
    <Root
      header={
        <div className="flex flex-col w-full">
          <img
            className="h-160 lg:h-320 object-cover w-full"
            src="assets/images/pages/profile/cover.jpg"
            alt="Profile Cover"
          />

          <div className="flex flex-col flex-0 lg:flex-row items-center max-w-5xl w-full mx-auto px-32 lg:h-72">
            <div className="-mt-96 lg:-mt-88 rounded-full">
              {/* <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1, transition: { delay: 0.1 } }}
              > */}

              <Avatar
                sx={{ borderColor: "background.paper" }}
                className="w-128 h-128 border-4"
                src={image}
                alt="User avatar"
              />
              {/* </motion.div> */}
            </div>

            <div className="flex flex-col items-center lg:items-start mt-16 lg:mt-0 lg:ml-32">
              <Typography className="text-lg font-bold leading-none">
                {customerName}
              </Typography>
              <Typography color="text.secondary"> {userEmail}</Typography>
            </div>

            <div className="hidden lg:flex h-32 mx-32 border-l-2" />
            <div className="flex flex-1 justify-end my-16 lg:my-0">
              <Button
                variant="contained"
                onClick={handleDashbaordClick}
                size="small"
                color="secondary"
                className="mt-4 m-6 z-10 rounded p-0 text-md min-h-0 h-auto w-auto min-w-0 px-8 py-4"
                classes={{ startIcon: "mr-4" }}
              >
                Dashboard
              </Button>

              <Button
                variant="contained"
                onClick={handleSettingClick}
                size="small"
                color="secondary"
                className="mt-4 m-6 z-10 rounded p-0 text-md min-h-0 h-auto w-auto min-w-0 px-8 py-4"
                classes={{ startIcon: "mr-4" }}
              >
                Setting
              </Button>

              <Button
                variant="contained"
                // onClick={handleButtonClick}
                size="small"
                color="secondary"
                className="mt-4 m-6 z-10 rounded p-0 text-md min-h-0 h-auto w-auto min-w-0 px-8 py-4"
                classes={{ startIcon: "mr-4" }}
              >
                Share
              </Button>
            </div>

            {/* <div className="flex items-centre mt-24 lg:mt-0 space-x-24">
              <div className="flex flex-col items-center">
                <Button
                  variant="contained"
                  onClick={handleButtonClick}
                  size="small"
                  color="secondary"
                  className="absolute mt-4 right-0 m-6 z-10 rounded p-0 text-md min-h-0 h-auto w-auto min-w-0 px-8 py-4"
                  classes={{ startIcon: "mr-4" }}
                >
                  View Dashboard
                </Button>
              </div>
              <div className="flex flex-col items-center">
                <Typography className="font-bold">1.2k</Typography>
                <Typography
                  className="text-sm font-medium"
                  color="text.secondary"
                >
                  FOLLOWING
                </Typography>
              </div>
            </div> */}

            {/* <div className="flex flex-1 justify-end my-16 lg:my-0">
              <FuseTabs value={selectedTab} onChange={handleTabChange}>
                <FuseTab label="Timeline" value="timeline" />
                <FuseTab label="About" value="about" />
                <FuseTab label="Photos & Videos" value="photos-videos" />
              </FuseTabs>
            </div> */}
          </div>
        </div>
      }
      content={
        <div className="flex flex-auto justify-center w-full max-w-5xl mx-auto p-24 sm:p-32">
          {/* {selectedTab === "timeline" && <TimelineTab />} */}
          {/* {selectedTab === "about" && <AboutTab />} */}
          <AboutTab />
          {/* {selectedTab === "photos-videos" && <PhotosVideosTab />} */}
        </div>
      }
      scroll={isMobile ? "normal" : "page"}
    />
  );
}

export default ProfileApp;
