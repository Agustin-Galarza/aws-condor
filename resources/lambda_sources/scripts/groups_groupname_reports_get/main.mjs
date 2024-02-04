import * as dynamo from '/opt/nodejs/dynamo.mjs';
import * as response from '/opt/nodejs/responses.mjs';
import * as request from '/opt/nodejs/requests.mjs';

/**
 * GET Request
 * get all reports from a group
 * - pathParams: {
 *
 * 		groupname: string;
 * }
 * - queryParams: {
 *
 * 		email: string|null; // If present return only the reports related to that user
 * 		paginationKey: string|null; // Key returned by the paginated response to get the results from the next page
 * }
 * @param {*} event
 * @param {*} context
 * @param {*} callback
 */
export const handler = async (event, context) => {
	const { groupname } = request.getPathParams(event);
	const { email, paginationKey } = request.getQueryParams(event);

	try {
		const reports = await dynamo.getReports(
			groupname,
			email,
			null,
			paginationKey
		);
		return response.ok(response.collectionDto(reports, response.reportDto));
	} catch (err) {
		console.error('There was an error getting group reports.', err);
		return response.serverError('There was an error getting group reports.');
	}
};
