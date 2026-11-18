import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        name: "unit",
        environment: "node",
        include: ["src/**/__tests__/*.test.ts"],
        restoreMocks: true,
        unstubGlobals: true,
        coverage: {
            provider: "v8",
            // The measuring code and the options logic. The components are for trying things out by hand, so they have
            // no unit tests, and the presets are only data.
            include: ["src/performance/**", "src/options/**"],
            exclude: ["src/**/__tests__/**", "src/options/colorPresets.ts", "src/options/presets.ts"],
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
