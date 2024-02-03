/**
 * @template T
 * @typedef {Object} Collection<T>
 * @property {number} count - The number of items in the collection.
 * @property {T[]} data - The items in the collection.
 *
 * @typedef {Object} StatusResponse
 * @property {bool} success
 * @property {string|null} message - In case of failure, the message will contain the error message.
 */
import {
	DynamoDBClient,
	PutItemCommand,
	GetItemCommand,
	UpdateItemCommand,
	QueryCommand,
} from '@aws-sdk/client-dynamodb';
import crypto from 'crypto';

const client = new DynamoDBClient({ region: 'us-east-1' });

const TABLE_NAME = 'condor-main';
const PK = 'PartitionKey';
const SK = 'SortKey';
const TYPE = 'Type';
const TYPE_INDEX_NAME = 'TypeIndex';

const NULL_STRING = 'null';

const getStatusCode = dynamoRes =>
	Number(dynamoRes['$metadata']['httpStatusCode']);

const extractItem = queryResult => {
	if (queryResult['Item'] === undefined) {
		return null;
	}
	return queryResult['Item'];
};
/**
 * @template T
 * @param {{Count: string, Items: Record<string,T>}} queryResult
 * @returns {{count: number, data: T[]}}
 */
const extractCollection = queryResult => {
	const count = Number(queryResult['Count']);
	if (count === 0) {
		return { count, data: [] };
	}
	return { count, data: queryResult['Items'] };
};
/**
 * @template T
 * @param {{Count: string, Items: Record<string,A>}} queryResult
 * @param {(item: A) => T} itemMapper
 * @returns {Collection<T>}
 */
const parseCollection = (queryResult, itemMapper) => {
	const { count, data } = extractCollection(queryResult);
	return {
		count,
		data: data.map(itemMapper),
	};
};
/**
 *
 * @param {*} item The dynamoDB item object.
 * @param {string} key The attribute name to extract from the item.
 * @returns {string|null}
 */
export const getStringKey = (item, key) => {
	if (item[key] == null) return null;
	const value = item[key]['S'];
	return value == NULL_STRING ? null : value;
};
const getListKey = (obj, key, objMapper = null) => {
	if (obj[key] == null) {
		return null;
	}
	const objects = obj[key]['L'];
	if (objects == null) {
		return [];
	}
	if (objMapper == null) {
		return objects;
	}
	return objects.map(objMapper);
};
const getStrListKey = (obj, key) =>
	getListKey(obj, key, o => (o != null ? o['S'] : null));
const strToDynamo = str => ({ S: str ?? NULL_STRING });
const strListToDynamo = list => ({ L: list.map(strToDynamo) });
export const getPartitionKey = obj => getStringKey(obj, PK);
export const getSortKey = obj => getStringKey(obj, SK);

/**
 * User:
 * PK: USER#{email}
 * SK: {email}
 * data:
 * {
 * 		email: string;
 * 		group: string|'null'; // group name
 * 		subscriptionArn: string|'null';
 * }
 */
/**
 * @typedef {Object} User
 * @property {string} anonymousId - The user's anonymous identifier.
 * @property {string} email - The user's email address.
 * @property {string} group - The user's group designation.
 * @property {string} subscriptionArn - The Amazon Resource Name (ARN) for the user's subscription.
 */
const USER_TYPE = 'USER';
const userPK = email => 'USER#' + email;
const userSK = id => `${id}`;
/**
 * @param {Object|null} dynamoRes - The response object from a DynamoDB query or scan operation.
 * Can be null if the query did not return any results.
 * @returns {User|null} An object containing extracted user information or null if `dynamoRes` is null.
 */
const parseUser = dynamoRes =>
	dynamoRes
		? {
				anonymousId: getStringKey(dynamoRes, 'anonymousId'),
				email: getStringKey(dynamoRes, 'email'),
				group: getStringKey(dynamoRes, 'group'),
				subscriptionArn: getStringKey(dynamoRes, 'subscriptionArn'),
		  }
		: null;
