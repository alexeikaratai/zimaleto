import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        restoreMocks: true,
        coverage: {
            provider: "v8",
            include: ["src/**"],
            exclude: ["src/**/__tests__/**"],
            reporter: ["text", "lcov"],
            thresholds: {
                lines: 90,
            },
        },
        projects: [
            {
                extends: true,
                test: {
                    name: "unit",
                    environment: "happy-dom",
                    include: ["src/**/__tests__/*.test.{ts,tsx}"],
                    exclude: ["src/**/__tests__/*.dist.test.ts"],
                    typecheck: {
                        enabled: true,
                        include: ["src/**/__tests__/*.test-d.ts"],
                    },
                },
            },
            {
                extends: true,
                test: {
                    name: "dist",
                    environment: "node",
                    include: ["src/**/__tests__/*.dist.test.ts"],
                },
            },
        ],
    },
});
