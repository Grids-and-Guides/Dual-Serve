import { Handler } from "aws-lambda";

export const handler: Handler = async (event, context) => {
  console.log("env", process.env.frontendUrl);
  return { statusCode: 200, body: ["User 1", "User 2"] };
};
