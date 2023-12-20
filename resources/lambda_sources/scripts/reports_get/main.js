const dynamo = require('./dynamo');
const response = require('./responses');

exports.handler = function (event, context, callback) {
	//const groupId = event['groupId'];
	const groupId = event['queryStringParameters']['groupId'];
	if (!groupId) {
		callback(null, response.badRequest('Missing groupId (should be username)'));
		return;
	}

	dynamo
		.getAllGroupReports(groupId)
		.then(res => {
			console.log('Ok', res);
			callback(null, response.ok(res));
		})
		.catch(err => {
			console.log('Err', err);
			callback(null, response.serverError(err));
		});
};
