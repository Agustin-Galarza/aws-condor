exports.ok = body => ({
	statusCode: 200,
	isBase64Encoded: false,
	headers: {
		'Content-Type': 'application/json; charset=utf-8',
	},
	multiValueHeaders: {
		Header: ['Value'],
	},
	body: JSON.stringify(body),
});

exports.notFound = message => ({
	statusCode: 404,
	isBase64Encoded: false,
	headers: {
		'Content-Type': 'application/json; charset=utf-8',
	},
	multiValueHeaders: {
		Header: ['Value'],
	},
	body: JSON.stringify({ message }),
});

exports.badRequest = message => ({
	statusCode: 400,
	isBase64Encoded: false,
	headers: {
		'Content-Type': 'application/json; charset=utf-8',
	},
	multiValueHeaders: {
		Header: ['Value'],
	},
	body: JSON.stringify({ message }),
});

exports.serverError = message => ({
	statusCode: 500,
	isBase64Encoded: false,
	headers: {
		'Content-Type': 'application/json; charset=utf-8',
	},
	multiValueHeaders: {
		Header: ['Value'],
	},
	body: JSON.stringify({ message }),
});
