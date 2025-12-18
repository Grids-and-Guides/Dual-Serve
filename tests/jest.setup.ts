import { setupPrerequisites, teardownPrerequisites } from "./helpers/prerequisites";

beforeAll(async () => {
  // (global as any).api = request(app);
  await setupPrerequisites();
});

afterAll(async () => {
  await teardownPrerequisites();
});

