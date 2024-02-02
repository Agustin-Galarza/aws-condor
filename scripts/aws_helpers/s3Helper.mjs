import {
	GetObjectCommand,
	S3Client,
	ListBucketsCommand,
	PutObjectCommand,
	HeadObjectCommand,
	NotFound,
} from '@aws-sdk/client-s3';
import {
	getSignedUrl,
	S3RequestPresigner,
} from '@aws-sdk/s3-request-presigner';
import fs from 'fs';
import axios from 'axios';
import path from 'path';
const REGION = 'us-east-1';

const client = new S3Client({ region: REGION });

export const createDownloadPresignedUrl = async (
	objKey,
	expirationSecs = 3600
) => {
	const command = new GetObjectCommand({ Bucket: BUCKET, Key: objKey });
	return getSignedUrl(client, command, { expiresIn: expirationSecs });
};

export const createUploadPresignedUrl = async (
	objKey,
	expirationSecs = 3600
) => {
	const command = new PutObjectCommand({ Bucket: BUCKET, Key: objKey });
	return getSignedUrl(client, command, { expiresIn: expirationSecs });
};

export const listBuckets = async () => {
	const res = await client.send(new ListBucketsCommand({}));
	return res.Buckets.map(b => b.Name);
};

const getBucketName = async () => {
	const buckets = await listBuckets();
	return buckets.filter(b => b.startsWith('files-'))[0];
};

export const objectExists = async objKey => {
	try {
		await client.send(
			new HeadObjectCommand({
				Bucket: BUCKET,
				Key: objKey,
			})
		);
		return true;
	} catch (e) {
		if (e instanceof NotFound) {
			return false;
		}
		console.error('Unexpected error: ', e);
		return null;
	}
};

/**************************
 * UTILS
 ************************/
async function isValidFilePath(filePath) {
	try {
		// Check if the file exists
		fs.accessSync(filePath, fs.constants.F_OK);
		// Check if the path points to a file (not a directory)
		const stat = fs.statSync(filePath);
		return stat.isFile();
	} catch (error) {
		console.error('Error checking file', error);
		return false;
	}
}

function extractFileName(filePath) {
	return path.basename(filePath);
}

const uploadToUrl = async (url, filepath) => {
	const file = fs.readFileSync(filepath);

	try {
		const response = await axios.put(url, file, {
			headers: {
				'Content-Type': 'application/octet-stream',
			},
		});
		console.log('File uploaded successfully');
	} catch (error) {
		console.error('Error uploading file', error);
	}
};

const uploadFile = async (filepath, uploadName = undefined) => {
	const valid = await isValidFilePath(filepath);
	if (!valid) {
		throw new Error('Invalid file path');
	}

	const filename =
		uploadName != undefined ? uploadName : extractFileName(filepath);
	const url = await createUploadPresignedUrl(filename);

	await uploadToUrl(url, filepath);
};

const downloadFromUrl = async (url, downloadPath) => {
	const response = await axios.get(url, {
		responseType: 'arraybuffer',
	});
	console.log(response);

	fs.writeFileSync(downloadPath, response.data);

	console.log('File downloaded successfully');
};

const downloadFile = async (objKey, downloadPath) => {
	const url = await createDownloadPresignedUrl(objKey);
	await downloadFromUrl(url, downloadPath);
};

// const BUCKET = await getBucketName();

// const exists = await objectExists('another.jpeg');

// console.log('Exists:', exists);
const res = downloadFromUrl(
	'https://files-20240202122834166700000002.s3.us-east-1.amazonaws.com/f9b87293-9540-43cf-b05f-1309529954d7?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=ASIA2UC3FFYNP2UAM5E4%2F20240202%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20240202T142940Z&X-Amz-Expires=3600&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEJf%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLWVhc3QtMSJIMEYCIQDS8AB5BxLPmEiRGpJc9wCwNE5pL20LEMP8NehYIWaewQIhANZ%2FB1PGxyJE002i5fhOi5PFGQIcoIWQk88ul8M9M4exKpMDCGAQABoMNzMwMzM1NjIwNjM0Igy7d9aeFKpTp4T%2Faxwq8AJpsseSiVk5ml6EQluTx0lD5HAkIWhbjRiOYIjBy0mEqaLF7GuERqzoL4enP2sgx85ufR0TDX3ltlwDYnogCg7bAJMlk%2FXjhl2dI3vn6EcrCzWJFWLi0cJ3FArAHLBlno%2Be7rGErubsya6aXy8roYu0715n3iudmYptNVZQkX%2BC4anJ5A2yt1LEs0HOQpaH%2FDDcOPhkD1LcBK%2F0bcLOipdKy%2BPB7GMdNcpjacf0P4hNVLhwsM0qdheu%2BxgejaATGU49khywISnIUnOj2PPv7EnxO5I73MxjWXaZA1Xhlv0BiCJ7KHJZQHi%2BxmkQHYSaoStGemJxe6uGVBk33iGFJuROBlt2khnoPGFLGw0Eec4TpUYFDERmHO7rGYjyxRPY1rPrtXjYaCDsvSk6wgjRbSF6yS3fyd16aM8vEvGLyh3vDmkRgtybetQ28sNyV6D0Kv8Mxw2fA1fVI0iiuLOq%2FVUR9jKHwr2fneuYCxJI%2BSaPuzDT%2BPOtBjqcASgaMuYFSzHyYiT8EbxNmOPBLlxUg7BeJH47dcPJXirH0yjKkTuXzq4VhZHr3boX7an1zoeD%2Fs%2Ff4bronJZtPR%2F9Kbr8aSl%2B30zMBMxX3Go%2Fzk39ndPRvmiOjbIXtOcBo0COXXsGp0OvffZnV5DE0R5cRe4mNIirYUlRyIxDMtWoLbhEVj6vRO29rYYPHaS6G%2FRfc1wQ%2Bra86dURyA%3D%3D&X-Amz-Signature=89a59f842c0911e6a5891f9138902626d05b21b887545b2d81f5f925bc19e75b&X-Amz-SignedHeaders=host&x-id=GetObject',
	'./report.png'
);

// downloadFile('helloworld.jpeg', './test.jpeg');
// uploadFile('/home/agustin/Pictures/random/image_46.jpeg', 'helloworld.jpeg');
// const url = await createUploadPresignedUrl('testfile.txt');
// console.log('Url:', url);
