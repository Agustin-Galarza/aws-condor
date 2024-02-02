import * as dynamo from '/opt/nodejs/dynamo.js';
import * as response from '/opt/nodejs/responses.js';

/**
 * GET Request:
 * @param {*} event
 * @param {*} context
 * @param {*} callback
 */
export const handler = async (event, context) => {
	try {
		const res = await dynamo.getAllGroups();
		return response.ok(response.collectionDto(res, response.groupDto));
	} catch (err) {
		console.log('Err', err);
		return response.serverError('There was an error finding group.');
	}
};
