const dynamo = require('./dynamo');
const response = require('./responses');

/**
 * GET Request:
 * @param {*} event
 * @param {*} context
 * @param {*} callback
 */
exports.handler = function (event, context, callback) {
	dynamo
		.getAllGroups()
		.then(res => {
			console.log('Ok', res);
			callback(null, response.ok(res));
		})
		.catch(err => {
			console.log('Err', err);
			callback(null, response.serverError('There was an error finding group.'));
		});
};
