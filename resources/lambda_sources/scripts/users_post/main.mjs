import * as dynamo from '/opt/nodejs/dynamo.js';
import * as response from '/opt/nodejs/responses.js';
import * as request from '/opt/nodejs/requests.js';
import * as sns from '/opt/nodejs/sns.mjs';

/**
 * Request:
 * - body: {
 *
 * 		username: string;
 * 		email: string;
 * 		group: string|null; // The name of the group to add the user to
 * }
 * @param {*} event
 * @param {*} context
 * @param {*} callback
 * @returns
 */
export const handler = async (event, context) => {
	const { username, email, group: groupname } = request.getBody(event);
	if (!username) {
		return response.badRequest('Missing username');
	}
	if (!email) {
		return response.badRequest('Missing email');
	}

	try {
		const res = await dynamo.addUser(username, email);
		if (res.code != 200) {
			return response.serverError(res);
		}

		if (groupname != null) {
			const group = await dynamo.findGroup(groupname);
			if (group === null) {
				console.error('Group not found', groupname);
				return response.ok(
					'User created. There was an error adding user to group.'
				);
			}
			const subscriptionArn = await sns.subscribe(group.topicArn, email);
			if (subscriptionArn === null) {
				console.error(
					'Error while subscribing user to group',
					username,
					groupname
				);
				return response.serverError('There was an error adding user.');
			}
			await dynamo.addMember(groupname, username, subscriptionArn);
		}

		return response.ok(res);
	} catch (err) {
		return response.serverError(err);
	}
};
