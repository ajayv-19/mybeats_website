import React from "react";

import Button from "@mui/material/Button";

interface CompanyRegisterDialogProps {
  open: boolean;
  onClose: () => void;
  onYes: () => void;
  onNo: () => void;
}

const CompanyRegisterDialog: React.FC<CompanyRegisterDialogProps> = ({
  open,
  onClose,
  onYes,
  onNo,
}) => {
  if (!open) return null;
  // return (
  //   <Dialog open={open} onClose={onClose}>
  //     <DialogTitle>Plan subscription</DialogTitle>
  //     <DialogContent>
  //       <DialogContentText>
  //         Do you have the authority to register your company and purchase the
  //         payment plan?
  //       </DialogContentText>
  //     </DialogContent>
  //     <DialogActions>
  //       <Button onClick={onNo} color="primary">
  //         No
  //       </Button>
  //       <Button onClick={onYes} color="primary" autoFocus>
  //         Yes
  //       </Button>
  //     </DialogActions>
  //   </Dialog>
  // );

  return (
    <div className="company-register-dialog">
      {/* <div className="dialog-title">Plan subscription</div> */}
      <div className="dialog-content">
        <div className="dialog-content-text" style={{ fontSize: "18px" }}>
          Do you have the authority to register your company and purchase the
          payment plan?
        </div>
      </div>
      <div className="flex flex-1 justify-end my-16 lg:my-0">
        <Button
          variant="contained"
          // onClick={handleDashbaordClick}
          onClick={onNo}
          size="small"
          color="secondary"
          className="mt-4 m-6 z-10 rounded p-0 text-md min-h-0 h-auto w-auto min-w-0 px-8 py-4"
          classes={{ startIcon: "mr-4" }}
        >
          No
        </Button>

        <Button
          variant="contained"
          // onClick={handleButtonClick}
          onClick={onYes}
          size="small"
          color="secondary"
          className="mt-4 m-6 z-10 rounded p-0 text-md min-h-0 h-auto w-auto min-w-0 px-8 py-4"
          classes={{ startIcon: "mr-4" }}
        >
          Yes
        </Button>
      </div>

      {/* <div className="dialog-actions">
        <Button onClick={onNo} color="primary" style={{ fontSize: "16px" }}>
          No
        </Button>
        <Button
          onClick={onYes}
          color="primary"
          autoFocus
          style={{ fontSize: "16px" }}
        >
          Yes
        </Button>
      </div> */}
    </div>
  );
};

export default CompanyRegisterDialog;
