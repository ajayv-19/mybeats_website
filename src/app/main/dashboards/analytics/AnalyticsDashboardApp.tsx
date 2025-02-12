import FusePageSimple from "@fuse/core/FusePageSimple";
import FuseLoading from "@fuse/core/FuseLoading";
import { fetchAuthSession } from "@aws-amplify/auth";
import { get } from "aws-amplify/api";
import { Amplify } from "aws-amplify";
import useThemeMediaQuery from "@fuse/hooks/useThemeMediaQuery";
import { useState, useEffect } from "react";
import { styled } from "@mui/material/styles";
import AnalyticsDashboardAppHeader from "./AnalyticsDashboardAppHeader";
import awsExports from "../../../../../src2/aws-exports";
// const container = {
// 	show: {
// 		transition: {
// 			staggerChildren: 0.04
// 		}
// 	}
// };

// const item = {
// 	hidden: { opacity: 0, y: 20 },
// 	show: { opacity: 1, y: 0 }
// };
Amplify.configure(awsExports);

const Root = styled(FusePageSimple)(({ theme }) => ({
  "& .FusePageSimple-header": {
    backgroundColor: theme.palette.background.paper,
    boxShadow: `inset 0 -1px 0 0px  ${theme.palette.divider}`,
  },
}));

/**
 * The analytics dashboard app.
 */
function AnalyticsDashboardApp() {
  const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down("lg"));

  const [loader, setLoader] = useState(true);
  const [qaModel, setQaModel] = useState(false);
  const [url, setUrl] = useState("");
  const [qaUrl, setQaUrl] = useState("");
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
        const { email } = data.tokens.idToken.payload;

        const params = {
          headers: {
            Authorization: authToken,
          },
          response: true,
          queryStringParameters: {
            jwtToken: authToken,
            payloadSub,
            email,
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
              payloadSub,
              email,
            },
          } as any,
        });

        const data1 = await quicksight.response;
        const data2 = await data1.body;
        const data3 = (await data2.json()) as {
          embedUrl: string;
          generativeQnAEmbedUrl: string;
        };
        setUrl(data3.embedUrl);
        setQaUrl(data3.generativeQnAEmbedUrl);

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
  }, []);

  // const { isLoading } = useGetAnalyticsDashboardWidgetsQuery();

  if (loader) {
    return <FuseLoading />;
  }

  return (
    <Root
      header={
        <AnalyticsDashboardAppHeader
          onFinnClick={() => setQaModel(true)}
          content={
            <div
              className={`absolute top-5 left-10 rounded-md w-full h-full z-10 ${
                qaModel ? "" : "hidden"
              }`}
            >
              <div className="relative flex">
                <button
                  type="button"
                  className="px-16 py-4 text-center absolute top-8 right-16 rounded bg-[#177199] text-white"
                  style={{ width: "110px" }}
                  onClick={() => setQaModel(false)}
                >
                  <span>CLOSE</span>
                  {/* <Close /> */}
                </button>
              </div>
              <iframe width="100%" height="100%" src={qaUrl} />
            </div>
          }
        />
      }
      content={
        <div className="h-full w-full px-12 flex flex-col relative  ">
          <iframe
            className="w-full h-full grow border-none"
            width="100%"
            height="100%"
            src={url}
          />
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

  // return (
  // 	<FusePageSimple
  // 		header={<AnalyticsDashboardAppHeader />}
  // 		content={
  // 			<motion.div
  // 				className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-32 w-full p-24 md:p-32"
  // 				variants={container}
  // 				initial="hidden"
  // 				animate="show"
  // 			>
  // 				<motion.div
  // 					variants={item}
  // 					className="sm:col-span-2 lg:col-span-3"
  // 				>
  // 					<VisitorsOverviewWidget />
  // 				</motion.div>

  // 				<motion.div
  // 					variants={item}
  // 					className="sm:col-span-2 lg:col-span-1 "
  // 				>
  // 					<ConversionsWidget />
  // 				</motion.div>

  // 				<motion.div
  // 					variants={item}
  // 					className="sm:col-span-2 lg:col-span-1 "
  // 				>
  // 					<ImpressionsWidget />
  // 				</motion.div>

  // 				<motion.div
  // 					variants={item}
  // 					className="sm:col-span-2 lg:col-span-1 "
  // 				>
  // 					<VisitsWidget />
  // 				</motion.div>

  // 				<motion.div
  // 					variants={item}
  // 					className="sm:col-span-2 lg:col-span-3"
  // 				>
  // 					<VisitorsVsPageViewsWidget />
  // 				</motion.div>

  // 				<div className="w-full mt-16 sm:col-span-3">
  // 					<Typography className="text-2xl font-semibold tracking-tight leading-6">
  // 						Your Audience
  // 					</Typography>
  // 					<Typography
  // 						className="font-medium tracking-tight"
  // 						color="text.secondary"
  // 					>
  // 						Demographic properties of your users
  // 					</Typography>
  // 				</div>

  // 				<div className="sm:col-span-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-32 w-full">
  // 					<motion.div variants={item}>
  // 						<NewVsReturningWidget />
  // 					</motion.div>
  // 					<motion.div variants={item}>
  // 						<GenderWidget />
  // 					</motion.div>
  // 					<motion.div variants={item}>
  // 						<AgeWidget />
  // 					</motion.div>
  // 					<motion.div variants={item}>
  // 						<LanguageWidget />
  // 					</motion.div>
  // 				</div>
  // 			</motion.div>
  // 		}
  // 	/>
  // );
}

export default AnalyticsDashboardApp;
