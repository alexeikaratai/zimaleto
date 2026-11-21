import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        name: "unit",
        environment: "happy-dom",
        include: ["src/**/__tests__/*.test.{ts,tsx}"],
        restoreMocks: true,
        unstubGlobals: true,
        coverage: {
            provider: "v8",
            include: ["src/**/*.{ts,tsx}"],
            exclude: ["src/**/__tests__/**"],
            reporter: ["text", "lcov"],
            thresholds: {
                lines: 100,
                functions: 100,
                branches: 100,
                statements: 100,
            },
        },
    },
});
