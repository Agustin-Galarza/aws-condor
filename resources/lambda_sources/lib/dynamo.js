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

const TABLE_NAME = 'condor-main';
const PK = 'PartitionKey';
const SK = 'SortKey';

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
	const value = obj[key]['S'];
	return value == NULL_STRING ? null : value;
};
const getListKey = (obj, key) => obj[key]['L'];
const strToDynamo = str => ({ S: str ?? NULL_STRING });
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
 * User:
 * 	id: username
 * 	data: {"groupId": S}
 */
const parseUser = dynamoRes =>
	dynamoRes
		? {
				id: getStringKey(dynamoRes, 'id'),
				groupId: getStringKey(dynamoRes, 'groupId'),
		  }
		: null;

const tableUserId = userId => 'USER#' + userId;

exports.findUser = async userId => {
	const res = await client.send(
		new GetItemCommand({
			TableName: TABLE_NAME,
			Key: {
				[PK]: { S: tableUserId(userId) },
				[SK]: { S: NULL_STRING },
			},
		})
	);
	return parseUser(_extractItem(res));
};

exports.addUser = async user => {
	const existingUser = await exports.findUser(user.id);
	if (existingUser !== null) {
		return { code: 409, message: 'User already exists.' };
	}

	const res = await client.send(
		new PutItemCommand({
			TableName: TABLE_NAME,
			Item: {
				[PK]: { S: tableUserId(user.id) },
				[SK]: { S: NULL_STRING },
				id: { S: user.id },
				groupId: { S: NULL_STRING },
			},
		})
	);
	console.log('User PutItem response:', res);
	const code = _getStatusCode(res);
	if (code !== 200) {
		return { code, message: 'Error. User could not be created' };
	}
	return { message: `User ${user.id} created successfully` };
};

exports.getAllUsers = async () => {
	const res = await client.send(
		new ScanCommand({
			TableName: TABLE_NAME,
			FilterExpression: `begins_with(${PK}, :id)`,
			ExpressionAttributeValues: { ':id': { S: tableUserId('') } },
		})
	);
	return parseCollection(res);
};

/**
 * 	Group
 * 		id: groupId
 * 		data: {
 * 			"name": string;
 * 			"members": string[]
 * 		}
 */
const parseGroup = dynamoRes =>
	dynamoRes
		? {
				name: getStringKey(dynamoRes, 'name'),
				members: getListKey(dynamoRes, 'members'),
		  }
		: null;

const tableGroup = groupId => `GROUP#${groupId}`;

exports.createGroup = async groupName => {
	const existingGroup = await exports.findGroup(groupName);
	if (existingGroup !== null) {
		return { code: 409, message: 'Group already exists' };
	}

	const res = await client.send(
		new PutItemCommand({
			TableName: TABLE_NAME,
			Item: {
				[PK]: { S: tableGroup(groupName) },
				[SK]: { S: NULL_STRING },
				name: { S: groupName },
				members: { L: [] },
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

exports.findGroup = async groupId => {
	const res = await client.send(
		new GetItemCommand({
			TableName: TABLE_NAME,
			Item: {
				[PK]: { S: tableGroup(groupId) },
				[SK]: { S: NULL_STRING },
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
				[PK]: strToDynamo(tableGroup(groupname)),
				[SK]: strToDynamo(null),
			},
			UpdateExpression: 'SET list_append(#m, :userId)',
			ExpressionAttributeNames: {
				'#m': 'members',
			},
			ExpressionAttributeValues: {
				':userId': username,
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
				[PK]: strToDynamo(tableUserId(username)),
				[SK]: strToDynamo(null),
			},
			UpdateExpression: 'SET #g = :groupname',
			ExpressionAttributeNames: {
				'#g': 'group',
				':groupname': groupname,
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
			KeyConditionExpression: `begins_with(${PK}, ${tableGroup('')})`,
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
const parseReport = dynamoRes =>
	dynamoRes
		? {
				message: getStringKey(dynamoRes, 'message'),
				imageURL: getStringKey(dynamoRes, 'imageUrl'),
				sentAt: getStringKey(dynamoRes, 'sentAt'),
				from: getStringKey(dynamoRes, 'from'),
		  }
		: null;

const tableReportId = (groupId, userId) => {
	if (userId === null) {
		return `REPORT#${groupId}`;
	}
	return `REPORT#${groupId}#${userId}`;
};
const tableReportSk = sentAt => `${sentAt}`;

exports.createReport = async (user, { message, imageUrl }) => {
	if (user?.data?.groupId === null) {
		return { code: 400, message: 'User does not have a group.' };
	}
	const sentAt = Date.now();
	const res = await client.send(
		new PutItemCommand({
			TableName: TABLE_NAME,
			Item: {
				[PK]: tableReportId(user.data.groupId, user.id),
				[SK]: tableReportSk(sentAt),
				imageUrl: strToDynamo(imageUrl),
				message: strToDynamo(message),
				sentAt: strToDynamo(sentAt),
				from: strToDynamo(user.id),
			},
		})
	);
	console.log('Report PutItem response:', res);
	const code = _getStatusCode(res);
	if (code !== 200) {
		return { code, message: 'Error. Report could not be created.' };
	}
	return { message: 'Report created successfully.' };
};

exports.getReport = async (user, sentAt) => {
	const keyExpression = `${PK} = :id`;
	const expressionAttributes = {
		':id': {
			S: tableReportId(user.groupId, user.id),
		},
	};
	if (sentAt != null) {
		keyExpression += ` and ${SK} = :sentAt`;
		expressionAttributes[':sentAt'] = {
			S: sentAt,
		};
	}
	const res = await client.send(
		new QueryCommand({
			TableName: TABLE_NAME,
			KeyConditionExpression: keyExpression,
			ExpressionAttributeValues: expressionAttributes,
		})
	);
	if (res['Count'] === 0 || res['Items'] == undefined) {
		return null;
	}
	if (res['Count'] > 1) {
		console.log('Multiple answers', res['Items']);
	}
	return parseReport(res['Items'][0]);
};

exports.getAllGroupReports = async groupId => {
	const cmd = {
		TableName: TABLE_NAME,
		KeyConditionExpression: `begins_with(${PK}, ${tableReportId(groupId, '')})`,
	};
	const res = await client.send(new QueryCommand(cmd));
	console.log(`Get all reports for group ${groupId} response:`, res);
	return parseCollection(res, parseReport);
};

exports.getAllReports = async () => {
	return await exports.getAllGroupReports('');
};
