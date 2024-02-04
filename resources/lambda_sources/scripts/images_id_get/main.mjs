import * as dynamo from '/opt/nodejs/dynamo.mjs';
import * as response from '/opt/nodejs/responses.mjs';
import * as request from '/opt/nodejs/requests.mjs';
import * as s3 from '/opt/nodejs/s3.mjs';

/**
 * GET Request:
 * - Path: /images/{id}/downloadLink
 * - PathParameters: {
 * 		id: string,
 * }
 * @param {*} event
 * @param {*} context
 */
export const handler = async (event, context) => {
	const imageId = request.getPathParams(event)['id'];
	if (!imageId) {
		return response.badRequest('Missing image id');
	}

	const imageRecord = await dynamo.getImage(imageId);
	if (imageRecord === null) {
		return response.notFound('Image not found');
	}

	const expirationSecs = 3600;
	const imageBody = await s3.getObject(imageId);
	if (imageBody === null) {
		return response.serverError('Error getting image');
	}
	const streamedBody = await s3.getStreamResponse(imageBody);

	return {
		statusCode: 200,
		headers: {
			'Content-Type': imageRecord.mimeType ?? 'image/*',
			'Access-Control-Allow-Origin': '*',
		},
		body: streamedBody,
		isBase64Encoded: true,
	};
};
