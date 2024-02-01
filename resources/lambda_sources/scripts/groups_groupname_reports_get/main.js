const dynamo = require('./dynamo');
const response = require('./responses');
const request = require('./requests');

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
exports.handler = function (event, context, callback) {
	//const groupId = event['groupId'];
	const groupname = request.getPathParams(event)['groupname'];
	const username = request.getQueryParams(event)['username'];

	dynamo
		.getReports(groupname, username)
		.then(reports => {
			console.log('Ok', reports);
			callback(null, response.ok(reports));
		})
		.catch(err => {
			console.error('There was an error getting group reports.', err);
			callback(
				null,
				response.serverError('There was an error getting group reports.')
			);
		});
};
