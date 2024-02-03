import * as dynamo from '/opt/nodejs/dynamo.mjs';
import * as response from '/opt/nodejs/responses.js';
import * as request from '/opt/nodejs/requests.js';

/**
 * GET Request:
 * - pathParams: {
 *
 * 		groupname: string  // name of the group
 * }
 * @param {*} event
 * @param {*} context
 * @param {*} callback
 */
export const handler = async (event, context) => {
	const groupname = request.getPathParams(event)['groupname'];

	try {
		const res = await dynamo.findGroup(groupname);
		return response.ok(response.groupDto(res));
	} catch (err) {
		console.log('Err', err);
		return response.serverError('There was an error finding group.');
	}
};
