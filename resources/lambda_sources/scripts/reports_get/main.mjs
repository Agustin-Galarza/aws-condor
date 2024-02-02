import * as dynamo from '/opt/nodejs/dynamo.js';
import * as response from '/opt/nodejs/responses.js';
import * as request from '/opt/nodejs/requests.js';

/**
 * Request:
 * - queryParams: {
 *
 * 		groupname: string|null // If present, return just the reports from the selected group
 * }
 * @param {*} event
 * @param {*} context
 * @param {*} callback
 * @returns
 */
export const handler = async (event, context) => {
	const groupname = request.getQueryParams(event)['groupname'];
	try {
		const res =
			groupname != null
				? await dynamo.getAllGroupReports(groupname)
				: await dynamo.getAllReports();

		return response.ok(response.collectionDto(res, response.reportDto));
	} catch (err) {
		console.err('Error fetching reports', err);
		return response.serverError('Could not get reports');
	}
};
