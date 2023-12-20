const AWS = require('aws-sdk');

const s3 = new AWS.S3();
// const s3Bucket = process.env.BUCKET_NAME;
const s3Bucket = 'reportes.dev.condor.com';

// main lambda handler method
exports.handler = async event => {
	// const payload = JSON.parse(event.body);
	// // upload image to get s3 URL
	// console.log('upload_image_to_s3 , bucket=' + s3Bucket);
	// const image = payload.content;
	// // check if we have a file name in the input
	// let fileName;
	// if ('fileName' in payload) {
	// 	fileName = payload.fileName;
	// } else {
	// 	// extract file extension from base64 content and create fileName
	// 	const fileExtension = extractFileExtension(image);
	// 	fileName = `${uuid.v1()}.${fileExtension}`;
	// }
	// // get the image data from input
	// const imageData = image.split(',')[1];
	// const fileContent = Buffer.from(imageData, 'base64');
	// await s3Upload(fileName, fileContent, {});
	// // image uploaded successfully, return presigned URL to download
	// const response = {
	// 	success: true,
	// 	s3_url: createPresignedUrl(s3Bucket, fileName),
	// };
	return {
		statusCode: 200,
		headers: {
			'Content-Type': 'application/json',
		},
		body: 'JSON.stringify(response)',
	};
};

// The response contains the presigned URL
function createPresignedUrl(bucketName, objectName, expiration = 3600) {
	// Generate a presigned URL for the S3 object
	return s3.getSignedUrl('getObject', {
		Bucket: bucketName,
		Key: objectName,
		Expires: expiration,
	});
}

// extract image extension from base64 encoded file data
// base64_encoded_file syntax as 'image/png;base64,<<imageData>>'
function extractFileExtension(base64EncodedFile) {
	if (base64EncodedFile.includes(';')) {
		const extension = base64EncodedFile.split(';')[0];
		return extension.split('/')[1];
	}
	// default to PNG if we are not able to extract extension or string is not base64 encoded
	return 'png';
}

// upload object to S3
async function s3Upload(s3Key, fileContent, metadata) {
	console.log(`saving_s3_file , bucket=${s3Bucket} , path=${s3Key}`);
	try {
		const response = await s3
			.upload({
				Bucket: s3Bucket,
				Key: s3Key,
				Body: fileContent,
				Metadata: metadata,
			})
			.promise();

		console.log('S3 Result', JSON.stringify(response, null, 2));
	} catch (error) {
		console.error(error);
		throw error;
	}
}
