import * as dynamo from '/opt/nodejs/dynamo.mjs';
import * as response from '/opt/nodejs/responses.js';
import * as request from '/opt/nodejs/requests.js';
import * as sns from '/opt/nodejs/sns.mjs';
import * as s3 from '/opt/nodejs/s3.mjs';

/**
 * POST Request:
 * - Body: {
 *
 * 		username: string,
 * 		message: string|null, // The message associated with this report
 * 		imageId: string|null, // The URL for the image associated with this report
 * }
 * @param {*} event
 * @param {*} context
 * @param {*} callback
 * @returns
 */
export const handler = async (event, context) => {
	const query = request.getBody(event);
	const username = query['username'];
	const message = query['message'];
	const imageId = query['imageId'];
	if (!username) {
		return response.badRequest('Missing userId');
	}

	try {
		const user = await dynamo.findUser(username);
		console.log('User', user);
		if (user === null) {
			return response.notFound('User not found');
		}
		if (user.group === null) {
			return response.badRequest('User does not belong to a group');
		}
		const group = await dynamo.findGroup(user.group);
		if (group === null) {
			console.error(`Group could not be found for request: ${user.group}`);
			return response.serverError('Group not found');
		}

		let imageUrl = null;
		if (imageId != null) {
			imageUrl = await s3.getSignedUrl(imageId);
			if (imageUrl === null) {
				console.error('Could not retrieve image from S3');
				return response.serverError('Error processing image');
			}
		}
		// Upload report
		const reportId = await dynamo.createReport(user, {
			message,
			imageId,
		});
		if (reportId === null) {
			console.error('Could not upload report to dynamo.');
			return response.serverError('Error creating report');
		}
		// Notify group
		let reportMessage = `New report from ${user.username}`;
		if (message != null) {
			reportMessage += `:\n${message}`;
		}
		const success = await sns.publish(group.topicArn, reportMessage, imageUrl);
		if (!success) {
			return response.serverError(
				'Error notifying group. Report was uploaded successfully. '
			);
		}

		return response.ok(reportId);
	} catch (err) {
		console.error('Error creating report', err);
		return response.serverError('Error creating report');
	}
};
