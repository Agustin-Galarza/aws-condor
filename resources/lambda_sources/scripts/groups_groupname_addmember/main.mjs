import * as dynamo from '/opt/nodejs/dynamo.mjs';
import * as response from '/opt/nodejs/responses.mjs';
import * as request from '/opt/nodejs/requests.mjs';
import * as sns from '/opt/nodejs/sns.mjs';

/**
 * POST Request
 * - body: {
 *
 * 		email: string  // email of the user to add to this group
 * }
 *
 * - pathParams: {
 *
 * 		groupname: string
 * }
 * @param {*} event
 * @param {*} context
 * @param {*} callback
 */
export const handler = async (event, context) => {
	const { groupname } = request.getPathParams(event);
	const { email } = request.getBody(event);
	if (email == undefined) {
		return response.badRequest('email not provided.');
	}
	try {
		const group = await dynamo.findGroup(groupname);
		if (group === null) {
			return response.notFound('Group not found');
		}
		if (group.topicArn == null) {
			console.error('Group does not have a topicArn', group);
			return response.serverError('Cannot add members to this group.');
		}
		const user = await dynamo.findUser(email);
		if (user === null) {
			return response.notFound('User not found');
		}
		if (user.group != null) {
			return response.badRequest('User already has a group.');
		}
		if (user.email == null) {
			return response.serverError('User does not have a registered email');
		}

		console.log('Found:', 'user:', user, 'group:', group);

		const subscriptionArn = await sns.subscribe(group.topicArn, user.email);
		if (subscriptionArn === null) {
			console.error('Error while subscribing user to group', user, group);
			return response.serverError('There was an error adding user.');
		}

		const res = await dynamo.addMember(groupname, user.email, subscriptionArn);

		return response.ok(res);
	} catch (err) {
		console.error('Err', err);
		return response.serverError('There was an error adding user.');
	}
};
