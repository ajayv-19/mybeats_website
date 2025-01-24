import React from 'react';
import Button from '@mui/material/Button';

interface CompanyRegisterDialogProps {
	open: boolean;
	onClose: () => void;
	onYes: () => void;
	onNo: () => void;
}

function CompanyRegisterDialog({ open, onYes, onNo }): React.FC<CompanyRegisterDialogProps> {
	if (!open) return null;

	return (
		<div className="company-register-dialog">
			<div className="dialog-content">
				<div
					className="dialog-content-text"
					style={{ fontSize: '18px' }}
				>
					Do you have the authority to register your company and purchase the payment plan?
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
					classes={{ startIcon: 'mr-4' }}
				>
					No
				</Button>

				<Button
					variant="contained"
					onClick={onYes}
					size="small"
					color="secondary"
					className="mt-4 m-6 z-10 rounded p-0 text-md min-h-0 h-auto w-auto min-w-0 px-8 py-4"
					classes={{ startIcon: 'mr-4' }}
				>
					Yes
				</Button>
			</div>
		</div>
	);
};

export default CompanyRegisterDialog;
