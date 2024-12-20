import FusePageSimple from "@fuse/core/FusePageSimple";
import Typography from "@mui/material/Typography";
import Timeline from "@mui/lab/Timeline";
import useThemeMediaQuery from "@fuse/hooks/useThemeMediaQuery";
import PageBreadcrumb from "app/shared-components/PageBreadcrumb";
import exampleActivitiesData from "./exampleActivitiesData";
import ActivityTimelineItem from "./ActivityTimelineItem";
import { fetchAuthSession } from "@aws-amplify/auth";
import { useEffect, useState } from "react";
import { get } from "aws-amplify/api";
import awsExports from "../../../../../src2/aws-exports";
import { Amplify } from "aws-amplify";

Amplify.configure(awsExports);

/**
 * The activities page.
 */
function ActivitiesPage() {
  const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down("lg"));

  const [loader, setLoader] = useState(true);
  const [url, setUrl] = useState("");

  useEffect(() => {
    const getQuickSightDashboardEmbedURL = async () => {
      try {
        const data = await fetchAuthSession(); // Use fetchAuthSession to get the session details
        // const data = await fetchAuthSession(); // Use fetchAuthSession to get the session details
        console.log(data);

        const authToken = (
          await fetchAuthSession()
        ).tokens?.idToken?.toString();
        console.log("authToken ", authToken);

        // const jwtToken = data.idToken.jwtToken;
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
          apiName: "quicksight",
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

        setLoader(false);
      } catch (error) {
        // alert(error)

        console.error("Error fetching QuickSight dashboard embed URL", error);
        setLoader(false);
      }
    };

    getQuickSightDashboardEmbedURL();
  }, []); // Empty dependency array ensures the effect runs once when the component mounts

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

export default ActivitiesPage;
