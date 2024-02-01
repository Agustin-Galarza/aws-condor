//import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb'; // ES Modules import
const {
	DynamoDBClient,
	PutItemCommand,
	GetItemCommand,
	ScanCommand,
	UpdateItemCommand,
	QueryCommand,
} = require('@aws-sdk/client-dynamodb'); // CommonJS import
const client = new DynamoDBClient({ region: 'us-east-1' });
const crypto = require('crypto');

const TABLE_NAME = 'condor-main';
const PK = 'PartitionKey';
const SK = 'SortKey';
const TYPE = 'Type';
const TYPE_INDEX_NAME = 'TypeIndex';

const NULL_STRING = 'null';

const _getStatusCode = dynamoRes =>
	Number(dynamoRes['$metadata']['httpStatusCode']);
const _getStringObj = str => ({
	S: str ?? NULL_STRING,
});
const _extractItem = queryResult => {
	if (queryResult['Item'] === undefined) {
		return null;
	}
	return queryResult['Item'];
};
const _extractCollection = queryResult => {
	const count = Number(queryResult['Count']);
	if (count === 0) {
		return { count, data: [] };
	}
	return { count, data: queryResult['Items'] };
};
const parseCollection = (queryResult, itemMapper) => {
	const { count, data } = _extractCollection(queryResult);
	return {
		count,
		data: data.map(itemMapper),
	};
};
const getStringKey = (obj, key) => {
	if (obj[key] == null) return null;
	const value = obj[key]['S'];
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
const getPartitionKey = obj => getStringKey(obj, PK);
const getSortKey = obj => getStringKey(obj, SK);

exports.getStringKey = getStringKey;
exports.getPartitionKey = getPartitionKey;
exports.getSortKey = getSortKey;

exports.putItem = async (key, sort, value) =>
	client
		.send(
			new PutItemCommand({
				TableName: TABLE_NAME,
				Item: {
					[PK]: { S: key },
					[SK]: { S: sort ?? NULL_STRING },
					Value: { S: value },
				},
			})
		)
		.catch(err => {
			console.error(err);
			throw err;
		});

exports.getItem = async (key, sort) =>
	client
		.send(
			new GetItemCommand({
				TableName: TABLE_NAME,
				Item: {
					[PK]: { S: key },
					[SK]: { S: sort ?? NULL_STRING },
				},
			})
		)
		.catch(err => {
			console.error(err);
			throw err;
		});

exports.searchRange = async (key, sortStart, sortEnd) =>
	client
		.send(
			new ScanCommand({
				TableName: TABLE_NAME,
				FilterExpression: `${PK} = :k AND :ss < ${SK} AND ${SK} < :se`,
				ExpressionAttributeValues: {
					':k': {
						S: key,
					},
					':ss': {
						S: sortStart,
					},
					':se': {
						S: sortEnd,
					},
				},
			})
		)
		.catch(err => {
			console.err(err);
			throw err;
		});

exports.queryItems = async (key, sortPrefix) => {
	const queryCommand = {
		TableName: TABLE_NAME,
		KeyConditionExpression: `${PK} = :k`,
		ExpressionAttributeValues: {
			':k': {
				S: key,
			},
		},
	};
	if (sortPrefix) {
		queryCommand['KeyConditionExpression'] += ` AND begins_with(${SK}, :sp)`;
		queryCommand['ExpressionAttributeValues'][':sp'] = { S: sortPrefix };
	}
	console.log(queryCommand);
	return client
		.send(new QueryCommand(queryCommand))
		.catch(err => console.error(err));
};

/**
 * user: {
 * 		username: string;
 * 		group: string; // group name
 * }
 */
const USER_TYPE = 'USER';
const userPK = username => 'USER#' + username;
const userSK = username => username;
const parseUser = dynamoRes =>
	dynamoRes
		? {
				username: getStringKey(dynamoRes, 'username'),
				group: getStringKey(dynamoRes, 'group'),
		  }
		: null;

exports.findUser = async username => {
	const res = await client.send(
		new GetItemCommand({
			TableName: TABLE_NAME,
			Key: {
				[PK]: strToDynamo(userPK(username)),
				[SK]: strToDynamo(userSK(username)),
			},
		})
	);
	return parseUser(_extractItem(res));
};

exports.addUser = async username => {
	const existingUser = await exports.findUser(username);
	if (existingUser !== null) {
		return { code: 409, message: 'User already exists.' };
	}

	const res = await client.send(
		new PutItemCommand({
			TableName: TABLE_NAME,
			Item: {
				[PK]: strToDynamo(userPK(username)),
				[SK]: strToDynamo(userSK(username)),
				[TYPE]: strToDynamo(USER_TYPE),
				username: strToDynamo(username),
				group: strToDynamo(null),
			},
		})
	);
	console.log('User PutItem response:', res);
	const code = _getStatusCode(res);
	if (code !== 200) {
		return { code, message: 'Error. User could not be created' };
	}
	return { message: `User ${username} created successfully` };
};

exports.getAllUsers = async () => {
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
};

/**
 * 	Group
 * 		id: groupId
 * 		data: {
 * 			"name": string;
 * 			"members": string[]
 * 		}
 */
const GROUP_TYPE = 'GROUP';
const groupPK = groupname => `GROUP#${groupname}`;
const groupSK = groupname => groupname;
const parseGroup = dynamoRes =>
	dynamoRes
		? {
				name: getStringKey(dynamoRes, 'name'),
				members: getStrListKey(dynamoRes, 'members'),
		  }
		: null;

exports.createGroup = async groupName => {
	const existingGroup = await exports.findGroup(groupName);
	if (existingGroup !== null) {
		return { code: 409, message: 'Group already exists' };
	}

	const res = await client.send(
		new PutItemCommand({
			TableName: TABLE_NAME,
			Item: {
				[PK]: strToDynamo(groupPK(groupName)),
				[SK]: strToDynamo(groupSK(groupName)),
				[TYPE]: strToDynamo(GROUP_TYPE),
				name: strToDynamo(groupName),
				members: strListToDynamo([]),
			},
		})
	);
	console.log('Group PutItem response:', res);
	const code = _getStatusCode(res);
	if (code !== 200) {
		return { code, message: 'Error. Group could not be created.' };
	}
	return { message: `Group ${groupName} created successfully` };
};

exports.findGroup = async groupName => {
	const res = await client.send(
		new GetItemCommand({
			TableName: TABLE_NAME,
			Key: {
				[PK]: strToDynamo(groupPK(groupName)),
				[SK]: strToDynamo(groupSK(groupName)),
			},
		})
	);
	return parseGroup(_extractItem(res));
};

exports.addMember = async (groupname, username) => {
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
				':username': strListToDynamo([username]),
			},
		})
	);
	console.log('group UpdateItem response:', res);
	const groupCode = _getStatusCode(res);
	if (groupCode !== 200) {
		return { code: groupCode, message: 'There was an error updating group.' };
	}
	const userRes = await client.send(
		new UpdateItemCommand({
			TableName: TABLE_NAME,
			Key: {
				[PK]: strToDynamo(userPK(username)),
				[SK]: strToDynamo(userSK(username)),
			},
			UpdateExpression: 'SET #g = :groupname',
			ExpressionAttributeNames: {
				'#g': 'group',
			},
			ExpressionAttributeValues: {
				':groupname': strToDynamo(groupname),
			},
		})
	);
	console.log('user UpdateItem response:', userRes);
	const userCode = _getStatusCode(userRes);
	if (userCode !== 200) {
		return { code: userCode, message: 'There was an error updating the user.' };
	}
	return { message: `user ${username} added to ${groupname}` };
};

