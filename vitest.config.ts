import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        projects: ["packages/*/vitest.config.ts", "apps/playground/vitest.config.ts"],
        coverage: {
            provider: "v8",
            include: ["packages/*/src/**", "apps/playground/src/performance/**"],
            exclude: ["**/__tests__/**"],
            reporter: ["text", "lcov"],
        },
    },
});
