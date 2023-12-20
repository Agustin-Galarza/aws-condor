const dynamo = require('./dynamo');
const response = require('./responses');

exports.handler = function (event, context, callback) {
	const userId = event['userId'];
	//const userId = JSON.parse(event['body'])['userId'];
	if (!userId) {
		callback(null, response.badRequest('Missing userId'));
		return;
	}

	dynamo
		.findUser(userId)
		.then(res => {
			console.log('User response', res);
			// checkear la respuesta
			// subir la imagen al bucket
			const imageUrl = 'i am an url';

			const userRaw = res['Item'];
			const user = {
				id: userRaw['PartitionKey']['S'],
				data: { groupId: userRaw['groupId']['S'] },
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
