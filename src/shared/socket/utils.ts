import {
    ApiGatewayManagementApi,
    PostToConnectionCommand,
  } from "@aws-sdk/client-apigatewaymanagementapi";
  
  const config = {
    endpoint: process.env.SOCKET_URL,
  };
  const client = new ApiGatewayManagementApi(config);

export async function postSocketMessage(connectionId: string, payload: any) {
    try {
      const compareparams = {
        ConnectionId: connectionId,
        Data: JSON.stringify(payload),
      };
      const compareCommand = new PostToConnectionCommand(compareparams);
  
      await client.send(compareCommand);
    } catch (error: any) {
      console.log("Error in sending socket message: ", error);
  
      throw new Error(error);
    }
  }
  
  export const postLambdaSocketMessageBinder = (connectionId: string) => {
    return (message: any) => postSocketMessage(connectionId, message);
  };