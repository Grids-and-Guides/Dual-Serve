import { hideBin } from "yargs/helpers";
import { setupPrerequisites, teardownPrerequisites } from "./helpers/prerequisites";
import yargs from "yargs";
import path from "path";
import dotenv from "dotenv";

const argv = yargs(hideBin(process.argv))
  .option("stage", {
    type: "string",
    default: "dev",
    describe: "Stage environment (e.g. dev, prod)",
  })
  .parseSync();
let stage = "test"
if(argv.stage){
  stage = argv.stage;
}
loadEnvironments(stage);

function loadEnvironments(stage: string) {
  const envPath = path.resolve(__dirname, `./environment/.${stage}.env`);

  dotenv.config({ path: envPath });
}

beforeAll(async () => {
  await setupPrerequisites();
});

afterAll(async () => {
  await teardownPrerequisites();
});

