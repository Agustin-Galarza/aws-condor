const dynamo = require('./dynamo');
const response = require('./responses');

exports.handler = function (event, context, callback) {
	const userId = JSON.parse(event['body'])['userId'];
	//const userId = event['userId']
	if (!userId) {
		callback(null, response.badRequest('Missing userId (should be username)'));
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
