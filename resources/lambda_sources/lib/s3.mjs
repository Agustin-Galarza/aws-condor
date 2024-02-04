import {
	GetObjectCommand,
	S3Client,
	ListBucketsCommand,
	PutObjectCommand,
	HeadObjectCommand,
	NotFound,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const REGION = 'us-east-1';
const client = new S3Client({ region: REGION });

export const createDownloadPresignedUrl = async (
	objKey,
	expirationSecs = 3600
) => {
	const command = new GetObjectCommand({ Bucket: BUCKET, Key: objKey });
	try {
		return getSignedUrl(client, command, { expiresIn: expirationSecs });
	} catch (e) {
		console.error('Error creating presigned URL:', e);
		return null;
	}
};

export const createUploadPresignedUrl = async (
	objKey,
	expirationSecs = 3600
) => {
	const command = new PutObjectCommand({ Bucket: BUCKET, Key: objKey });
	try {
		return getSignedUrl(client, command, { expiresIn: expirationSecs });
	} catch (e) {
		console.error('Error creating presigned URL:', e);
		return null;
	}
};

export const listBuckets = async () => {
	const res = await client.send(new ListBucketsCommand({}));
	return res.Buckets.map(b => b.Name);
};

export const putObject = async (filedata, objKey) => {
	const res = await client.send(
		new PutObjectCommand({
			Bucket: BUCKET,
			Key: objKey,
			Body: filedata,
		})
	);
	console.log('Response from PutObjectCommand: ', res);
	if (res.$metadata.httpStatusCode != 200) {
		console.error('Error uploading file');
		return false;
	}
	return true;
};

/**
 *
 * @param {string} objKey
 * @returns {StreamingBlobPayloadOutputTypes}
 */
export const getObject = async objKey => {
	const res = await client.send(
		new GetObjectCommand({
			Bucket: BUCKET,
			Key: objKey,
		})
	);
	if (res.$metadata.httpStatusCode == 400) {
		console.log(`File ${objKey} not found`);
		return null;
	}
	if (res.$metadata.httpStatusCode != 200) {
		console.error('Error downloading file');
		return null;
	}
	return res.Body;
};

/**
 * Converts an S3 object to a base64 string stream
 * @param {StreamingBlobPayloadOutputTypes} objBody
 * @returns {Promise<string>}
 */
export const getStreamResponse = async objBody => {
	return (
		await new Promise((resolve, reject) => {
			const chunks = [];
			objBody.on('data', chunk => chunks.push(chunk));
			objBody.on('end', () => resolve(Buffer.concat(chunks)));
			objBody.on('error', reject);
		})
	).toString('base64');
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

const getBucketName = async () => {
	const buckets = await listBuckets();
	return buckets.filter(b => b.startsWith('files-'))[0];
};

const BUCKET = await getBucketName();
