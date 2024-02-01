const dynamo = require('./dynamo');
const response = require('./responses');
const request = require('./requests');

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
exports.handler = function (event, context, callback) {
	//const groupId = event['groupId'];
	const groupname = request.getQueryParams(event)['groupname'];
	if (!groupname) {
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
		.getAllGroupReports(groupname)
		.then(res => {
			console.log('Ok', res);
			callback(null, response.ok(res));
		})
		.catch(err => {
			console.log('Err', err);
			callback(null, response.serverError(err));
		});
};
