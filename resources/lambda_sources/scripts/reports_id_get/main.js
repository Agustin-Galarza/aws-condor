const dynamo = require('./dynamo');
const response = require('./responses');
const request = require('./requests');

/**
 * Request:
 * - pathParams: {
 *		reportId: string
 * }
 * @param {*} event
 * @param {*} context
 * @param {*} callback
 */
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
