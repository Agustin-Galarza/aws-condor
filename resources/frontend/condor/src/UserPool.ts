import { CognitoUserPool } from "amazon-cognito-identity-js";
import { type ICognitoUserPoolData } from "amazon-cognito-identity-js";

const poolData = {
  UserPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID,
  ClientId: import.meta.env.VITE_COGNITO_CLIENT_ID,
} satisfies ICognitoUserPoolData;

console.log(poolData);

const UserPool = new CognitoUserPool(poolData);
export default UserPool;
