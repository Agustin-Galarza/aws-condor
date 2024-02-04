import {
	CognitoIdentityProviderClient,
	AdminCreateUserCommand,
	AdminGetUserCommand,
	InitiateAuthCommand,
	NotAuthorizedException,
	RespondToAuthChallengeCommand,
} from '@aws-sdk/client-cognito-identity-provider'; // ES Modules import
// const { CognitoIdentityProviderClient, AdminCreateUserCommand } = require("@aws-sdk/client-cognito-identity-provider"); // CommonJS import
const client = new CognitoIdentityProviderClient({});
import * as dynamo from './dynamoHelper.mjs';

const userPoolId = 'us-east-1_t6uVk1Q1x';
const clientId = '5iusbfrngfv3c6qpbjejt01dfi';

const NEW_PASSWORD = 'galar_is_cool';
const EMAIL = 'agalarza@itba.edu.ar';

const authenticateUser = async (username, password) => {
	try {
		const res = await client.send(
			new InitiateAuthCommand({
				AuthFlow: 'USER_PASSWORD_AUTH',
				AuthParameters: {
					USERNAME: username,
					PASSWORD: password,
				},
				ClientId: clientId,
			})
		);

		if (res.$metadata.httpStatusCode !== 200) {
			console.error('Error initiating auth:', res);
			return null;
		}

		return res;
	} catch (error) {
		console.error('Error initiating auth:', error);
		return null;
	}
};

const changeUserPassword = async (username, password) => {
	const initAuthResponse = await authenticateUser(username, password);
	if (initAuthResponse == null) {
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
const createUser = async email => {
	const tempPassword = '1234567';
	const { User } = await client.send(
		new AdminCreateUserCommand({
			UserPoolId: userPoolId,
			Username: email,
			UserAttributes: [
				{ Name: 'email_verified', Value: 'true' },
				{ Name: 'email', Value: email },
			],
			TemporaryPassword: tempPassword,
		})
	);
	console.log('User created:', User);

	const credentials = await changeUserPassword(email, tempPassword);
	if (credentials == null) {
		return null;
	}

	const user = await dynamo.createUser(email);
	if (user === null) {
		console.error('Error creating user in DynamoDB');
		return credentials;
	}
	console.log('Dynamo user', user);

	return credentials;
};
const refreshToken = async refreshToken => {
	try {
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
		return response.AuthenticationResult;
	} catch (error) {
		if (error instanceof NotAuthorizedException) {
			console.warn('Token expired. Re-authenticating user');
			const res = await authenticateUser(EMAIL, NEW_PASSWORD);
			if (res == null || res.AuthenticationResult == undefined) {
				console.error(
					'Error refreshing token. Could not re-authenticate user:',
					error
				);
				return null;
			}
			console.log(
				'Success. Token refreshed',
				`This token is valid for ${
					res.AuthenticationResult.ExpiresIn / 3600
				} hours.`
			);
			return res.AuthenticationResult;
		}
		console.error('Unexpected error:', error.name);
		return null;
	}
};

// const userCredentials = await createUser('agalarza@itba.edu.ar');
// if (userCredentials != null) {
// 	console.log('User:', userCredentials);
// }

const userCredentials = await refreshToken(
	'eyJjdHkiOiJKV1QiLCJlbmMiOiJBMjU2R0NNIiwiYWxnIjoiUlNBLU9BRVAifQ.jjjfdOa8iDY1YBUPTLYeeetqPWmyZ8o4OXnupPs0nkljr6_HFsy_XvJK8mTVTWYZvMsbcsdS45LILG1nSVgxag7H0G2sf4lw8oePbdvbODP35WVg8pHpmsGiNdVbOluJJlYlEraIX_1QFgiQA-zOSf3ZDMA2i_aQKe62YrOKSDllzTLtZjreU72lFCxosGNwArCqlAPpNYZm4JhOseVgBezGoYhOxemqwj5DcQPfOOzfEqVJ2uGHa1_C3DX77-6sNo9KzyDceuCXg3if4MMv8Ih3ndddxfPUQ-Yp9o8XaQPn1sM7w0ZXGekLJQoXhBV2AjbD5h7AYdf-TLhDOi23RA.0DwvmWQu_FaYDqBO.gZlZOjcg-Zl33tqXLMN75uzOTkQdaEt_ZEFzvp32m-L37UZ6-6Y4pxKc4b_QzBvPc8T6QMfkOHbdijX5SmKjzZ_W2r956_-2k9JSwL6cjm_hxad061fXFCOQFwGKMdyrHhNxRXKqukvrXd3nTyahZSxCYvQxgfLJKZPDKgCVdevWPR3nmZUmYqkBDOMQzfMZaDsbOiC4-RvbcMa4KfCJLchDb2eYNwYoarvwtEjYafD4tkhondYKFLP0_ygPcmH5KRD1Rsl3xXqh-evNZBdUzM4eBr3OD-hCAZnZPXG7EvEcOGavDMR4M1zbTpB_shk45JcKXLoklaCeRaRPhZlemdeFfCTEYm9d8pgl2Lw1RVyG7T33GXGl7hI1_xzGoueuHGktm-nLe9Lo37dB0Vt_W96Y8VEaJ8c3lFhnrNDr8LZUTw4WPEjg7hTl_42DU1GBzxntZUxxW7KYwBjU5tefqHdzf55fpuxnsdGYKymPpf663i4sGPzDXfsTg_fQd7SZ2N4HLtSBOT0a2alCNVtlj3elzoW-lmlO-mGESttmdmlAcYyrpX1SwNoOG1758_5Tr31r_PKruCJiYOvF1yXi7ubfaxgocLUy1K9uK6ozOUNDu7wRMzkJFBUbtTVbQF4DwpC27R3W8Uo6LHLHCTREHfxyeS7nu5qHmnt7d4PcyIPGWB8GSnE2wIhJSu9gv2o5-sqV-h1jrmJkYWmsQFKeMmZAZaBwI4bDhrBDHExQuAnn6UTqlSTLpwIKovPLF1hYBwKKvvZvLTPCd0MSEd993s2WOfjt1rdbn6acKH2tVjREy_PPHcDufqXjYm36zV6OcVJ6fb7ba11lZxDKfJDxKbTtDhJ6OLhHY3kbdB6WNGudzROOaBSletCICn2xvZkkYtmt-lg4eXFKOAp5f5Dh6J9fZ40-TN4qDAy45AP8cmJ4zu08XjQsEWrxH5qRrAEEso8xi3Uc03w0IC1F_Ym8yX_xTw1nvwkZlBZH5E4yuBbg5iTnv62CiCp9yAgmFCL6BolUE82spLNyhPp6exz6CmZ9elkeKgOsJrNxPieq9U9WB61OzluO_UPO5TJ5tCY8L7o3rDGxkQ75AUm7K7OXzTGKAHKgT-yPOSFxMlz2SC-eTOMa3pVFUGNp4Sf0y1sAb2UXgmbIokwdrctcFrJhrA-7lxL6P_YJMkQsvCeu0PGjSNW5pbTPXfd3eZm1iqScbAeImdqkd_RbveQK9yQnr7nyOWni6ORFeW3FVqGkSLePOIJHebNwei0uqyLaA3CQfZAewKQpiF46lCGTjqm5uqOnwvdoq2wnc13MC9NmhQ5RGq2OVHbHT_oziA.oWtF2Vk5poX7AxqvsCN9mg'
);
if (userCredentials != null) {
	console.log('User:', userCredentials);
}
