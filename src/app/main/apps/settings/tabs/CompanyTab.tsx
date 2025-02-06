import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import TextField from '@mui/material/TextField';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import _ from 'lodash';

import { Button, Divider, InputAdornment } from '@mui/material';
import { useSelector } from 'react-redux';
import { selectAccount } from 'src/app/features/account/accountSlice';
import { useEffect } from 'react';
import { SettingsCompany } from '../SettingsApi';

type FormType = SettingsCompany;

const defaultValues: FormType = {
	companyName: null,
	phone: null,
	website: null,
	emailDomain: null
};

/**
 * Form Validation Schema
 */
const schema = z.object({
	companyName: z.string().min(1, 'Company Name is required'),
	phone: z.number().min(1, 'Phone number is required'),
	website: z.string().url('Invalid website URL').optional(),
	emailDomain: z.string().email('Invalid email domain').optional()
});

function CompanyTab() {
	const { company } = useSelector(selectAccount);

	const { control, reset, handleSubmit, formState, setValue } = useForm<FormType>({
		defaultValues,
		mode: 'all',
		resolver: zodResolver(schema)
	});

	const { isValid, dirtyFields, errors } = formState;

	useEffect(() => {
		if (company) {
			// Set form values based on company data
			reset({
				companyName: company.Company_Name,
				phone: company.phone_number,
				website: '',
				emailDomain: company.domain
			});
		}
	}, [company, reset]); // Trigger reset whenever `company` data changes

	const onSubmit = (formData: FormType) => {
		console.log("form data", formData);
	};

	return (
		<div className="w-full max-w-3xl">
			<form onSubmit={handleSubmit(onSubmit)}>
				<div className="mt-32 grid w-full gap-24 sm:grid-cols-4">
					<div className="sm:col-span-2">
						<Controller
							disabled={!!company}
							control={control}
							name="companyName"
							render={({ field }) => (
								<TextField
									{...field}
									label="Company Name"
									placeholder="Company Name"
									id="company-name"
									variant="outlined"
									required
									fullWidth
									InputProps={{
										startAdornment: (
											<InputAdornment position="start">
												<FuseSvgIcon size={20}>heroicons-solid:building-office</FuseSvgIcon>
											</InputAdornment>
										)
									}}
								/>
							)}
						/>
					</div>

					<div className="sm:col-span-2">
						<Controller
							control={control}
							disabled={!!company}
							name="phone"
							render={({ field }) => (
								<TextField
									{...field}
									label="Phone Number"
									placeholder="Phone"
									id="phone"
									variant="outlined"
									required
									fullWidth
									InputProps={{
										startAdornment: (
											<InputAdornment position="start">
												<FuseSvgIcon size={20}>heroicons-solid:phone</FuseSvgIcon>
											</InputAdornment>
										)
									}}
								/>
							)}
						/>
					</div>
				</div>

				<div className="mt-32 grid w-full gap-24 sm:grid-cols-4">
					<div className="sm:col-span-2">
						<Controller
							control={control}
							disabled={!!company}
							name="website"
							render={({ field }) => (
								<TextField
									{...field}
									label="Website"
									placeholder="Website"
									id="website"
									variant="outlined"
									required
									fullWidth
									InputProps={{
										startAdornment: (
											<InputAdornment position="start">
												<FuseSvgIcon size={20}>heroicons-solid:globe-alt</FuseSvgIcon>
											</InputAdornment>
										)
									}}
								/>
							)}
						/>
					</div>

					<div className="sm:col-span-2">
						<Controller
							control={control}
							disabled={!!company}
							name="emailDomain"
							render={({ field }) => (
								<TextField
									{...field}
									label="Email Domain"
									placeholder="Email Name"
									id="email-domain"
									variant="outlined"
									required
									fullWidth
									InputProps={{
										startAdornment: (
											<InputAdornment position="start">
												<FuseSvgIcon size={20}>heroicons-solid:envelope</FuseSvgIcon>
											</InputAdornment>
										)
									}}
								/>
							)}
						/>
					</div>
				</div>

				<Divider className="mb-40 mt-44 border-t" />
				<div className="flex items-center justify-end space-x-8">
					<Button variant="outlined">Cancel</Button>
					<Button
						variant="contained"
						color="secondary"
						type="submit"
						disabled={_.isEmpty(dirtyFields) || !isValid}
					>
						Save
					</Button>
				</div>
			</form>
		</div>
	);
}

export default CompanyTab;
