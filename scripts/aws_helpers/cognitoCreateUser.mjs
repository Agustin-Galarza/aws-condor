import {
	CognitoIdentityProviderClient,
	AdminCreateUserCommand,
	AdminGetUserCommand,
	InitiateAuthCommand,
	RespondToAuthChallengeCommand,
} from '@aws-sdk/client-cognito-identity-provider'; // ES Modules import
// const { CognitoIdentityProviderClient, AdminCreateUserCommand } = require("@aws-sdk/client-cognito-identity-provider"); // CommonJS import
const client = new CognitoIdentityProviderClient({});
import * as dynamo from './dynamoHelper.cjs';

const userPoolId = 'us-east-1_qCZT2l1Ks';
const clientId = '5254rq6aepsa5jingrd5e3134d';

const NEW_PASSWORD = 'galar_is_cool';

const changeUserPassword = async (username, password) => {
	const initAuthResponse = await client.send(
		new InitiateAuthCommand({
			AuthFlow: 'USER_PASSWORD_AUTH',
			AuthParameters: {
				USERNAME: username,
				PASSWORD: password,
			},
			ClientId: clientId,
		})
	);

	if (initAuthResponse.$metadata.httpStatusCode !== 200) {
		console.error('Error initiating auth:', initAuthResponse);
		return null;
	}

	if (initAuthResponse.ChallengeName === 'NEW_PASSWORD_REQUIRED') {
		const respondToAuthChallengeResponse = await client.send(
			new RespondToAuthChallengeCommand({
				ChallengeName: 'NEW_PASSWORD_REQUIRED',
				ClientId: clientId,
				ChallengeResponses: {
					USERNAME: username,
					NEW_PASSWORD: NEW_PASSWORD,
				},
				Session: initAuthResponse.Session,
				ClientId: clientId,
			})
		);
		if (respondToAuthChallengeResponse.$metadata.httpStatusCode !== 200) {
			console.error(
				'Error responding to auth challenge:',
				respondToAuthChallengeResponse
			);
			return null;
		}

		if (respondToAuthChallengeResponse.AuthenticationResult == undefined) {
			console.warn(
				'A new challenge is requiered: ' +
					respondToAuthChallengeResponse.ChallengeName,
				'response',
				respondToAuthChallengeResponse
			);
			return null;
		}

		console.log('Success. User created and validated');
		return {
			AccessToken:
				respondToAuthChallengeResponse.AuthenticationResult.AccessToken,
			RefreshToken:
				respondToAuthChallengeResponse.AuthenticationResult.RefreshToken,
			IdToken: respondToAuthChallengeResponse.AuthenticationResult.IdToken,
		};
	}
};
const createUser = async (email, username) => {
	const cognitoUsername = email;
	const tempPassword = '1234567';
	const { User } = await client.send(
		new AdminCreateUserCommand({
			UserPoolId: userPoolId,
			Username: cognitoUsername,
			UserAttributes: [
				{ Name: 'email_verified', Value: 'true' },
				{ Name: 'email', Value: email },
			],
			TemporaryPassword: tempPassword,
		})
	);
	console.log('User created:', User);

	const credentials = await changeUserPassword(cognitoUsername, tempPassword);
	if (credentials == null) {
		return null;
	}

	const user = await dynamo.addUser(username, email);
	if (user === null) {
		console.error('Error creating user in DynamoDB');
		return credentials;
	}
	console.log('Dynamo user', user);

	return credentials;
};
const refreshToken = async refreshToken => {
	const response = await client.send(
		new InitiateAuthCommand({
			AuthFlow: 'REFRESH_TOKEN',
			AuthParameters: {
				REFRESH_TOKEN: refreshToken,
			},
			ClientId: clientId,
		})
	);

	if (response.$metadata.httpStatusCode !== 200) {
		console.error('Error refreshing token:', response);
		return null;
	}
	if (response.AuthenticationResult == undefined) {
		console.warn(
			'Error refreshing token. A new challenge is required:',
			response
		);
		return null;
	}

	console.log(
		'Success. Token refreshed',
		`This token is valid for ${
			response.AuthenticationResult.ExpiresIn / 3600
		} hours.`
	);
	return {
		RefreshToken: response.AuthenticationResult.RefreshToken,
		IdToken: response.AuthenticationResult.IdToken,
	};
};

const userCredentials = await createUser(
	'agustingalarza001@gmail.com',
	'agustin'
);

if (userCredentials != null) {
	console.log('User:', userCredentials);
}
