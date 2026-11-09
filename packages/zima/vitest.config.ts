import { playwright } from "@vitest/browser-playwright";
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
                lines: 100,
                functions: 100,
                branches: 100,
                statements: 100,
            },
        },
        projects: [
            {
                extends: true,
                test: {
                    name: "unit",
                    environment: "node",
                    include: ["src/**/__tests__/*.test.ts"],
                    exclude: ["src/**/__tests__/*.browser.test.ts", "src/**/__tests__/*.dist.test.ts"],
                    typecheck: {
                        enabled: true,
                        include: ["src/**/__tests__/*.test-d.ts"],
                    },
                },
            },
            {
                extends: true,
                test: {
                    name: "browser",
                    include: ["src/**/__tests__/*.browser.test.ts"],
                    browser: {
                        enabled: true,
                        headless: true,
                        provider: playwright(),
                        instances: [{ browser: "chromium" }],
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
