import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import FuseSvgIcon from "@fuse/core/FuseSvgIcon";
import PageBreadcrumb from "app/shared-components/PageBreadcrumb";
import { useState, ReactNode, useEffect } from "react";
import _ from "@lodash";
import { darken } from "@mui/material/styles";
import { selectUser } from "src/app/auth/user/store/userSlice";
import { useAppSelector } from "app/store/hooks";
import Avatar from "@mui/material/Avatar";
import { useGetProjectDashboardProjectsQuery } from "../project/ProjectDashboardApi";
import {
  fetchAccountDetails,
  selectAccount,
  selectAccountLoading,
  submitAccountDetails,
} from "src/app/features/account/accountSlice";
import { useDispatch, useSelector } from "react-redux";
import { fetchDefaultEmail } from "src/utils/apis/userAuthApis";
/**
 * The analytics dashboard app header.
 */
function AnalyticsDashboardAppHeader({
  content,
  onFinnClick,
}: {
  content: ReactNode;
  onFinnClick: () => void;
}) {
  const { data: projects } = useGetProjectDashboardProjectsQuery();

  // const user = useAppSelector(selectUser);
  const [fullName, setFullName] = useState("");
  const [profileImage, setProfileImage] = useState<string>("");
  const account = useSelector(selectAccount);
  console.log({ account }, "account");
  const { user } = useSelector(selectAccount);

  useEffect(() => {
    if (user) {
      setFullName(user.Customer_Name);
      setProfileImage(user.image);
    }
  }, [user]);

  //const user = useAppSelector(selectUser);

  const [selectedProject, setSelectedProject] = useState<{
    id: number;
    menuEl: HTMLElement | null;
  }>({
    id: 1,
    menuEl: null,
  });

  function handleChangeProject(id: number) {
    setSelectedProject({
      id,
      menuEl: null,
    });
  }

  function handleOpenProjectMenu(event: React.MouseEvent<HTMLElement>) {
    setSelectedProject({
      id: selectedProject.id,
      menuEl: event.currentTarget,
    });
  }

  function handleCloseProjectMenu() {
    setSelectedProject({
      id: selectedProject.id,
      menuEl: null,
    });
  }
  return (
    <div className="flex flex-col w-full px-20 sm:px-20 ">
      <div className="flex flex-col sm:flex-row flex-auto sm:items-center min-w-0 buttom-4 ">
        <div className="flex flex-auto items-start min-w-0">
          <Avatar
            sx={{
              background: (theme) =>
                darken(theme.palette.background.default, 0.05),
              color: (theme) => theme.palette.text.secondary,
            }}
            className="flex-0 w-64 h-64 mt-4"
            alt="user photo"
            src={user?.image}
          >
            {user?.Customer_Name?.[0]}
          </Avatar>
          <div className="flex flex-col min-w-0 mx-16">
            <PageBreadcrumb />
            <Typography className="text-2xl md:text-5xl font-semibold tracking-tight leading-7 md:leading-snug truncate">
              {`Welcome back, ${fullName || user?.email || "Guest"}!`}
            </Typography>

            <div className="flex items-center">
              {/* <FuseSvgIcon size={20} color="action">
                heroicons-solid:bell
              </FuseSvgIcon> */}
              <Typography
                className="mx-6 leading-6 truncate"
                color="text.secondary"
              ></Typography>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-center mt-24 sm:mt-0 sm:mx-8 space-x-8 space-y-2 bottom-4">
          <img
            className="h-120 object-cover w-full object-[0px_10px] cursor-pointer "
            src="assets/images/pages/dashboard/finn.png"
            alt="Profile Cover"
            onClick={() => onFinnClick && onFinnClick()}
          />

          <Button
            variant="contained"
            // onClick={handleButtonClick}
            size="small"
            color="secondary"
            className="m-6 z-10 rounded p-0 text-md min-h-0 h-auto w-auto min-w-0 px-12 !mt-0 "
            // style={{ width: '200px' }}
            classes={{ startIcon: "mr-4" }}
            onClick={() => onFinnClick && onFinnClick()}
            // startIcon={
            //   <FuseSvgIcon size={20}>heroicons-solid:envelope</FuseSvgIcon>
            // }
          >
            Ask FINN
          </Button>
        </div>
      </div>
      {content}
    </div>
  );
  // return (
  // 	<div className="flex w-full container">
  // 		<div className="flex flex-col sm:flex-row flex-auto sm:items-center min-w-0 p-24 md:p-32 pb-0 md:pb-0">
  // 			<div className="flex flex-col flex-auto">
  // 				<PageBreadcrumb className="mb-8" />
  // 				<Typography className="text-3xl font-semibold tracking-tight leading-8">
  // 					Analytics dashboard
  // 				</Typography>
  // 				<Typography
  // 					className="font-medium tracking-tight"
  // 					color="text.secondary"
  // 				>
  // 					Monitor metrics, check reports and review performance
  // 				</Typography>
  // 			</div>
  // 			<div className="flex items-center mt-24 sm:mt-0 sm:mx-8 space-x-8">
  // 				<Button
  // 					className="whitespace-nowrap"
  // 					startIcon={<FuseSvgIcon size={20}>heroicons-solid:cog-6-tooth</FuseSvgIcon>}
  // 					variant="contained"
  // 					color="primary"
  // 				>
  // 					Settings
  // 				</Button>
  // 				<Button
  // 					className="whitespace-nowrap"
  // 					variant="contained"
  // 					color="secondary"
  // 					startIcon={<FuseSvgIcon size={20}>heroicons-solid:arrow-up-tray</FuseSvgIcon>}
  // 				>
  // 					Export
  // 				</Button>
  // 			</div>
  // 		</div>
  // 	</div>
  // );
}

export default AnalyticsDashboardAppHeader;
