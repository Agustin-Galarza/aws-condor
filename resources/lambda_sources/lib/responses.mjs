export const ok = body => ({
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

export const notFound = message => ({
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

export const badRequest = message => ({
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

export const serverError = message => ({
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

export const userDto = userObj => {
	if (userObj === null) {
		return null;
	}

	return {
		id: btoa(userObj.email),
		email: userObj.email,
		group: userObj.group,
	};
};

export const groupDto = groupObj => {
	if (groupObj === null) {
		return null;
	}

	return {
		name: groupObj.name,
		members: groupObj.members,
	};
};

export const reportDto = reportObj => reportObj;

export const collectionDto = (collection, dto) => {
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
		paginationKey: collection.paginationKey,
	};
};
