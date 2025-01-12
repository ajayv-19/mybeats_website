import React, { useState, useRef, useEffect } from 'react';
import { Avatar, Dialog, DialogActions, DialogContent, Button } from '@mui/material';
import Cropper from 'react-easy-crop';
import { motion } from 'framer-motion';

interface AccountProfileProps {
	profileImage: string; // Initial S3 image URL
	setProfileImage: (image: string) => void;
	setImageFile: (file: File | null) => void;
}

interface Area {
	x: number;
	y: number;
	width: number;
	height: number;
}

function AccountProfile({ profileImage, setProfileImage, setImageFile }: AccountProfileProps) {
	const [imageSrc, setImageSrc] = useState<string | null>(null);
	const [crop, setCrop] = useState({ x: 0, y: 0 });
	const [zoom, setZoom] = useState(1);
	const [croppedArea, setCroppedArea] = useState<Area | null>(null);
	const [isCropDialogOpen, setIsCropDialogOpen] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);

	// Initialize the profile image from the S3 URL
	useEffect(() => {
		if (profileImage) {
			setImageSrc(profileImage); // Set the initial image from props
		}
	}, [profileImage]);

	// Handle image selection
	const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
		const file = event.target.files?.[0];

		if (file) {
			const reader = new FileReader();
			reader.onloadend = () => {
				if (typeof reader.result === 'string') {
					setImageSrc(reader.result); // Display selected image in cropper
					setIsCropDialogOpen(true); // Open crop dialog
				}
			};
			reader.readAsDataURL(file);
		}
	};

	// Handle cropped image
	const getCroppedImage = async (): Promise<void> => {
		try {
			if (!imageSrc || !croppedArea) return;

			const canvas = document.createElement('canvas');
			const image = new Image();
			image.src = imageSrc;
			await new Promise<void>((resolve) => {
				image.onload = () => resolve();
			});

			const { width, height, x, y } = croppedArea;
			canvas.width = width;
			canvas.height = height;

			const ctx = canvas.getContext('2d');
			ctx?.drawImage(image, x, y, width, height, 0, 0, width, height);

			canvas.toBlob(async (blob) => {
				if (blob) {
					const file = new File([blob], `cropped-image.jpg`, { type: 'image/jpeg' });
					const croppedImageURL = URL.createObjectURL(file);

					setProfileImage(croppedImageURL); // Update the displayed avatar
					setImageFile(file); // Store the cropped file for upload
					setIsCropDialogOpen(false); // Close crop dialog
				}
			}, 'image/jpeg');
		} catch (error) {
			console.error('Error cropping image:', error);
		}
	};

	return (
		<div className="flex flex-col md:flex-row items-center gap-6 mb-8 p-6 justify-center rounded-lg relative">
			<motion.div
				initial={{ scale: 0 }}
				animate={{ scale: 1, transition: { delay: 0.1 } }}
			>
				<Avatar
					sx={{ borderColor: 'background.paper' }}
					className="w-128 h-128 border-4 cursor-pointer"
					src={profileImage || undefined} // Show the S3 image or default avatar
					alt="User avatar"
					onClick={() => fileInputRef.current?.click()} // Trigger file upload
				/>
			</motion.div>
			<input
				type="file"
				ref={fileInputRef}
				onChange={handleImageChange}
				accept="image/*"
				className="hidden"
				aria-label="Upload profile picture"
			/>
			{isCropDialogOpen && (
				<Dialog
					open={isCropDialogOpen}
					onClose={() => setIsCropDialogOpen(false)}
					maxWidth="lg"
					fullWidth
				>
					<DialogContent
						sx={{
							display: 'flex',
							justifyContent: 'center',
							alignItems: 'center',
							height: '80vh',
							padding: 0
						}}
					>
						<div
							style={{
								position: 'relative',
								width: '100%',
								height: '100%'
							}}
						>
							<Cropper
								image={imageSrc} // Use the selected image for cropping
								crop={crop}
								zoom={zoom}
								aspect={1}
								onCropChange={setCrop}
								onZoomChange={setZoom}
								onCropComplete={(croppedArea, croppedAreaPixels) => setCroppedArea(croppedAreaPixels)}
							/>
						</div>
					</DialogContent>
					<DialogActions>
						<Button onClick={() => setIsCropDialogOpen(false)}>Cancel</Button>
						<Button
							onClick={getCroppedImage}
							variant="contained"
							color="primary"
						>
							Save
						</Button>
					</DialogActions>
				</Dialog>
			)}
		</div>
	);
}

export default AccountProfile;
