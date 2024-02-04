/**
 * @typedef {import('./dynamoHelper.mjs').StatusResponse} StatusResponse
 */
import * as dynamo from './dynamoHelper.mjs';
import * as sns from './snsHelper.mjs';
import * as s3 from './s3Helper.mjs';
import fs from 'fs';
import { fileTypeFromBuffer } from 'file-type';
import chalk from 'chalk';
import axios from 'axios';
import { randomBytes } from 'crypto';

const GROUPS = ['La_Matanza', 'La_Plata', 'San_Isidro', 'Neuquen', 'Rosario'];

const USERS = [
	{ email: 'user1@example.com', group: GROUPS[0] },
	{ email: 'test.user@example.net', group: GROUPS[0] },
	{ email: 'sample123@example.org', group: GROUPS[2] },
	{ email: 'no-reply@example.com', group: GROUPS[3] },
	{ email: 'dev.test@example.net', group: GROUPS[4] },
];

const REPORTS = [
	{
		userData: USERS[0],
		message: 'This is a test report',
		imagePath: '/home/agustin/Pictures/random/image_1.jpeg',
	},
	{
		userData: USERS[1],
		message: 'We are testing the report creation endpoint',
		imagePath: '/home/agustin/Pictures/random/image_14.jpeg',
	},
	{
		userData: USERS[2],
		message: 'Please ignore this report',
		imagePath: '/home/agustin/Pictures/random/image_22.jpeg',
	},
];

const MAX_CITY_NAMES = 100;

const getCityNames = async () => {
	try {
		const res = await axios.postForm('https://randommer.io/random-address', {
			number: MAX_CITY_NAMES,
			culture: 'en_US',
		});

		return res.data
			.map(d => d.split(',')[3].trim())
			.map(name => name.replace(/[ \'']/g, '_'));
	} catch (err) {
		console.error(err.message);
		throw new Error();
	}
};
const cityNames = await getCityNames();

/*****************************************************
 * Generate Fake Data
 ******************************************************/
// Helper function to generate a random group name
function generateGroupName() {
	// const length = Math.floor(Math.random() * 256) + 1; // Ensure length is between 1 and 256
	// const chars =
	// 	'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-';
	// let result = '';
	// for (let i = 0; i < length; i++) {
	// 	result += chars.charAt(Math.floor(Math.random() * chars.length));
	// }
	// return result;
	return cityNames[Math.floor(Math.random() * MAX_CITY_NAMES)];
}

// Helper function to generate a random email
function generateRandomEmail() {
	const providers = ['example.com', 'test.net', 'sample.org'];
	const user = `user${Math.floor(Math.random() * 10000)}`;
	const provider = providers[Math.floor(Math.random() * providers.length)];
	return `${user}@${provider}`;
}

// Helper function to generate a random imagePath
function generateRandomImagePath() {
	return `/home/agustin/Pictures/random/image_${Math.floor(
		Math.random() * 40
	)}.jpeg`;
}

// Main function to create random data
function createRandomData({
	groupsAmount = 5,
	usersAmount = 10,
	reportsAmount = 5,
	randomImageGenerator: randomImagePathGenerator = generateRandomImagePath,
}) {
	const groups = new Array(groupsAmount)
		.fill(null)
		.map(() => generateGroupName());
	const users = new Array(usersAmount).fill(null).map(() => ({
		email: generateRandomEmail(),
		group: groups[Math.floor(Math.random() * groups.length)],
	}));
	const reports = new Array(reportsAmount).fill(null).map(() => ({
		userData: users[Math.floor(Math.random() * users.length)],
		message: `This is a message ${randomBytes(20).toString('hex')}`, // Using crypto for randomness
		imagePath: randomImagePathGenerator(),
	}));

	return { groups, users, reports };
}

/*****************************************************
 * Creation functions
 *****************************************************/
const createGroup = async groupname => {
	try {
		const topicArn = await sns.createTopic(groupname);
		if (topicArn === null) {
			console.error('Could not create topic');
			return;
		}
		console.log('Topic created', topicArn);
		const res = await dynamo.createGroup(groupname, topicArn);
		if (!res.success) {
			console.error(chalk.red(`Could not create group ${groupname}`));
			return;
		}
		console.log(chalk.gree(`Group ${groupname} created successfully.`));
		return;
	} catch (err) {
		return;
	}
};

const createUser = async ({ email, group }) => {
	/** @type {StatusResponse} */
	const userRes = await dynamo.createUser(email, group);
	if (!userRes.success) {
		console.error(chalk.red('Error creating user in DynamoDB'));
		return;
	}
	const res = await dynamo.addMember(group, email, 'fakeSubscriptionArn');
	if (!res.success) {
		console.error(
			chalk.redBright(`Could not add user ${email} to group ${group}`)
		);
	}
	console.log(
		chalk.green(`Successfully created user ${email} as part of ${group}`)
	);
	return;
};

const createReport = async ({ userData, message, imagePath }) => {
	const { email, group } = userData;
	const user = await dynamo.findUser(email);
	if (user === null) {
		console.error(chalk.red('User not found'));
		return;
	}

	let file = undefined;
	let imageType = undefined;
	try {
		file = fs.readFileSync(imagePath);
		imageType = await fileTypeFromBuffer(file);
	} catch (err) {
		console.error('Error reading file ' + imagePath, err);
		return;
	}
	if (!file) {
		console.error('Error reading file ' + imagePath);
		return;
	}

	const imageId = await dynamo.createImage(
		email,
		group,
		imageType.mime ?? 'image/*'
	);

	const uploaded = await s3.putObject(file, imageId);
	if (!uploaded) {
		console.error(chalk.red('Error uploading file ' + imagePath));
		return;
	}
	console.log(
		chalk.green(
			`Uploaded file with id ${imageId} and type ${imageType.mime ?? 'image/*'}`
		)
	);

	const res = await dynamo.createReport(user, {
		message,
		imageId,
	});
	if (res.success === false) {
		console.error(chalk.red('Error creating report: ' + res.message));
		return;
	}
};

const init = async (groups, users, reports) => {
	let promises = [];
	for (let group of groups) {
		promises.push(createGroup(group));
	}
	await Promise.allSettled(promises);
	console.log('Groups created');

	promises = [];
	for (let user of users) {
		promises.push(createUser(user));
	}
	await Promise.allSettled(promises);
	console.log('Users created');

	promises = [];
	for (let report of reports) {
		promises.push(createReport(report));
	}
	await Promise.allSettled(promises);
	console.log('Reports created');
};

// const { groups, users, reports } = createRandomData({
// 	groupsAmount: 10,
// 	usersAmount: 20,
// 	reportsAmount: 4,
// });
// console.log(chalk.blue('Generated random data'));

// init(groups, users, reports);
