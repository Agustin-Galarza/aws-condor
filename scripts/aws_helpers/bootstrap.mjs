import * as dynamo from './dynamoHelper.cjs';
import * as sns from './snsHelper.mjs';

const GROUPS = ['Quilmes', 'Berazategui'];

GROUPS.forEach(async groupname => {
	try {
		const topicArn = await sns.createTopic(groupname);
		if (topicArn === null) {
			console.error('Could not create topic');
			return;
		}
		console.log('Topic created', topicArn);
		const res = await dynamo.createGroup(groupname, topicArn);
		console.log(`Group ${groupname} created successfully.`);
		return;
	} catch (err) {
		return;
	}
});
