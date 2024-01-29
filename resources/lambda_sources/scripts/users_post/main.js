const dynamo = require('./dynamo');
const response = require('./responses');
const request = require('./requests');

/**
 * Request:
 * - body: {
 *
 * 		username: string
 * }
 * @param {*} event
 * @param {*} context
 * @param {*} callback
 * @returns
 */
exports.handler = function (event, context, callback) {
	const userId = request.getBody(event)['username'];
	//const userId = event['userId']
	if (!userId) {
		callback(null, response.badRequest('Missing username'));
		return;
	}

	dynamo
		.addUser({ id: userId })
		.then(res => {
			callback(null, response.ok(res));
		})
		.catch(err => {
			callback(null, response.serverError(err));
		});
};
