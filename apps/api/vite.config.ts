import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    projects: [
      {
        extends: true,
        test: {
          name: "unit",
          include: ["src/**/*.spec.ts"],
          exclude: ["src/**/*.e2e-spec.ts", "src/**/*.e2e.spec.ts"],
        },
      },
      {
        extends: true,
        test: {
          name: "e2e",
          include: ["src/**/*.e2e-spec.ts"],
          environment:
            "./prisma/vitest-environment-prisma/prisma-test-environment.ts",
        },
      },
    ],
  },
});
