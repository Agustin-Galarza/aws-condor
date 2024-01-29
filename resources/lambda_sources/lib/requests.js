exports.getBody = request => {
	try {
		return JSON.parse(request['body']);
	} catch (e) {
		console.error('Error while parsing body:', e);
	}
	return {};
};

exports.getQueryParams = request => {
	return request['queryStringParameters'];
};

exports.getHeaders = request => {
	return request['headers'];
};

exports.getPathParams = request => {
	return request['pathParameters'];
};

/**
 *
 * GET users								users_get
 * POST users								users_post
 * 		GET users/{username}				users_username_get
 *
 * GET groups								groups_get
 * POST groups								groups_post
 * 		GET groups/{groupname}				groups_groupname_get
 * 		POST groups/{groupname}/addMember	groups_groupname_addmember
 * 		GET groups/{groupname}/reports		groups_groupname_reports_get
 *
 * GET reports								reports_get
 * POST reports								reports_post
 *
 * user: {
 * 		username: string;
 * 		group: string; // group name
 * }
 *
 * group: {
 * 		name: string;
 * 		members: string[]; // usernames
 * }
 *
 * report: {
 * 		message: string|'null';
 * 		imageURL: string|'null';
 * 		sentAt: string;
 * 		from: string; // username
 * }
 */
