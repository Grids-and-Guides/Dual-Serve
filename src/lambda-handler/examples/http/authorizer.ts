import { APIGatewayAuthorizerResult, APIGatewayTokenAuthorizerEvent, AuthResponse, PolicyDocument } from 'aws-lambda';

// generatePolicy creates a policy document to allow this user on this API:
function generatePolicy (effect: string, resource: string): PolicyDocument {
  const policyDocument = {} as PolicyDocument
  if (effect && resource) {
    policyDocument.Version = '2012-10-17'
    policyDocument.Statement = []
    const statementOne: any = {}
    statementOne.Action = 'execute-api:Invoke'
    statementOne.Effect = effect
    statementOne.Resource = resource
    policyDocument.Statement[0] = statementOne
  }
  return policyDocument
}

export const handler = async (event: APIGatewayTokenAuthorizerEvent): Promise<APIGatewayAuthorizerResult> => {
    // Extract the bearer authorization token from the event
    const authHeader = event.authorizationToken;
    if(!authHeader){
        throw new Error('authorization token not found');
    }
    const token = authHeader.split(' ')[1]!;

    try {
        if(token !== '1234'){
            throw new Error("Invaild Token")
        }
    } catch (err) {
        console.error('Error verifying token', err);
        // Return an authorization response indicating the request is not authorized
        const policyDoc = generatePolicy('Deny', '*')
        return {
            principalId: 'user',   // decoded.sub
            policyDocument: policyDoc
        } as AuthResponse;
    }

    // return an authorization response indicating the request is authorized
    const policyDoc = generatePolicy('Allow', '*')
        return {
            principalId: 'user',   // decoded.sub
            policyDocument: policyDoc
        } as AuthResponse;
};