exports.getAllGroups = async () => {
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
	console.log('Get all groups response:', res);
	return parseCollection(res, parseGroup);
};

/**
 *  Report
 *      id: groupId, userId
 *      scan: sentAt
 *      data: {
 *          "imageUrl": S,
 * 			"message": S,
 * 			"sentAt": S,
 * 			"from": S, (username)
 *      }
 */
const REPORT_TYPE = 'REPORT';
const reportPK = id => 'REPORT#' + id;
const reportSK = (groupName = null, userName = null, sentAt = null) => {
	if (groupName == null) {
		return '';
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
				imageURL: getStringKey(dynamoRes, 'imageUrl'),
				sentAt: getStringKey(dynamoRes, 'sentAt'),
				from: getStringKey(dynamoRes, 'from'),
				group: getStringKey(dynamoRes, 'group'),
		  }
		: null;

exports.createReport = async (user, { message, imageUrl }) => {
	if (user?.group === null) {
		return { code: 400, message: 'User does not have a group.' };
	}
	const sentAt = new Date().toISOString();
	const reportId = crypto.randomUUID();
	const res = await client.send(
		new PutItemCommand({
			TableName: TABLE_NAME,
			Item: {
				[PK]: strToDynamo(reportPK(reportId)),
				[SK]: strToDynamo(reportSK(user.group, user.username, sentAt)),
				[TYPE]: strToDynamo(REPORT_TYPE),
				id: strToDynamo(reportId),
				imageUrl: strToDynamo(imageUrl),
				message: strToDynamo(message),
				sentAt: strToDynamo(sentAt),
				from: strToDynamo(user.username),
				group: strToDynamo(user.group),
			},
		})
	);
	console.log('Report PutItem response:', res);
	const code = _getStatusCode(res);
	if (code !== 200) {
		return { code, message: 'Error. Report could not be created.' };
	}
	return { message: 'Report created successfully with id ' + reportId };
};

exports.getReport = async reportId => {
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
	const reports = parseCollection(res, parseReport);
	if (reports == null || reports.data == null || reports.count == 0) {
		return { code: 404, message: 'Report not found' };
	}
	return reports.data[0];
};

exports.getReports = async (groupname, username, sentAt) => {
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
			reportSK(groupname, username, sentAt)
		);
	}

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
};

exports.getAllGroupReports = async groupname => {
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
};

exports.getAllReports = async () => {
	return await exports.getAllGroupReports(null);
};
