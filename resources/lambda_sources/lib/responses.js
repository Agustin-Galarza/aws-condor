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

exports.userDto = userObj => {
	if (userObj === null) {
		return null;
	}

	return {
		username: userObj.username,
		email: userObj.email,
		group: userObj.group,
	};
};

exports.groupDto = groupObj => {
	if (groupObj === null) {
		return null;
	}

	return {
		name: groupObj.name,
		members: groupObj.members,
	};
};

exports.reportDto = reportObj => reportObj;

exports.collectionDto = (collection, dto) => {
	if (collection === null) {
		return null;
	}
	if (collection.count == undefined || collection.data == undefined) {
		console.error('Wrong format for collection', collection);
		return null;
	}

	return {
		count: collection.count,
		data: collection.data.map(dto),
	};
};
