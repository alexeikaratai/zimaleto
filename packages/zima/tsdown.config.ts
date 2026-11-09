import { defineConfig } from "tsdown";

export default defineConfig([
    {
        entry: "src/index.ts",
        platform: "browser",
        target: "es2022",
        dts: true,
        exports: { devExports: true },
        publint: true,
        attw: true,
        failOnWarn: true,
    },
    // For <script> tags and CDNs: every export on window.Zimaleto, minified, since nothing bundles it further.
    {
        entry: { zimaleto: "src/index.ts" },
        format: "iife",
        globalName: "Zimaleto",
        platform: "browser",
        target: "es2022",
        minify: true,
        // The global needs no Symbol.toStringTag, and leaving it out saves bytes.
        outputOptions: { generatedCode: { symbols: false } },
        dts: false,
        failOnWarn: true,
    },
]);
