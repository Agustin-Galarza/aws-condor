import * as dynamo from '/opt/nodejs/dynamo.mjs';
import * as response from '/opt/nodejs/responses.mjs';
import * as request from '/opt/nodejs/requests.mjs';

/**
 * GET Request:
 * - queryParams: {
 *
 * 		paginationKey: string|null; // Key returned by the paginated response to get the results from the next page
 * }
 * @param {*} event
 * @param {*} context
 * @param {*} callback
 */
export const handler = async (event, context) => {
	const { paginationKey } = request.getQueryParams(event);
	try {
		const res = await dynamo.getGroups(paginationKey);
		return response.ok(response.collectionDto(res, response.groupDto));
	} catch (err) {
		console.log('Err', err);
		return response.serverError('There was an error finding group.');
	}
};
