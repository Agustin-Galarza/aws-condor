const dynamo = require('./dynamo');
const response = require('./responses');
const request = require('./requests');

/**
 * GET Request:
 * - pathParam: {
 *
 * 		username: string;
 * }
 * @param {*} event
 * @param {*} context
 * @param {*} callback
 * @returns
 */
exports.handler = function (event, context, callback) {
	//const userId = event['username'];
	const userId = request.getPathParams(event)['username'];

	dynamo
		.findUser(userId)
		.then(res => {
			console.log('Ok', res);
			callback(null, response.ok(res));
		})
		.catch(err => {
			console.log('Err', err);
			callback(null, response.serverError('There was an error finding group.'));
		});
};
