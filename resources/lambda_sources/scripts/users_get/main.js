const dynamo = require('./dynamo');
const response = require('./responses');
const request = require('./requests');

/**
 * Request:
 * @param {*} event
 * @param {*} context
 * @param {*} callback
 * @returns
 */
exports.handler = function (event, context, callback) {
	dynamo
		.getAllUsers()
		.then(res => callback(null, response.ok(res)))
		.catch(err => callback(null, response.serverError(err)));
};
