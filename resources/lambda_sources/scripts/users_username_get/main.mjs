import * as dynamo from '/opt/nodejs/dynamo.js';
import * as response from '/opt/nodejs/responses.js';
import * as request from '/opt/nodejs/requests.js';

/**
 * GET Request:
 * - pathParam: {
 *
 * 		username: string;
 * }
 * @param {*} event
 * @param {*} context
 * @param {*} callback
 * @returns
 */
export const handler = async (event, context) => {
	const username = request.getPathParams(event)['username'];

	try {
		const res = await dynamo.findUser(username);
		return response.ok(response.userDto(res));
	} catch (err) {
		console.log('Err', err);
		return response.serverError('There was an error finding user.');
	}
};
