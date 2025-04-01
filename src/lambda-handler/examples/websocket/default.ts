import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { postLambdaSocketMessageBinder } from "../../../shared/socket/utils";

export const handler = async (
    event: APIGatewayProxyEvent
  ): Promise<APIGatewayProxyResult> => {
    const connectId = event["requestContext"]["connectionId"];
    const bodyJSON = event.body;

    if (!bodyJSON || !connectId) {
      console.error("Body cannot be empty");
      return {
        statusCode: 500,
        body: JSON.stringify({ message: "Body cannot be empty" }),
      };
    }

    const postSocketMessageCallback = postLambdaSocketMessageBinder(connectId);
    
    // Logic for message handling
    console.log("default");
    return { statusCode: 200, body: 'Message received' };
  };