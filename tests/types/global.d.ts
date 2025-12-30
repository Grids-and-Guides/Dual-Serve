import type request from "supertest";

declare global {
  const api: request.SuperTest<request.Test>;
}

export {};