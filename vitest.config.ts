import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        projects: ["packages/*/vitest.config.ts"],
        coverage: {
            provider: "v8",
            include: ["packages/*/src/**"],
            exclude: ["**/__tests__/**"],
            reporter: ["text", "lcov"],
        },
    },
});
