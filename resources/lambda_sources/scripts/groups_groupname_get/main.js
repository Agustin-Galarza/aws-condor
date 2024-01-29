const dynamo = require('./dynamo');
const response = require('./responses');
const request = require('./requests');

/**
 * Request
 * - queryParams: {
 *
 * 		groupId: string  // name of the group
 * }
 * @param {*} event
 * @param {*} context
 * @param {*} callback
 */
exports.handler = function (event, context, callback) {
	//const groupId = event['groupId'];
	const groupId = request.getQueryParams(event)['groupId'];

	dynamo
		.findGroup(groupId)
		.then(res => {
			console.log('Ok', res);
			callback(null, response.ok(res));
		})
		.catch(err => {
			console.log('Err', err);
			callback(null, response.serverError('There was an error finding group.'));
		});
};
