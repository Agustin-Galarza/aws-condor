import * as dynamo from "/opt/nodejs/dynamo.mjs";
import * as response from "/opt/nodejs/responses.mjs";
import * as request from "/opt/nodejs/requests.mjs";
import * as sns from "/opt/nodejs/sns.mjs";

/**
 * Request:
 * - body: {
 * 		email: string;
 * 		group: string|null; // The name of the group to add the user to
 * }
 * @param {*} event
 * @param {*} context
 * @param {*} callback
 * @returns
 */
export const handler = async (event, context) => {
  const { email, group: groupname } = request.getBody(event);
  if (!email) {
    return response.badRequest("Missing email");
  }

  try {
    const res = await dynamo.createUser(email);

    if (!res.success) {
      if (res.code === 409) return response.conflict("User already exists");
      return response.serverError(res.message);
    }

    if (groupname != null) {
      const group = await dynamo.findGroup(groupname);
      if (group === null) {
        console.error("Group not found", groupname);
        return response.ok(
          "User created. There was an error adding user to group."
        );
      }
      const subscriptionArn = await sns.subscribe(group.topicArn, email);
      if (subscriptionArn === null) {
        console.error(
          "Error while subscribing user to group",
          email,
          groupname
        );
        return response.serverError("There was an error adding user.");
      }
      await dynamo.addMember(groupname, email, subscriptionArn);
    }

    return response.ok(btoa(email));
  } catch (err) {
    return response.serverError(err);
  }
};