/**
 *
 * @param {string} email
 * @returns {Promise<User|null>}
 */
export const findUser = async email => {
	try {
		const res = await client.send(
			new GetItemCommand({
				TableName: TABLE_NAME,
				Key: {
					[PK]: strToDynamo(userPK(email)),
					[SK]: strToDynamo(userSK(email)),
				},
			})
		);
		return parseUser(extractItem(res));
	} catch (err) {
		console.error('Error finding user', err);
		return null;
	}
};

/**
 *
 * @param {string} email
 * @param {string|null} subscriptionArn
 * @returns {Promise<bool>}
 */
export const addUser = async (email, subscriptionArn = null) => {
	const existingUser = await findUser(email);
	if (existingUser !== null) {
		return { code: 409, message: 'User already exists.' };
	}

	const res = await client.send(
		new PutItemCommand({
			TableName: TABLE_NAME,
			Item: {
				[PK]: strToDynamo(userPK(email)),
				[SK]: strToDynamo(userSK(email)),
				[TYPE]: strToDynamo(USER_TYPE),
				email: strToDynamo(email),
				group: strToDynamo(null),
				subscriptionArn: strToDynamo(subscriptionArn),
			},
		})
	);
	console.log('User PutItem response:', res);
	const code = getStatusCode(res);
	if (code !== 200) {
		console.error('Error. User could not be created', res);
		return false;
	}
	return true;
};

/**
 * @param {string} email
 * @param {{
 * 		group: string|null;
 * 		subscriptionArn: string|null;
 * }} userData
 * @returns {Promise<StatusResponse>} In case of failure, the message will contain the error message.
 */
export const updateUser = async (email, { group, subscriptionArn }) => {
	let updateExpression = 'SET';
	let needsAndOp = false;
	const expressionAttributeNames = {};
	const expressionAttributeValues = {};

	if (group !== undefined) {
		updateExpression += ' #group = :group';
		expressionAttributeNames['#group'] = 'group';
		expressionAttributeValues[':group'] = strToDynamo(group);
		needsAndOp = true;
	}
	if (subscriptionArn !== undefined) {
		if (needsAndOp) {
			updateExpression += ', ';
		}
		updateExpression += ' #subscriptionArn = :subscriptionArn';
		expressionAttributeNames['#subscriptionArn'] = 'subscriptionArn';
		expressionAttributeValues[':subscriptionArn'] =
			strToDynamo(subscriptionArn);
		needsAndOp = true;
	}

	if (updateExpression === 'SET') {
		return { success: false, message: 'Nothing to update' };
	}

	const res = await client.send(
		new UpdateItemCommand({
			TableName: TABLE_NAME,
			Key: {
				[PK]: strToDynamo(userPK(email)),
				[SK]: strToDynamo(userSK(email)),
			},
			UpdateExpression: updateExpression,
			ExpressionAttributeNames: expressionAttributeNames,
			ExpressionAttributeValues: expressionAttributeValues,
		})
	);
	console.log('UpdateItem response:', res);
	const code = getStatusCode(res);
	if (code !== 200) {
		return { success: false, message: 'Error. User could not be updated' };
	}
	return { success: true, message: null };
};

/**
 * @returns {Promise<Collection<User>|string>} In case of failure, an error message will be returned.
 */
export const getAllUsers = async () => {
	try {
		const res = await client.send(
			new QueryCommand({
				TableName: TABLE_NAME,
				IndexName: TYPE_INDEX_NAME,
				KeyConditionExpression: `#t = :type`,
				ExpressionAttributeNames: {
					'#t': TYPE,
				},
				ExpressionAttributeValues: {
					':type': strToDynamo(USER_TYPE),
				},
			})
		);
		return parseCollection(res, parseUser);
	} catch (err) {
		console.error('Could not fetch users', err);
		return 'There was an error finding users.';
	}
};

