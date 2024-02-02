import * as dynamo from '/opt/nodejs/dynamo.js';
import * as response from '/opt/nodejs/responses.js';
import * as request from '/opt/nodejs/requests.js';
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

exports.handler = function (event, context, callback) {
	//const userId = event['username'];
	//const sentAt = event['sentAt'];
	const reportId = request.getPathParams(event)['reportId'];

	dynamo
		.getReport(reportId)
		.then(res => {
			console.log('Ok', res);
			callback(null, response.ok(res));
		})
		.catch(err => {
			console.log('Err', err);
			callback(null, response.serverError('There was an error finding group.'));
		});
};
