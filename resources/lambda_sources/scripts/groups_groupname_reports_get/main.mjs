import * as dynamo from '/opt/nodejs/dynamo.mjs';
import * as response from '/opt/nodejs/responses.js';
import * as request from '/opt/nodejs/requests.js';

/**
 * GET Request
 * get all reports from a group
 * - pathParams: {
 *
 * 		groupname: string;
 * }
 * - queryParams: {
 *
 * 		username: string|null; // If present return only the reports related to that user
 * }
 * @param {*} event
 * @param {*} context
 * @param {*} callback
 */
export const handler = async (event, context) => {
	const groupname = request.getPathParams(event)['groupname'];
	const username = request.getQueryParams(event)['username'];

	try {
		const reports = await dynamo.getReports(groupname, username);
		return response.ok(response.collectionDto(reports, response.reportDto));
	} catch (err) {
		console.error('There was an error getting group reports.', err);
		return response.serverError('There was an error getting group reports.');
	}
};
