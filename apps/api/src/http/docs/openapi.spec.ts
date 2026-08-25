import { afterAll, describe, expect, it } from "vitest";
import { app } from "../../app.js";

describe("OpenAPI documentation", () => {
  afterAll(async () => {
    await app.close();
  });

  it("documents every API operation and serves Swagger UI", async () => {
    await app.ready();

    const openApiResponse = await app.inject({
      method: "GET",
      url: "/docs/json",
    });
    const swaggerUiResponse = await app.inject({
      method: "GET",
      url: "/docs/",
    });

    const openApiDocument = openApiResponse.json();
    const operationsCount = Object.values(openApiDocument.paths).reduce<number>(
      (total, path) => total + Object.keys(path as object).length,
      0,
    );

    expect(openApiResponse.statusCode).toBe(200);
    expect(swaggerUiResponse.statusCode).toBe(200);
    expect(openApiDocument.info.title).toBe("GymPass API");
    expect(openApiDocument.components.securitySchemes.bearerAuth).toBeDefined();
    expect(openApiDocument.paths["/users"].post.requestBody).toBeDefined();
    expect(operationsCount).toBe(24);
  });
});