/**
 * 	Group
 * 		PK: GROUP#{groupname}
 * 		SK: {groupname}
 * 		data: {
 * 			"name": string;
 * 			"members": string[]
 * 			"topicArn": string
 * 		}
 */
const GROUP_TYPE = 'GROUP';
const groupPK = groupname => `GROUP#${groupname}`;
const groupSK = groupname => groupname;
/**
 *
 * @typedef {Object} Group
 * @property {string} name - The name of the group.
 * @property {string[]} members - The ids of the group members.
 * @property {string} topicArn - The Amazon Resource Name (ARN) for the group's topic.
 *
 * @param {*} dynamoRes
 * @returns {Group|null}
 */
const parseGroup = dynamoRes =>
	dynamoRes
		? {
				name: getStringKey(dynamoRes, 'name'),
				members: getStrListKey(dynamoRes, 'members'),
				topicArn: getStringKey(dynamoRes, 'topicArn'),
		  }
		: null;

/**
 *
 * @param {string} groupName
 * @param {string} topicArn
 * @returns {Promise<StatusResponse>}
 */
export const createGroup = async (groupName, topicArn) => {
	if (!groupName || !topicArn) {
		return { success: false, message: 'Group name and topicArn are required' };
	}

	const existingGroup = await exports.findGroup(groupName);
	if (existingGroup !== null) {
		return { success: false, message: 'Group already exists' };
	}
	if (topicArn == null) {
		console.error('topicArn is required but null was passed');
		return { success: false, message: 'Could not create group' };
	}

	try {
		const res = await client.send(
			new PutItemCommand({
				TableName: TABLE_NAME,
				Item: {
					[PK]: strToDynamo(groupPK(groupName)),
					[SK]: strToDynamo(groupSK(groupName)),
					[TYPE]: strToDynamo(GROUP_TYPE),
					name: strToDynamo(groupName),
					members: strListToDynamo([]),
					topicArn: strToDynamo(topicArn),
				},
			})
		);
		console.log('Group PutItem response:', res);
		const code = getStatusCode(res);
		if (code !== 200) {
			return { code, message: 'Error. Group could not be created.' };
		}
		return { success: true, message: null };
	} catch (err) {
		console.error('Error creating group', err);
		return { success: false, message: 'Error creating group' };
	}
};

/**
 * @param {string} groupName
 * @returns {Promise<Group|null>}
 */
export const findGroup = async groupName => {
	try {
		const res = await client.send(
			new GetItemCommand({
				TableName: TABLE_NAME,
				Key: {
					[PK]: strToDynamo(groupPK(groupName)),
					[SK]: strToDynamo(groupSK(groupName)),
				},
			})
		);
		const code = getStatusCode(res);
		if (code !== 200) {
			console.warn('Error finding group', res);
			return null;
		}
		return parseGroup(extractItem(res));
	} catch (err) {
		console.error('Error finding group', err);
		return null;
	}
};

/**
 *
 * @param {string} groupname
 * @param {string} email
 * @param {string} subscriptionArn
 * @returns {Promise<StatusResponse>}
 */
