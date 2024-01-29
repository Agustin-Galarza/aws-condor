const dynamo = require('./dynamo');
const response = require('./responses');
const request = require('./requests');

/**
 * GET Request
 * get all reports from a group
 * - pathParams: {
 *
 * 		groupname: string
 * }
 * @param {*} event
 * @param {*} context
 * @param {*} callback
 */
exports.handler = function (event, context, callback) {
	//const groupId = event['groupId'];
	const groupname = request.getPathParams(event)['groupname'];

	dynamo
		.getAllGroupReports(username)
		.then(reports => {
			console.log('Ok', res);
			callback(null, response.ok(res));
		})
		.catch(err => {
			console.error('There was an error getting group reports.', err);
			callback(
				null,
				response.serverError('There was an error getting group reports.')
			);
		});
};
