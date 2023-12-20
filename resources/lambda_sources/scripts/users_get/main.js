const dynamo = require('./dynamo');
const response = require('./responses');

exports.handler = function (event, context, callback) {
	return [];
	dynamo
		.getAllUsers()
		.then(res => callback(null, response.ok(res)))
		.catch(err => callback(null, response.serverError(err)));
};
