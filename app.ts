

export enum Stage {
  Local = 'local',
  Dev = 'dev',
  Production = 'production',
}

export function getState(stage: Stage): Stage {
  if(process.env.STAGE_NAME){
    return getStageName(process.env.STAGE_NAME)
  }else{
    return stage;
  }
}

function getStageName(stageValue: string) {
  switch (stageValue) {
      case "local":
          return Stage.Local
          break;
      case "dev":
          return Stage.Dev
          break;
      case "production":
          return Stage.Production
          break;
  
      default:
          return Stage.Local
          break;
  }
}

export class Trigger {
    constructor(
      public type: string,
      public endpoint: string,
      public method: string,
      public responseType: string,
      public apiGatewayName: string,
      public authorizer: string
    ) {}
  }
  
  export class FunctionConfig {
    constructor(
      public name: string,
      public runtime: string,
      public handler: string,
      public srcFile: string,
      public output: string,
      public memory: number,
      public concurrency: number,
      public timeout: number,
      public environmentVariable: Record<string, string>,
      public triggers?: Trigger[]
    ) {}
  }
  
  export class Authorizer {
    constructor(
      public name: string,
      public type: string,
      public authFunction: FunctionConfig
    ) {}
  }
  
  export class Vpc {
    constructor(public name: string) {}
  }
  
  export class ApiGateway {
    constructor(
      public name: string,
      public type: string,
      public authenticationType: string,
      public cors: string
    ) {}
  }
  
  export class WebsocketApi {
    constructor(
      public name: string,
      public routeSelectionExpression: string,
      public stageName: string
    ) {}
  }
  
  export class AppStack {
    constructor(
      public appName: string,
      public version: string,
      public region: string,
      public stage: Stage,
      public provider: string,
      public envFile: Record<string, string>,
      public authorizer: Authorizer[],
      public vpc: Vpc[],
      public apiGateway: ApiGateway[],
      public websocketApi: WebsocketApi[],
      public functions: FunctionConfig[]
    ) {}
  }
  
  
  
  
  
  