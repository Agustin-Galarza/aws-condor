import { SNSClient } from '@aws-sdk/client-sns';
import {
	CreateTopicCommand,
	DeleteTopicCommand,
	SubscribeCommand,
	UnsubscribeCommand,
	PublishCommand,
} from '@aws-sdk/client-sns';

// The AWS Region can be provided here using the `region` property. If you leave it blank
// the SDK will default to the region set in your AWS config.
const snsClient = new SNSClient({});

export const createTopic = async topicName => {
	try {
		const data = await snsClient.send(
			new CreateTopicCommand({
				Name: topicName,
			})
		);
		console.log('Topic ARN is ' + data.TopicArn);
		return data.TopicArn;
	} catch (err) {
		console.error(err, err.stack);
		return null;
	}
};

export const deleteTopic = async topicArn => {
	try {
		const data = await snsClient.send(
			new DeleteTopicCommand({
				TopicArn: topicArn,
			})
		);
		console.log('Topic deleted');
		return true;
	} catch (err) {
		console.error(err, err.stack);
		return false;
	}
};

export const publish = async (topicArn, subject, message) => {
	try {
		const data = await snsClient.send(
			new PublishCommand({
				TopicArn: topicArn,
				Message: message,
				Subject: subject,
			})
		);
		console.log('Message sent');
		return true;
	} catch (err) {
		console.error(err, err.stack);
		return false;
	}
};

export const subscribe = async (topicArn, endpoint, protocol = 'email') => {
	try {
		const data = await snsClient.send(
			new SubscribeCommand({
				TopicArn: topicArn,
				Protocol: protocol,
				Endpoint: endpoint,
				ReturnSubscriptionArn: true,
			})
		);
		console.log('Subscription ARN is ' + data.SubscriptionArn);
		return data.SubscriptionArn;
	} catch (err) {
		console.error(err, err.stack);
		return null;
	}
};

export const deleteSubcription = async subscriptionArn => {
	try {
		const data = await snsClient.send(
			new UnsubscribeCommand({
				SubscriptionArn: subscriptionArn,
			})
		);
		console.log('Subscription deleted');
		return true;
	} catch (err) {
		console.error(err, err.stack);
		return false;
	}
};
