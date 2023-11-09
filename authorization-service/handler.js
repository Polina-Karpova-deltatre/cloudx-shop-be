exports.basicAuthorizer = async (event, _context, callback) => {
  if (!event.authorizationToken) {
    return callback("Unauthorized"); // No authorization token
  }

  try {
    const encodedCreds = event.authorizationToken.split(" ")[1];
    const buff = Buffer.from(encodedCreds, "base64");
    const plainCreds = buff.toString("utf-8").split(":");
    const [username, password] = plainCreds;

    const expectedPassword = process.env[username];

    if (!expectedPassword || expectedPassword !== password) {
      return callback("Unauthorized"); // Wrong username or password
    }

    const policyDocument = generatePolicyDocument("Allow", event.methodArn);

    // Return an IAM policy document for the current endpoint
    callback(null, {
      principalId: username,
      policyDocument,
    });
  } catch (e) {
    return callback("Unauthorized"); // Invalid token
  }
};

const generatePolicyDocument = (effect, resource) => {
  if (!effect || !resource) return null;

  const policyDocument = {
    Version: "2012-10-17",
    Statement: [
      {
        Action: "execute-api:Invoke",
        Effect: effect,
        Resource: resource,
      },
    ],
  };

  return policyDocument;
};
