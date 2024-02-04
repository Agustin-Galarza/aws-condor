import * as dynamo from '/opt/nodejs/dynamo.mjs';
import * as response from '/opt/nodejs/responses.mjs';
import * as request from '/opt/nodejs/requests.mjs';
import * as sns from '/opt/nodejs/sns.mjs';

/**
 * Request:
 * - body: {
 *
 *    groupname: string // The name of the group to create
 * }
 * @param {*} event
 * @param {*} context
 * @param {*} callback
 * @returns
 */
export const handler = async (event, context) => {
	const { groupname } = request.getBody(event);
	if (!groupname) {
		return response.badRequest('Missing group name');
	}
	if (!isValidSnsTopicName(groupname)) {
		return response.badRequest(
			'Invalid group name. Group names must be made up of only uppercase and lowercase ASCII letters, numbers, underscores, and hyphens, and must be between 1 and 256 characters long.'
		);
	}

	try {
		const topicArn = await sns.createTopic(groupname);
		if (topicArn === null) {
			console.error('Could not create topic', 'event:', event);
			return response.serverError('There was an error creating the group');
		}
		const res = await dynamo.createGroup(groupname, topicArn);
		return response.ok(res);
	} catch (err) {
		return response.serverError(err);
	}
};

function isValidSnsTopicName(topicName) {
	// Regular expression to match the valid character set and length
	const regex = /^[A-Za-z0-9_-]{1,256}$/;

	// Test the topicName against the regex
	return regex.test(topicName);
}
