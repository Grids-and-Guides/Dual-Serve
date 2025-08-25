import { CdkStack } from "osff-dsl";
import * as cdk from "aws-cdk-lib";
import path from "path";
import * as dotenv from 'dotenv';
import { appStack } from "./app-config"

function deploy() {
    let stageName:any = "";
    // Load environment variables based on stage
    const envPath = appStack.config.envFile[appStack.config.stage];
    let env = dotenv.config({ path: path.resolve(__dirname, envPath) });
    console.log("env", env.parsed)
    const app = new cdk.App();
    console.log("appStack", JSON.stringify(appStack.config))
    new CdkStack(app, `test-cdk-serverless-${stageName}`,
        appStack.config as any,
        {
            stackName: `chatbot-cdk-serverless-${stageName}`,
        })
}


try {
    deploy()
} catch (error) {
    console.log(error)
}
