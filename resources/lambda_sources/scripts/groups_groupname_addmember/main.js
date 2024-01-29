const dynamo = require('./dynamo');
const response = require('./responses');
const request = require('./requests');

/**
 * POST Request
 * - body: {
 *
 * 		username: string  // name of the username to add to this group
 * }
 *
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
	const username = request.getBody(event)['username'];
	if (username == undefined) {
		callback(null, response.badRequest('username not provided.'));
		return;
	}
	dynamo
		.findUser(username)
		.then(user => {
			if (user === null) {
				callback(null, response.notFound('User not found'));
				return;
			}
			if (user.group != null) {
				callback(null, response.badRequest('User already has a group.'));
				return;
			}
			if (user.name === null) {
				console.error(
					'User does not have a name',
					'user:',
					user,
					'event:',
					event
				);
				callback(null, response.serverError('Server error.'));
				return;
			}
			dynamo
				.addMember(groupname, user.name)
				.then(res => {
					console.log('Ok', res);
					callback(null, response.ok(res));
				})
				.catch(err => {
					console.log('Err', err);
					callback(
						null,
						response.serverError('There was an error adding user.')
					);
				});
		})
		.catch(err => {
			console.error('There was an error fetching the user.', err);
			callback(
				null,
				response.serverError('There was an error fetching the user.')
			);
		});
};
