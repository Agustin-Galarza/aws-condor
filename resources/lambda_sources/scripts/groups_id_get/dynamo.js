//import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb'; // ES Modules import
const {
	DynamoDBClient,
	PutItemCommand,
	GetItemCommand,
	ScanCommand,
	QueryCommand,
} = require('@aws-sdk/client-dynamodb'); // CommonJS import
const client = new DynamoDBClient({ region: 'us-east-1' });

const TABLE_NAME = 'condor-main';
const PK = 'PartitionKey';
const SK = 'SortKey';

const NULL_STRING = 'null';

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

const tableUserId = userId => 'USER#' + userId;

exports.findUser = async userId =>
	client.send(
		new GetItemCommand({
			TableName: TABLE_NAME,
			Key: {
				[PK]: { S: tableUserId(userId) },
				[SK]: { S: NULL_STRING },
			},
		})
	);

exports.addUser = async user => {
	const res = await exports.findUser(user.id);
	if (res['Count'] > 0) {
		throw new Error('User already exists');
	}

	return await client.send(
		new PutItemCommand({
			TableName: TABLE_NAME,
			Item: {
				[PK]: { S: tableUserId(user.id) },
				[SK]: { S: NULL_STRING },
				groupId: { S: '12345' },
			},
		})
	);
};

// exports.getAllUsers = async () =>
// 	client.send(
// 		new ScanCommand({
// 			TableName: TABLE_NAME,
// 			KeyConditionExpression: '',
// 			ExclusiveStartKey: { NULL: true },

// 		})
// 	);

/**
 * 	Group
 * 		id: groupId
 * 		data: {
 * 			"members": string[]
 * 		}
 */
const tableGroup = groupId => `GROUP#${groupId}`;

exports.createGroup = async () => {
	client.send(
		new PutItemCommand({
			TableName: TABLE_NAME,
			Item: {
				[PK]: { S: tableGroup('') },
				[SK]: { S: NULL_STRING },
			},
		})
	);
};

exports.findGroup = async groupId =>
	client.send(
		new GetItemCommand({
			TableName: TABLE_NAME,
			Item: {
				[PK]: { S: tableGroup(groupId) },
				[SK]: { S: NULL_STRING },
			},
		})
	);

exports.getAllGroups = async () =>
	client.send(
		new QueryCommand({
			TableName: TABLE_NAME,
			KeyConditionExpression: `begins_with(${PK}, ${tableGroup('')})`,
		})
	);

/**
 *  Report
 *      id: groupId
 *      scan: userId, sentAt
 *      data: {
 *          "imageUrl": S
 *      }
 */
const tableReportId = groupId => 'REPORT#' + groupId;
const tableReportSk = userId => `${userId}#${Date.now()}`;

exports.createReport = async (user, imageUrl) => {
	if (user?.data?.groupId === null) {
		throw new Error('User does not have a group');
	}
	return client.send(
		new PutItemCommand({
			TableName: TABLE_NAME,
			Item: {
				[PK]: tableReportId(user.data.groupId),
				[SK]: tableReportSk(user.id),
				imageUrl: imageUrl,
			},
		})
	);
};

exports.getAllGroupReports = async groupId => {
	const cmd = {
		TableName: TABLE_NAME,
		KeyConditionExpression: `${PK} = :id`,
		ExpressionAttributeValues: {
			':id': { S: tableReportId(groupId) },
		},
	};
	return client.send(new QueryCommand(cmd));
};
