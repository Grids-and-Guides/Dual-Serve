import { CdkStack } from "../src/infra/cdk/cdk-stack";
import * as cdk from "aws-cdk-lib";
import path from "path";
import * as dotenv from 'dotenv';
import { appStack } from "../deploy"

function deploy() {
    let stageName:any = "";
    // Load environment variables based on stage
    const envPath = appStack.envFile[appStack.stage];
    let env = dotenv.config({ path: path.resolve(__dirname, envPath) });
    console.log("env", env.parsed)
    const app = new cdk.App();
    new CdkStack(app, `test-cdk-serverless-${stageName}`,
        appStack as any,
        {
            stackName: `chatbot-cdk-serverless-${stageName}`,
        })
}



try {
    deploy()
} catch (error) {
    console.log(error)
}