export const addMember = async (groupname, email, subscriptionArn) => {
	if (groupname === null || email === null || subscriptionArn === null) {
		return {
			success: false,
			message: 'Group name, email, and subscriptionArn are required',
		};
	}
	const oldUser = await findUser(email);
	if (oldUser === null) {
		return { success: false, message: 'User not found' };
	}
	if (oldUser.group !== null) {
		return { success: false, message: 'User is already in a group' };
	}

	try {
		const res = await client.send(
			new UpdateItemCommand({
				TableName: TABLE_NAME,
				Key: {
					[PK]: strToDynamo(groupPK(groupname)),
					[SK]: strToDynamo(groupSK(groupname)),
				},
				UpdateExpression: 'SET #m = list_append(#m, :username)',
				ExpressionAttributeNames: {
					'#m': 'members',
				},
				ExpressionAttributeValues: {
					':username': strListToDynamo([email]),
				},
			})
		);
		console.log('group UpdateItem response:', res);
		const groupCode = getStatusCode(res);
		if (groupCode !== 200) {
			console.warn('Error adding user to group', res);
			return { success: false, message: 'There was an error updating group.' };
		}
	} catch (err) {
		console.error('Error adding user to group', err);
	}
	try {
		const userRes = await client.send(
			new UpdateItemCommand({
				TableName: TABLE_NAME,
				Key: {
					[PK]: strToDynamo(userPK(email)),
					[SK]: strToDynamo(userSK(email)),
				},
				UpdateExpression: 'SET #g = :groupname, #t = :subscriptionArn',
				ExpressionAttributeNames: {
					'#g': 'group',
					'#t': 'subscriptionArn',
				},
				ExpressionAttributeValues: {
					':groupname': strToDynamo(groupname),
					':subscriptionArn': strToDynamo(subscriptionArn),
				},
			})
		);
		console.log('user UpdateItem response:', userRes);
		const userCode = getStatusCode(userRes);
		if (userCode !== 200) {
			return {
				success: false,
				message: 'There was an error updating the user.',
			};
		}
		return { success: true, message: null };
	} catch (err) {
		console.error('Error adding user to group', err);
		return {
			success: false,
			message: 'There was an error updating the user information.',
		};
	}
};

/**
 *
 * @param {string} groupname
 * @param {string} email
 * @returns {Promise<StatusResponse>}
 */
export const removeMember = async (groupname, email) => {
	const oldGroup = await findGroup(groupname);
	if (oldGroup === null) {
		return { success: false, message: 'Group not found' };
	}
	const oldUser = await findUser(email);
	if (oldUser === null) {
		return { success: false, message: 'User not found' };
	}
	if (oldUser.group !== groupname) {
		return { success: false, message: 'User is not a member of this group' };
	}

	const updatedMembers = oldGroup.members.filter(member => member !== email);
	try {
		const res = await client.send(
			new UpdateItemCommand({
				TableName: TABLE_NAME,
				Key: {
					[PK]: strToDynamo(groupPK(groupname)),
					[SK]: strToDynamo(groupSK(groupname)),
				},
				UpdateExpression: 'SET #m = :members',
				ExpressionAttributeNames: {
					'#m': 'members',
				},
				ExpressionAttributeValues: {
					':members': strListToDynamo(updatedMembers),
				},
			})
		);
		const statusCode = getStatusCode(res);
		if (statusCode !== 200) {
			console.error('Error removing user from group', res);
			return { success: false, message: 'Error removing user from group' };
		}
	} catch (err) {
		console.error('Error removing user from group', err);
		return { success: false, message: 'Error removing user from group' };
	}

	try {
		const userRes = await client.send(
			new UpdateItemCommand({
				TableName: TABLE_NAME,
				Key: {
					[PK]: strToDynamo(userPK(email)),
					[SK]: strToDynamo(userSK(email)),
				},
				UpdateExpression: 'SET #g = :null, #t = :null',
				ExpressionAttributeNames: {
					'#g': 'group',
					'#t': 'subscriptionArn',
				},
				ExpressionAttributeValues: {
					':null': strToDynamo(null),
				},
			})
		);

		const statusCode = getStatusCode(userRes);
		if (statusCode !== 200) {
			console.error('Error removing group reference in user', userRes);
			return { success: false, message: 'Error removing user from group' };
		}
	} catch (err) {
		console.error('Error removing group reference in user', err);
		return { success: false, message: 'Error removing user from group' };
	}
};

/**
 * @returns {Promise<Collection<Group>|null>}
 */
export const getAllGroups = async () => {
	try {
		const res = await client.send(
			new QueryCommand({
				TableName: TABLE_NAME,
				IndexName: TYPE_INDEX_NAME,
				KeyConditionExpression: `#t = :group`,
				ExpressionAttributeNames: {
					'#t': TYPE,
				},
				ExpressionAttributeValues: {
					':group': strToDynamo(GROUP_TYPE),
				},
			})
		);
		const code = getStatusCode(res);
		if (code !== 200) {
			console.error('Error fetching groups', res);
		}
		console.log('Get all groups response:', res);
		return parseCollection(res, parseGroup);
	} catch (err) {
		console.error('Error fetching groups', err);
		return null;
	}
};

