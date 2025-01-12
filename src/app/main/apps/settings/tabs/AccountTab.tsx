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
import { useEffect, useState } from 'react';
import { fetchDefaultEmail } from 'src/utils/apis/userAuthApis';
import { SettingsAccount } from '../SettingsApi';
import AccountProfile from '../tabcomponents/AccountProfile';

type FormType = SettingsAccount;

const defaultValues: FormType = {
	name: ''
};

/**
 * Form Validation Schema
 */
const schema = z.object({
	name: z.string().nonempty('Name is required')
});

function AccountTab() {
	const [profileImage, setProfileImage] = useState('assets/images/avatars/male-04.jpg');

	const { control, reset, handleSubmit, formState, setValue } = useForm<FormType>({
		defaultValues,
		mode: 'all',
		resolver: zodResolver(schema)
	});

	const { isValid, dirtyFields, errors } = formState;

	useEffect(() => {
		const setDefaultEmail = async () => {
			try {
				const email = await fetchDefaultEmail();
				setValue('email', email); // Set email value but don't mark it as dirty
			} catch (error) {
				console.error('Error setting default email:', error);
			}
		};
		setDefaultEmail();
	}, [setValue]);

	/**
	 * Form Submit
	 */
	function onSubmit(formData: FormType) {}

	/**
	 * Handle Reset
	 */
	function handleReset() {
		reset(
			{
				...defaultValues,
				email: undefined // Prevent email field from resetting to default
			},
			{
				keepValues: true // Keep the existing value of email
			}
		);
	}

	return (
		<div className="w-full max-w-3xl">
			<form onSubmit={handleSubmit(onSubmit)}>
				<AccountProfile
					profileImage={profileImage}
					setProfileImage={setProfileImage}
					uploadImageToS3={(file: File) => Promise.resolve()} // Replace with actual S3 logic
				/>

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
									disabled // Disable email field
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
						onClick={handleReset} // Custom reset logic
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
