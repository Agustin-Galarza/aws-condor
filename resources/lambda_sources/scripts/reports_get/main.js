const dynamo = require('./dynamo');
const response = require('./responses');
const request = require('./requests');

/**
 * Request:
 * - queryParams: {
 *
 * 		groupId: string|null // If present, return just the reports from the selected group
 * }
 * @param {*} event
 * @param {*} context
 * @param {*} callback
 * @returns
 */
exports.handler = function (event, context, callback) {
	//const groupId = event['groupId'];
	const groupId = request.getQueryParams(event)['groupId'];
	if (!groupId) {
		dynamo
			.getAllReports()
			.then(res => {
				console.log('Ok', res);
				callback(null, response.ok(res));
			})
			.catch(err => {
				console.log('Err', err);
				callback(null, response.serverError(err));
			});
		return;
	}
	dynamo
		.getAllGroupReports(groupId)
		.then(res => {
			console.log('Ok', res);
			callback(null, response.ok(res));
		})
		.catch(err => {
			console.log('Err', err);
			callback(null, response.serverError(err));
		});
};