/**
 *  Report
 *      PK: REPORT#{id}
 *		SK: {groupname}#{username}#{sentAt}
 *      data: {
 * 			"id": string,
 * 			"imageId": string|'null',
 * 			"message": string|'null',
 * 			"sentAt": string,
 * 			"from": string, (username)
 * 			"group": string	(groupname)
 *      }
 */
/**
 * @typedef {Object} Report
 * @property {string} id - The report's unique identifier.
 * @property {string|null} imageId - The unique identifier of the image associated with the report.
 * @property {string|null} message - The report's message.
 * @property {string} sentAt - The date and time the report was sent.
 * @property {string} from - The username of the user who sent the report.
 * @property {string} group - The name of the group to which the report was sent.
 */
const REPORT_TYPE = 'REPORT';
const reportPK = id => `REPORT#${id}`;
const reportSK = (groupName = null, userName = null, sentAt = null) => {
	if (groupName == null) {
		return NULL_STRING;
	}
	if (userName != null) {
		if (sentAt != null) {
			return `${groupName}#${userName}#${sentAt}`;
		}
		return `${groupName}#${userName}`;
	}
	return `${groupName}`;
};

const parseReport = dynamoRes =>
	dynamoRes
		? {
				id: getStringKey(dynamoRes, 'id'),
				message: getStringKey(dynamoRes, 'message'),
				imageId: getStringKey(dynamoRes, 'imageId'),
				sentAt: getStringKey(dynamoRes, 'sentAt'),
				from: getStringKey(dynamoRes, 'from'),
				group: getStringKey(dynamoRes, 'group'),
		  }
		: null;

/**
 *
 * @param {User} user
 * @param {*} param1
 * @returns {Promise<string|{success: false, message: string}>} In a successful operation, the generated report Id will be returned. In case of failure, success will be returned as false and an error message will be passed.
 */
export const createReport = async (user, { message, imageId }) => {
	if (user == null) {
		return { success: false, message: 'User is required' };
	}
	if (user.group === null) {
		return { success: false, message: 'User does not have a group.' };
	}
	const sentAt = new Date().toISOString();
	const reportId = crypto.randomUUID();
	try {
		const res = await client.send(
			new PutItemCommand({
				TableName: TABLE_NAME,
				Item: {
					[PK]: strToDynamo(reportPK(reportId)),
					[SK]: strToDynamo(reportSK(user.group, user.username, sentAt)),
					[TYPE]: strToDynamo(REPORT_TYPE),
					id: strToDynamo(reportId),
					imageId: strToDynamo(imageId),
					message: strToDynamo(message),
					sentAt: strToDynamo(sentAt),
					from: strToDynamo(user.username),
					group: strToDynamo(user.group),
				},
			})
		);
		console.log('Report PutItem response:', res);
		const code = getStatusCode(res);
		if (code !== 200) {
			console.warn('Error creating report', res);
			return { success: false, message: 'Error creating report' };
		}
		return reportId;
	} catch (err) {
		console.error('Error creating report', err);
		return { success: false, message: 'Error creating report' };
	}
};

/**
 *
 * @param {string} reportId
 * @returns {Promise<Report|null>}
 */
export const getReport = async reportId => {
	try {
		const res = await client.send(
			new QueryCommand({
				TableName: TABLE_NAME,
				KeyConditionExpression: `#pk = :pk`,
				ExpressionAttributeNames: {
					'#pk': PK,
				},
				ExpressionAttributeValues: {
					':pk': strToDynamo(reportPK(reportId)),
				},
			})
		);
		const statusCode = getStatusCode(res);
		if (statusCode !== 200) {
			console.error('Error getting report', res);
			return null;
		}
		const reports = parseCollection(res, parseReport);
		if (reports == null || reports.data == null || reports.count == 0) {
			console.log('No report found', res);
			return null;
		}
		return reports.data[0];
	} catch (err) {
		console.error('Error getting report', err);
		return null;
	}
};

