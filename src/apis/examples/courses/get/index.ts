import { Handler } from "aws-lambda";

export const handler: Handler = async (event, context) => {
  const id = event.pathParameters?.id;
  console.log("qp", event.queryStringParameters);
  return {
    statusCode: 200,
    body: JSON.stringify({ message: `Course ${id} fetched.` }),
  };
};
