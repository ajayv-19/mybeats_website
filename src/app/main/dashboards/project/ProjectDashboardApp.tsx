import FusePageSimple from "@fuse/core/FusePageSimple";
import { useState, useEffect } from "react";
import { styled } from "@mui/material/styles";
import * as React from "react";
import FuseLoading from "@fuse/core/FuseLoading";
import FuseTabs from "app/shared-components/tabs/FuseTabs";
import FuseTab from "app/shared-components/tabs/FuseTab";
import ProjectDashboardAppHeader from "./ProjectDashboardAppHeader";
import HomeTab from "./tabs/home/HomeTab";
import TeamTab from "./tabs/team/TeamTab";
import BudgetTab from "./tabs/budget/BudgetTab";
import { useGetProjectDashboardWidgetsQuery } from "./ProjectDashboardApi";
import { fetchAuthSession } from "@aws-amplify/auth";
import { get } from "aws-amplify/api";
import awsExports from "../../../../../src2/aws-exports";
import { Amplify } from "aws-amplify";
import useThemeMediaQuery from "@fuse/hooks/useThemeMediaQuery";
import axios from "axios";
import API from "@aws-amplify/api";
import Close from "@mui/icons-material/Close";

Amplify.configure(awsExports);

const Root = styled(FusePageSimple)(({ theme }) => ({
  "& .FusePageSimple-header": {
    backgroundColor: theme.palette.background.paper,
    boxShadow: `inset 0 -1px 0 0px  ${theme.palette.divider}`,
  },
}));

// function ProjectDashboardAppHeader() {
//   return (
//     <>
//       <div>
//         <div>Home</div>
//         <img></img>
//       </div>
//     </>
//   );
// }

function ProjectDashboardApp() {
  const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down("lg"));

  const [loader, setLoader] = useState(true);
  // const [qaModel, setQaModel] = useState(false); // Turned off topic / Ask FINN
  const [url, setUrl] = useState("");
  // const [qaUrl, setQaUrl] = useState(""); // Turned off topic / Ask FINN
  const [companyName, setCompanyName] = useState(""); // State to store the company name

  useEffect(() => {
    const getQuickSightDashboardEmbedURL = async () => {
      try {
        const data = await fetchAuthSession(); // Use fetchAuthSession to get the session details
        console.log(data);

        const authToken = (
          await fetchAuthSession()
        ).tokens?.idToken?.toString();

        const authToken2 = (
          await fetchAuthSession()
        ).tokens?.accessToken?.toString();

        console.log("authToken ", authToken);
        console.log("authToken2 ", authToken2);

        const payloadSub = data.tokens.idToken.payload.sub;
        const email = data.tokens.idToken.payload.email;

        const params = {
          headers: {
            Authorization: authToken,
          },
          response: true,
          queryStringParameters: {
            jwtToken: authToken,
            payloadSub: payloadSub,
            email: email,
          },
        };

        console.log(params);

        const quicksight = await get({
          apiName: "quicksight", // The Amplify API name as configured
          path: `/getQuickSightDashboardEmbedURL?email=${email}&jwtToken=${authToken}&payloadSub=${payloadSub}`,
          options: {
            headers: {
              Authorization: authToken,
            },
            queryStringParameters: {
              jwtToken: authToken,
              payloadSub: payloadSub,
              email: email,
            },
          } as any,
        });

        const data1 = await quicksight.response;
        const data2 = await data1.body;
        const data3 = (await data2.json()) as {
          embedUrl: string;
          // generativeQnAEmbedUrl: string; // Turned off topic / Ask FINN
        };
        setUrl(data3.embedUrl);
        // setQaUrl(data3.generativeQnAEmbedUrl); // Turned off topic / Ask FINN

        console.log(data3.embedUrl);

        // const testingapi = await axios.get(
        //   `https://f7t2zsdn5g.execute-api.us-east-1.amazonaws.com/dev/getcompanybyemail?email=${email}`,
        //   {
        //     headers: {
        //       Authorization: authToken2,
        //     },
        //   }
        // );
        // const testingapi = await axios.get(
        //   `https://f7t2zsdn5g.execute-api.us-east-1.amazonaws.com/company/fetch?email=${email}`,
        //   {
        //     headers: {
        //       Authorization: authToken2,
        //     },
        //   }
        // );

        // const testingapi = await axios.get(
        //   `https://2l7kgrkd47.execute-api.us-east-1.amazonaws.com/dev/getallcompanyusers?email=${email}`,
        //   {
        //     headers: {
        //       Authorization: authToken2,
        //     },
        //   }
        // );
        // console.log(testingapi);

        setLoader(false);
      } catch (error) {
        console.error("Error during API calls:", error);
        setLoader(false);
      }
    };

    getQuickSightDashboardEmbedURL();
  }, []); // Empty dependency array ensures the effect runs once when the component mounts

  if (loader) {
    return <FuseLoading />;
  }

  return (
    <Root
      header={
        <ProjectDashboardAppHeader
          // onFinnClick={() => setQaModel(true)} // Turned off topic / Ask FINN
          content={
            <>
              {/* Turned off topic / Ask FINN Q&A overlay */}
              {/* <div
                className={
                  "absolute top-5 left-10 rounded-md w-full h-full z-10 " +
                  (qaModel ? "" : "hidden")
                }
              >
                <div className="relative flex">
                  <button
                    type="button"
                    className="px-16 py-4 text-center absolute top-8 right-16 rounded bg-[#177199] text-white"
                    style={{ width: "110px" }}
                    onClick={() => setQaModel(false)}
                  >
                    <span>CLOSE</span>
                  </button>
                </div>
                <iframe width="100%" height={"100%"} src={qaUrl}></iframe>
              </div> */}
            </>
          }
        />
      }
      content={
        <div className="h-full w-full px-12 flex flex-col relative  ">
          <iframe
            className="w-full h-full grow border-none"
            width="100%"
            height={"100%"}
            src={url}
          ></iframe>
          <div className="relative flex">
            <button
              type="button"
              className="px-16 py-8 text-center absolute bottom-2  rounded bg-[#ffffff] text-white"
              style={{ width: "100%" }}
            >
              {/* <span>CLOSE</span> */}
              {/* <Close /> */}
            </button>
          </div>
          {/* <div
            style={{ width: "100%", height: "4px", backgroundColor: "white" }}
          ></div> */}
        </div>
      }
      scroll={isMobile ? "normal" : "page"}
    />
  );
}

export default ProjectDashboardApp;

//  <iframe width="100%" height="720" src={qaUrl}></iframe>
