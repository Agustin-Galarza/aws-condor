import * as dynamo from '/opt/nodejs/dynamo.mjs';
import * as response from '/opt/nodejs/responses.js';
import * as request from '/opt/nodejs/requests.js';
import * as sns from '/opt/nodejs/sns.js';

/**
 * Request:
 * - body: {
 *
 *    groupName: string // The name of the group to create
 * }
 * @param {*} event
 * @param {*} context
 * @param {*} callback
 * @returns
 */
export const handler = async (event, context) => {
	const groupName = request.getBody(event)['groupName'];
	if (!groupName) {
		return response.badRequest('Missing groupName');
	}

	try {
		const topicArn = await sns.createTopic(groupName);
		if (topicArn === null) {
			console.error('Could not create topic', 'event:', event);
			return response.serverError('There was an error creating the group');
		}
		const res = await dynamo.createGroup(groupName, topicArn);
		return response.ok(res);
	} catch (err) {
		return response.serverError(err);
	}
};
