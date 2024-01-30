const dynamo = require('./dynamo');
const response = require('./responses');
const request = require('./requests');

/**
 * POST Request:
 * - Body: {
 *
 * 		username: string,
 * 		message: string|null, // The message associated with this report
 * 		imageUrl: string|null, // The URL for the image associated with this report
 * }
 * @param {*} event
 * @param {*} context
 * @param {*} callback
 * @returns
 */
exports.handler = function (event, context, callback) {
	// const userId = event['userId'];
	const query = request.getBody(event);
	const userId = query['username'];
	const message = query['message'];
	const imageUrl = query['imageUrl'];
	if (!userId) {
		callback(null, response.badRequest('Missing userId'));
		return;
	}

	dynamo
		.findUser(userId)
		.then(resUser => {
			console.log('User response', res);
			if (resUser === null) {
				callback(null, response.notFound('User not found'));
				return;
			}
			// checkear la respuesta
			// subir la imagen al bucket
			const imageUrl = 'i am an url';

			const user = {
				id: dynamo.getPartitionKey(resUser),
				data: { groupId: dynamo.getStringKey(resUser, 'groupId') },
			};

			console.log('User built', user);
			dynamo
				.createReport(user, imageUrl)
				.then(res => {
					console.log('Report response', res);
					callback(null, response.ok(res));
				})
				.catch(err => {
					console.error('Error creating report', err);
					callback(null, response.serverError('Error creating report'));
				});
		})
		.catch(err => {
			console.error('Error fetching user', err);
			callback(null, response.serverError('Error fetching user'));
		});
};
