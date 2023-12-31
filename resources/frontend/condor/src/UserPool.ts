import { CognitoUserPool } from 'amazon-cognito-identity-js';

console.log('UserPool Credentials:');
console.log('UserPoolId:', import.meta.env.VITE_COGNITO_USER_POOL_ID);
console.log('ClientId:', import.meta.env.VITE_COGNITO_CLIENT_ID);

const poolData = {
	UserPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID,
	ClientId: import.meta.env.VITE_COGNITO_CLIENT_ID,
};

const UserPool = new CognitoUserPool(poolData);
export default UserPool;
