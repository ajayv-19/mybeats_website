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
import { useSelector } from "react-redux";
import { selectAccount } from "src/app/features/account/accountSlice";
import { useNavigate } from "react-router";
import { useModal } from "src/app/context/dashboardmodelcontext";
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
  // const [qaModel, setQaModel] = useState(false);
  const { qaModal, setQaModal } = useModal();
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
      content={
        <div className="h-full w-full px-12 flex flex-col relative">
          <div
            className={`absolute top-0 left-0 rounded-md w-full h-full z-10 ${
              qaModal ? "" : "hidden"
            }`}
          >
            {/* //absolute top-5 left-10 rounded-md w-full h-full */}
            <div className="relative flex">
              <button
                type="button"
                className="px-16 py-4 text-center absolute top-8 right-16 rounded bg-[#177199] text-white"
                style={{ width: "110px" }}
                onClick={() => setQaModal(false)}
              >
                <span>CLOSE</span>
              </button>
            </div>
            <iframe width="100%" height="100%" src={qaUrl} />
          </div>

          <iframe
            className="w-full h-full grow border-none"
            width="100%"
            height="100%"
            src={url}
          />
        </div>
      }
      scroll={isMobile ? "normal" : "page"}
    />
  );
 
}

export default AnalyticsDashboardApp;