/**
 *
 * @param {string|null} groupname
 * @param {string|null} email
 * @param {string|null} sentAt
 * @returns {Promise<Collection<Report>|null>}
 */
export const getReports = async (
	groupname = null,
	email = null,
	sentAt = null
) => {
	const keyExpression = `#t = :type`;
	const expressionAttributeNames = {
		'#t': TYPE,
	};
	const expressionAttributeValues = {
		':type': strToDynamo(REPORT_TYPE),
	};
	if (groupname != null) {
		keyExpression += ` and begins_with(#sk, :query)`;
		expressionAttributeNames['#sk'] = SK;
		expressionAttributeValues[':query'] = strToDynamo(
			reportSK(groupname, email, sentAt)
		);
	}

	try {
		const res = await client.send(
			new QueryCommand({
				TableName: TABLE_NAME,
				IndexName: TYPE_INDEX_NAME,
				KeyConditionExpression: keyExpression,
				ExpressionAttributeNames: expressionAttributeNames,
				ExpressionAttributeValues: expressionAttributeValues,
			})
		);
		return parseCollection(res, parseReport);
	} catch (err) {
		console.error('Error getting reports', err);
		return null;
	}
};

/**
 *
 * @param {string} groupname
 * @returns {Promise<Collection<Report>|null>}
 */
export const getAllGroupReports = async groupname => {
	try {
		const res = await client.send(
			new QueryCommand({
				TableName: TABLE_NAME,
				IndexName: TYPE_INDEX_NAME,
				KeyConditionExpression: `#t = :type and begins_with(#sk, :groupname)`,
				ExpressionAttributeNames: {
					'#sk': SK,
					'#t': TYPE,
				},
				ExpressionAttributeValues: {
					':type': strToDynamo(REPORT_TYPE),
					':groupname': strToDynamo(reportSK(groupname)),
				},
			})
		);
		console.log(`Get all reports for group ${groupname} response:`, res);
		return parseCollection(res, parseReport);
	} catch (err) {
		console.error('Error getting reports', err);
		return null;
	}
};

export const getAllReports = async () => {
	return await getReports();
};

/**
 *  Image
 *      PK: id
 *      SK: groupname, username
 *      data: {
 *          "id": string,
 * 			"mimeType": string,
 * 			"user": string,
 * 			"group": string
 *      }
 */
/**
 * @typedef {Object} Image
 * @property {string} id - The image's unique identifier.
 * @property {string} mimeType - The image's MIME type.
 * @property {string|null} user - The user who uploaded the image.
 * @property {string|null} group - The group to which the image belongs.
 */
const IMAGE_TYPE = 'IMAGE';
const imagePK = id => 'IMAGE#' + id;
const imageSK = (groupName = null, userName = null) => {
	if (groupName == null) {
		return NULL_STRING;
	}
	if (userName != null) {
		return `${groupName}#${userName}`;
	}
	return `${groupName}`;
};

const parseImage = dynamoRes =>
	dynamoRes
		? {
				id: getStringKey(dynamoRes, 'id'),
				mimeType: getStringKey(dynamoRes, 'mimeType'),
				user: getStringKey(dynamoRes, 'user'),
				group: getStringKey(dynamoRes, 'group'),
		  }
		: null;

/**
 * @param {string} userEmail
 * @param {string} groupName
 * @param {string} mimeType
 * @returns {Promise<string|null>} The unique identifier of the uploaded image or null if the operation failed.
 */
