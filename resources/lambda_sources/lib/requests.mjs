export const getBody = request => {
	const body = request['isBase64Encoded']
		? atob(request['body'])
		: request['body'];

	try {
		return JSON.parse(body);
	} catch (e) {
		console.error('Error while parsing body:', e);
	}
	return {};
};

export const getQueryParams = request => {
	return request['queryStringParameters'] ?? {};
};

export const getHeaders = request => {
	return request['headers'] ?? {};
};

export const getPathParams = request => {
	return request['pathParameters'] ?? {};
};

export const parseUserId = id => atob(id);

/**
 *
 * GET users								users_get
 * 		reuturns: collection<user>
 * POST users								users_post
 * 		body: {
 * 			email: string;
 * 			group: string|null; // The name of the group to add the user to
 * 		}
 * 		returns: user Id
 * 		GET users/{id}					 	users_id_get
 *			returns: user
 * GET groups								groups_get
 * 		returns: collection<group>
 * POST groups								groups_post
 * 		body: {
 * 			groupname: string // The name of the group to create
 * 		}
 * 		GET groups/{groupname}				groups_groupname_get
 * 			returns: collection<group>
 * 		POST groups/{groupname}/addMember	groups_groupname_addmember
 * 			body: {
 * 				email: string  // email of the user to add to this group
 * 			}
 * 		GET groups/{groupname}/reports		groups_groupname_reports_get
 * 			queryParams: {
 * 				email: string|null; // If present return only the reports related to that user
 * 			}
 * 			returns: collection<report>
 *
 * GET reports								reports_get
 * 		queryParams: {
 * 			groupname: string|null // If present, return just the reports from the selected group
 * 		}
 * 		returns: collection<report>
 * POST reports								reports_post
 * 		multipart-form-data: {
 * 			user: string,
 * 			message: string|null, // The message associated with this report
 * 			image: file|null, // The image associated with this report
 * 		}
 * 		returns: reportId
 * 		GET reports/{reportId}				reports_id_get
 *
 * GET images/{id}					images_uploadlink_get
 * 		returns: binary data (image)
 *
 * Resouces:
 * user: {
 * 		id: string; // The id to represent the user resource in the endpoints
 * 		email: string;
 * 		group: string|null; // group name
 * }
 *
 * group: {
 * 		name: string;
 * 		members: string[]; // emails
 * }
 *
 * report: {
 * 		id: string;
 * 		message: string|null;
 * 		imageId: string|null;
 * 		sentAt: string;
 * 		from: string; // email
 * 		group: string; // group name
 * }
 *
 * collection<T>: {
 * 		count: number;
 * 		data: T[];
 *      paginationKey: string|undefined; // If returned, you can use this key to get the next page of results by passing it as a query parameter to the same endpoint
 * }
 */
