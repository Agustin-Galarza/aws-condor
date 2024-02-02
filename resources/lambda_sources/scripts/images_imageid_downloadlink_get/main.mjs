import * as dynamo from '/opt/nodejs/dynamo.js';
import * as response from '/opt/nodejs/responses.js';
import * as request from '/opt/nodejs/requests.js';
import * as sns from '/opt/nodejs/sns.mjs';
import * as s3 from '/opt/nodejs/s3.mjs';

/**
 * GET Request:
 * - Path: /images/{imageId}/downloadLink
 * - PathParameters: {
 * 		imageId: string,
 * }
 * @param {*} event
 * @param {*} context
 */
export const handler = async (event, context) => {
	const imageId = request.getPathParams(event)['imageId'];
	if (!imageId) {
		return response.badRequest('Missing imageId');
	}

	const imageRecord = await dynamo.getImage(imageId);
	if (imageRecord === null) {
		return response.notFound('Image not found');
	}

	const expirationSecs = 3600;
	const downloadUrl = await s3.createDownloadPresignedUrl(
		imageId,
		expirationSecs
	);
	if (downloadUrl === null) {
		return response.serverError('Error creating URL');
	}

	return response.ok({
		url: downloadUrl,
		expiresInSeconds: expirationSecs,
	});
};