export const uploadImage = async (
	userEmail,
	groupName,
	mimeType = 'application/octet-stream'
) => {
	const id = crypto.randomUUID();
	try {
		const res = await client.send(
			new PutItemCommand({
				TableName: TABLE_NAME,
				Item: {
					[PK]: strToDynamo(imagePK(id)),
					[SK]: strToDynamo(imageSK(groupName, userEmail)),
					[TYPE]: strToDynamo(IMAGE_TYPE),
					id: strToDynamo(id),
					mimeType: strToDynamo(mimeType),
					user: strToDynamo(userEmail),
					group: strToDynamo(groupName),
				},
			})
		);
		console.log('Image PutItem response:', res);
		const code = getStatusCode(res);
		if (code !== 200) {
			console.error('Error uploading image', res);
			return null;
		}
		return id;
	} catch (err) {
		console.error('Error uploading image', err);
		return null;
	}
};

/**
 *
 * @param {string} imageId
 * @returns
 */
export const getImage = async imageId => {
	try {
		const res = await client.send(
			new QueryCommand({
				TableName: TABLE_NAME,
				KeyConditionExpression: `#pk = :pk`,
				ExpressionAttributeNames: {
					'#pk': PK,
				},
				ExpressionAttributeValues: {
					':pk': strToDynamo(imagePK(imageId)),
				},
			})
		);
		console.log('Get image response:', res);
		const code = getStatusCode(res);
		if (code !== 200) {
			return null;
		}
		const images = parseCollection(res, parseImage);
		if (images == null || images.data == null || images.count == 0) {
			return null;
		}
		return images.data[0];
	} catch (err) {
		console.error('Error getting image', err);
		return null;
	}
};

// /**
//  *
//  * @param {string} imageId
//  * @param {string} currentUser
//  * @param {*} currentGroup
//  * @param {*} param3
//  * @returns
//  */
// export const updateImage = async (
// 	imageId,
// 	currentUser,
// 	currentGroup,
// 	{ mimeType, username, groupname }
// ) => {
// 	let updateExpression = 'SET';
// 	let needsAndOp = false;
// 	const expressionAttributeNames = {};
// 	const expressionAttributeValues = {};
// 	if (mimeType !== undefined) {
// 		if (mimeType === null) {
// 			return { code: 400, message: 'Mime type cannot be null' };
// 		}
// 		updateExpression += ' #m = :mimeType';
// 		expressionAttributeNames['#m'] = 'mimeType';
// 		expressionAttributeValues[':mimeType'] = strToDynamo(mimeType);
// 		needsAndOp = true;
// 	}
// 	if (username !== undefined) {
// 		if (needsAndOp) {
// 			updateExpression += ', ';
// 		}
// 		updateExpression += ' #u = :username';
// 		expressionAttributeNames['#u'] = 'user';
// 		expressionAttributeValues[':username'] = strToDynamo(username);
// 		needsAndOp = true;
// 	}
// 	if (groupname !== undefined) {
// 		if (needsAndOp) {
// 			updateExpression += ', ';
// 		}
// 		updateExpression += ' #g = :groupname';
// 		expressionAttributeNames['#g'] = 'group';
// 		expressionAttributeValues[':groupname'] = strToDynamo(groupname);
// 		needsAndOp = true;
// 	}

// 	if (updateExpression === 'SET') {
// 		return { message: 'Nothing to update' };
// 	}

// 	const res = await client.send(
// 		new UpdateItemCommand({
// 			TableName: TABLE_NAME,
// 			Key: {
// 				[PK]: strToDynamo(imagePK(imageId)),
// 				[SK]: strToDynamo(imageSK(currentGroup, currentUser)),
// 			},
// 			UpdateExpression: updateExpression,
// 			ExpressionAttributeNames: expressionAttributeNames,
// 			ExpressionAttributeValues: expressionAttributeValues,
// 		})
// 	);
// 	console.log('UpdateItem response:', res);
// 	const code = getStatusCode(res);
// 	if (code !== 200) {
// 		return { code, message: 'Error. Image could not be updated' };
// 	}
// 	return { message: `Image ${imageId} updated successfully` };
// };
