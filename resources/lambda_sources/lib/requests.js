exports.getBody = request => {
	try {
		return JSON.parse(request['body']);
	} catch (e) {
		console.error('Error while parsing body:', e);
	}
	return {};
};

exports.getQueryParams = request => {
	return request['queryStringParameters'] ?? {};
};

exports.getHeaders = request => {
	return request['headers'] ?? {};
};

exports.getPathParams = request => {
	return request['pathParameters'] ?? {};
};

/**
 *
 * GET users								users_get
 * 		reuturns: collection<user>
 * POST users								users_post
 * 		body: {
 * 			username: string;
 * 			email: string;
 * 			group: string|null; // The name of the group to add the user to
 * 		}
 * 		GET users/{username}				users_username_get
 *			returns: user
 * GET groups								groups_get
 * 		returns: collection<group>
 * POST groups								groups_post
 * 		body: {
 * 			groupName: string // The name of the group to create
 * 		}
 * 		GET groups/{groupname}				groups_groupname_get
 * 			returns: collection<group>
 * 		POST groups/{groupname}/addMember	groups_groupname_addmember
 * 			body: {
 * 				username: string  // name of the username to add to this group
 * 			}
 * 		GET groups/{groupname}/reports		groups_groupname_reports_get
 * 			queryParams: {
 * 				username: string|null; // If present return only the reports related to that user
 * 			}
 * 			returns: collection<report>
 *
 * GET reports								reports_get
 * 		queryParams: {
 * 			groupname: string|null // If present, return just the reports from the selected group
 * 		}
 * 		returns: collection<report>
 * POST reports								reports_post
 * 		body: {
 * 			username: string,
 * 			message: string|null, // The message associated with this report
 * 			imageId: string|null, // The URL for the image associated with this report
 * 		}
 * 		GET reports/{reportId}				reports_id_get
 *
 * GET images/uploadLink					images_uploadlink_get
 * 		queryParams: {
 * 			mimeType: string|null, // The MIME type of the image that will be uploaded
 * 		}
 * 		returns: imageUploadLink
 * GET images/{imageId}/downloadLink		images_imageid_downloadlink_get
 *		returns: imageDownloadLink
 *
 * Resouces:
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
 * 		id: string;
 * 		message: string|null;
 * 		imageId: string|null;
 * 		sentAt: string;
 * 		from: string; // username
 * 		group: string; // group name
 * }
 *
 * imageUploadLink: {
 * 		url: string;
 * 		imageId: string;
 * 		expiresInSeconds: number;
 * }
 *
 * imageDownloadLink: {
 * 		url: string;
 * 		expiresInSeconds: number;
 * }
 *
 * collection<T>: {
 * 		count: number;
 * 		data: T[];
 * }
 */
