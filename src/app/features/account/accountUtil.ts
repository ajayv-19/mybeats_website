import { downloadData } from '@aws-amplify/storage';

// Utility to convert Blob to Base64
const convertBlobToBase64 = (blob: Blob): Promise<string> =>
	new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onerror = reject;
		reader.onload = () => {
			resolve(reader.result as string);
		};
		reader.readAsDataURL(blob);
	});

// Fetch Profile Image from S3
export const fetchProfileImageFromS3 = async (key: string): Promise<string | null> => {
	try {
		const downloadResult = await downloadData({ key }).result;
		const imageBlob = await downloadResult.body.blob();
		return await convertBlobToBase64(imageBlob);
	} catch (error) {
		console.error('Error fetching profile image:', error);
		return null;
	}
};