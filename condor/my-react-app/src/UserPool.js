import { CognitoUserPool } from "amazon-cognito-identity-js";

const poolData = {
  UserPoolId: "us-east-1_TX2wyq884",
  ClientId: "33ojsefbvho9cf6qndfj80g3ev"
};

const UserPool = new CognitoUserPool(poolData);

export default UserPool;
