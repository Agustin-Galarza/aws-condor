const dynamo = require('./dynamo');
const response = require('./responses');
const request = require('./requests');

/**
 * Request:
 * - body: {
 *
 *    groupName: string // The name of the group to create
 * }
 * @param {*} event
 * @param {*} context
 * @param {*} callback
 * @returns
 */
exports.handler = function (event, context, callback) {
	const groupName = request.getBody(event)['groupName'];
	//const userId = event['userId']
	if (!groupName) {
		callback(null, response.badRequest('Missing groupName'));
		return;
	}

	dynamo
		.createGroup(groupName)
		.then(res => {
			callback(null, response.ok(res));
		})
		.catch(err => {
			callback(null, response.serverError(err));
		});
};
