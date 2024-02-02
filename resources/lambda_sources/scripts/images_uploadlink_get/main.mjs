import * as dynamo from '/opt/nodejs/dynamo.js';
import * as response from '/opt/nodejs/responses.js';
import * as request from '/opt/nodejs/requests.js';
import * as s3 from '/opt/nodejs/s3.mjs';

/**
 * GET Request:
 * - Path: /images/uploadLink
 * - QueryParams: {
 *
 * 		mimeType: string|null, // The MIME type of the image that will be uploaded
 * }
 * @param {*} event
 * @param {*} context
 */
export const handler = async (event, context) => {
	const expirationSecs = 3600;

	const mimeType =
		request.getQueryParams(event)['mimeType'] ?? 'application/octet-stream';

	const imageId = await dynamo.uploadImage();
	if (imageId === null) {
		return response.serverError('Error uploading image');
	}

	const uploadUrl = await s3.createUploadPresignedUrl(imageId, expirationSecs);
	if (uploadUrl === null) {
		return response.serverError('Error creating URL');
	}

	return response.ok({
		url: uploadUrl,
		imageId: imageId,
		expiresInSeconds: expirationSecs,
	});
};
