import * as dynamo from '/opt/nodejs/dynamo.mjs';
import * as response from '/opt/nodejs/responses.js';

/**
 * Request:
 * @param {*} event
 * @param {*} context
 * @param {*} callback
 * @returns
 */
export const handler = async (event, context) => {
	try {
		const res = await dynamo.getAllUsers();
		return response.ok(response.collectionDto(res, response.userDto));
	} catch (err) {
		console.error('Could not fetch users', err, 'event:', event);
		return response.serverError('There was an error finding users.');
	}
};
