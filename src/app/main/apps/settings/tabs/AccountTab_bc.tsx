import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { z } from 'zod';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import _ from 'lodash';
import { useEffect } from 'react';
import { fetchDefaultEmail } from 'src/utils/apis/userAuthApis';
import { SettingsAccount, useGetAccountSettingsQuery, useUpdateAccountSettingsMutation } from '../SettingsApi';

type FormType = SettingsAccount;

const defaultValues: FormType = {
	name: '',
	email: ''
};

/**
 * Form Validation Schema
 */
const schema = z.object({
	name: z.string().nonempty('Name is required'),
	email: z.string().email('Invalid email').nonempty('Email is required')
});

function AccountTab() {
	const { data: accountSettings } = useGetAccountSettingsQuery();
	const [updateAccountSettings] = useUpdateAccountSettingsMutation();

	const { control, reset, handleSubmit, formState, setValue } = useForm<FormType>({
		defaultValues,
		mode: 'all',
		resolver: zodResolver(schema)
	});

	const { isValid, dirtyFields, errors } = formState;

	// useEffect(() => {
	// 	reset(accountSettings);
	// }, [accountSettings, reset]);

	useEffect(() => {
		const setDefaultEmail = async () => {
			try {
				const email = await fetchDefaultEmail();
				setValue('email', email);
			} catch (error) {
				console.error('Error setting default email:', error);
			}
		};
		setDefaultEmail();
	}, [setValue]);

	/**
	 * Form Submit
	 */
	function onSubmit(formData: FormType) {
		updateAccountSettings(formData);
	}

	return (
		<div className="w-full max-w-3xl">
			<form onSubmit={handleSubmit(onSubmit)}>
				<div className="w-full">
					<Typography className="text-xl">Profile</Typography>
					<Typography color="text.secondary">
						Following information is publicly displayed, be careful!
					</Typography>
				</div>
				<div className="mt-32 grid w-full gap-24 sm:grid-cols-4">
					<div className="sm:col-span-4">
						<Controller
							control={control}
							name="name"
							render={({ field }) => (
								<TextField
									{...field}
									label="Name"
									placeholder="Name"
									id="name"
									error={!!errors.name}
									helperText={errors?.name?.message}
									variant="outlined"
									required
									fullWidth
									InputProps={{
										startAdornment: (
											<InputAdornment position="start">
												<FuseSvgIcon size={20}>heroicons-solid:user-circle</FuseSvgIcon>
											</InputAdornment>
										)
									}}
								/>
							)}
						/>
					</div>
				</div>

				<div className="my-40 border-t" />
				<div className="w-full">
					<Typography className="text-xl">Personal Information</Typography>
					<Typography color="text.secondary">
						Communication details in case we want to connect with you. These will be kept private.
					</Typography>
				</div>
				<div className="grid w-full gap-24 sm:grid-cols-4 mt-32">
					<div className="sm:col-span-2">
						<Controller
							control={control}
							name="email"
							render={({ field }) => (
								<TextField
									{...field}
									label="Email"
									placeholder="Email"
									variant="outlined"
									fullWidth
									error={!!errors.email}
									helperText={errors?.email?.message}
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
					<Button
						variant="outlined"
						disabled={_.isEmpty(dirtyFields)}
						onClick={() => reset(accountSettings)}
					>
						Cancel
					</Button>
					<Button
						variant="contained"
						color="secondary"
						disabled={_.isEmpty(dirtyFields) || !isValid}
						type="submit"
					>
						Save
					</Button>
				</div>
			</form>
		</div>
	);
}

export default AccountTab;
