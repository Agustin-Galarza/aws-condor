const dynamo = require('./dynamo');
const response = require('./responses');
const request = require('./requests');

/**
 * Request:
 * - queryParams: {
 *
 * 		username: string,
 * 		sentAt: string,
 * }
 * @param {*} event
 * @param {*} context
 * @param {*} callback
 */
exports.handler = function (event, context, callback) {
	//const userId = event['username'];
	//const sentAt = event['sentAt'];
	const query = request.getQueryParams(event);
	const userId = query['username'];
	const sentAt = query['sentAt'];

	if (userId == undefined) {
		callback(null, response.badRequest('Username not provided'));
		return;
	}
	if (sentAt == undefined) {
		callback(null, response.badRequest('SentAt not provided'));
		return;
	}

	dynamo.findUser(userId).then(user => {
		if (user === null) {
			return { code: 404, message: 'User does not exist.' };
		}
		console.log('Found user:', user);
		dynamo
			.getReport(user, sentAt)
			.then(res => {
				console.log('Ok', res);
				callback(null, response.ok(res));
			})
			.catch(err => {
				console.log('Err', err);
				callback(
					null,
					response.serverError('There was an error finding group.')
				);
			});
	});
};
