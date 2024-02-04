import * as dynamo from '/opt/nodejs/dynamo.mjs';
import * as response from '/opt/nodejs/responses.mjs';
import * as request from '/opt/nodejs/requests.mjs';

/**
 * Request:
 * - queryParams: {
 *
 * 		groupname: string|null // If present, return just the reports from the selected group
 * 		paginationKey: string|null; // Key returned by the paginated response to get the results from the next page
 * }
 * @param {*} event
 * @param {*} context
 * @param {*} callback
 * @returns
 */
export const handler = async (event, context) => {
	const { groupname, paginationKey } = request.getQueryParams(event);
	try {
		const res = await dynamo.getReports(groupname, null, null, paginationKey);

		return response.ok(response.collectionDto(res, response.reportDto));
	} catch (err) {
		console.err('Error fetching reports', err);
		return response.serverError('Could not get reports');
	}
};
