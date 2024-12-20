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

Amplify.configure(awsExports);

const Root = styled(FusePageSimple)(({ theme }) => ({
  "& .FusePageSimple-header": {
    backgroundColor: theme.palette.background.paper,
    boxShadow: `inset 0 -1px 0 0px  ${theme.palette.divider}`,
  },
}));

function ProjectDashboardApp() {
  const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down("lg"));

  const [loader, setLoader] = useState(true);
  const [url, setUrl] = useState("");
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
        const data3 = (await data2.json()) as { embedUrl: string };
        setUrl(data3.embedUrl);

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

        const testingapi = await axios.get(
          `https://2l7kgrkd47.execute-api.us-east-1.amazonaws.com/dev/getallcompanyusers?email=${email}`,
          {
            headers: {
              Authorization: authToken2,
            },
          }
        );
        console.log(testingapi);

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
    <FusePageSimple
      content={
        <div className="flex flex-col w-full p-24">
          <iframe width="100%" height="720" src={url}></iframe>
          {/* <PageBreadcrumb className="mb-8" />
                   <Typography className="text-4xl font-extrabold leading-none tracking-tight mb-4">
                       All Activities
                   </Typography>
                   <Typography
                       className="text-lg"
                       color="text.secondary"
                   >
                       Application wide activities are listed here as individual items, starting with the most recent.
                   </Typography>
                   <Timeline
                       className="py-48 px-0"
                       position="right"
                       sx={{
                           '& .MuiTimelineItem-root:before': {
                               display: 'none'
                           }
                       }}
                   >
                       {exampleActivitiesData.map((item, index) => (
                           <ActivityTimelineItem
                               last={exampleActivitiesData.length === index + 1}
                               item={item}
                               key={item.id}
                           />
                       ))}
                   </Timeline> */}
        </div>
      }
      scroll={isMobile ? "normal" : "page"}
    />
  );
}

export default ProjectDashboardApp;
