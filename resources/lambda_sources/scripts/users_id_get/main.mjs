import * as dynamo from '/opt/nodejs/dynamo.mjs';
import * as response from '/opt/nodejs/responses.mjs';
import * as request from '/opt/nodejs/requests.mjs';

/**
 * GET Request:
 * - pathParam: {
 *
 * 		id: string;
 * }
 * @param {*} event
 * @param {*} context
 * @param {*} callback
 * @returns
 */
export const handler = async (event, context) => {
	const id = request.getPathParams(event)['id'];

	try {
		const res = await dynamo.findUser(request.parseUserId(id));
		if (res === null) return response.notFound('User not found');
		return response.ok(response.userDto(res));
	} catch (err) {
		console.log('Err', err);
		return response.serverError('There was an error finding user.');
	}
};
