import React, { ReactElement } from 'react';

import Button from '@mui/material/Button';

interface InvitationsDialogProps {
	open: boolean;
	onClose: () => void;
	onShare: () => void;
	onCancel: () => void;
	onBack: () => void;
}

function UserInvitationDialog({ open, onShare, onCancel, onBack }: InvitationsDialogProps): ReactElement {
	if (!open) return null;

	return (
		<div className="company-register-dialog">
			{/* <div className="dialog-title">Plan subscription</div> */}
			<div className="dialog-content">
				<div
					className="dialog-content-text"
					style={{ fontSize: '18px' }}
				>
					Please Invite the Admin who has Authority to Purchase the Plan?
				</div>
			</div>
			<div className="flex flex-1 justify-between items-center my-16">
				{/* <div className="flex flex-col items-center"> */}
				<Button
					variant="contained"
					onClick={onBack}
					size="small"
					color="secondary"
					className="mt-4 m-6 z-10 rounded p-0 text-md min-h-0 h-auto w-auto min-w-0 px-8 py-4"
					classes={{ startIcon: 'mr-4' }}
				>
					Back
				</Button>
				{/* </div> */}
				<div className="flex flex-1 justify-end my-16 lg:my-0">
					<Button
						variant="contained"
						onClick={onShare}
						size="small"
						color="secondary"
						className="mt-4 m-6 z-10 rounded p-0 text-md min-h-0 h-auto w-auto min-w-0 px-8 py-4"
						classes={{ startIcon: 'mr-4' }}
					>
						Share
					</Button>

					<Button
						variant="contained"
						onClick={onCancel}
						size="small"
						color="secondary"
						className="mt-4 m-6 z-10 rounded p-0 text-md min-h-0 h-auto w-auto min-w-0 px-8 py-4"
						classes={{ startIcon: 'mr-4' }}
					>
						Cancel
					</Button>
				</div>
			</div>
		</div>
	);
}

export default UserInvitationDialog;
