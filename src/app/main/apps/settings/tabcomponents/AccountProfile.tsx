import React, { useState, useRef } from 'react';
import { Avatar, Dialog, DialogActions, DialogContent, Button } from '@mui/material';
import Cropper from 'react-easy-crop';
import { motion } from 'framer-motion';

interface AccountProfileProps {
	profileImage: string;
	setProfileImage: (image: string) => void;
	uploadImageToS3: (file: File) => Promise<void>;
}

interface Area {
	x: number;
	y: number;
	width: number;
	height: number;
}

function AccountProfile({ profileImage, setProfileImage, uploadImageToS3 }: AccountProfileProps) {
	const [imageSrc, setImageSrc] = useState<string | null>(null);
	const [crop, setCrop] = useState({ x: 0, y: 0 });
	const [zoom, setZoom] = useState(1);
	const [croppedArea, setCroppedArea] = useState<Area>(null);
	const [isCropDialogOpen, setIsCropDialogOpen] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);

	// Handle image selection
	const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
		const file = event.target.files?.[0];

		if (file) {
			const reader = new FileReader();
			reader.onloadend = () => {
				if (typeof reader.result === 'string') {
					setImageSrc(reader.result);
					setIsCropDialogOpen(true);
				}
			};
			reader.readAsDataURL(file);
		}
	};

	// Handle cropped image
	const getCroppedImage = async (): Promise<void> => {
		try {
			const canvas = document.createElement('canvas');
			const image = new Image();
			image.src = imageSrc!;
			await new Promise<void>((resolve) => {
				image.onload = () => resolve();
			});

			const { width, height } = croppedArea;
			canvas.width = width;
			canvas.height = height;

			const ctx = canvas.getContext('2d');
			ctx?.drawImage(
				image,
				croppedArea.x,
				croppedArea.y,
				croppedArea.width,
				croppedArea.height,
				0,
				0,
				width,
				height
			);

			canvas.toBlob(async (blob) => {
				if (blob) {
					const file = new File([blob], `cropped-image.jpg`, { type: 'image/jpeg' });
					setProfileImage(URL.createObjectURL(file));
					await uploadImageToS3(file);
					setIsCropDialogOpen(false);
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
					className="w-128 h-128 border-4"
					src={profileImage}
					alt="User avatar"
					onClick={() => fileInputRef.current?.click()}
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
					<DialogContent>
						<div style={{ width: '100%', height: '100%' }}>
							<Cropper
								image={imageSrc}
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
