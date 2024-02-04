import * as dynamo from '/opt/nodejs/dynamo.mjs';
import * as response from '/opt/nodejs/responses.mjs';
import * as request from '/opt/nodejs/requests.mjs';
/**
 * Request:
 * - pathParams: {
 *		reportId: string
 * }
 * @param {*} event
 * @param {*} context
 * @param {*} callback
 */
export const handler = async (event, context) => {
	const reportId = request.getPathParams(event)['reportId'];

	try {
		const res = await dynamo.getReport(reportId);
		return response.ok(response.reportDto(res));
	} catch (err) {
		console.error('There was an error finding report ' + reportId, err);
		return response.serverError('There was an error finding report.');
	}
};
