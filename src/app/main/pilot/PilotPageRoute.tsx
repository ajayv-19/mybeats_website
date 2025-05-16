import { FuseRouteItemType } from '@fuse/utils/FuseUtils';
import authRoles from '../../auth/authRoles';
import PilotPage from './PilotPage';

const PilotPageRoute: FuseRouteItemType = {
  path: 'pilot',
  element: <PilotPage />,
  settings: {
    layout: {
      config: {
        navbar: {
          display: false
        },
        toolbar: {
          display: false
        },
        footer: {
          display: false
        },
        leftSidePanel: {
          display: false
        },
        rightSidePanel: {
          display: false
        }
      }
    }
  },
  auth: authRoles.onlyGuest // []
};

export default PilotPageRoute;
