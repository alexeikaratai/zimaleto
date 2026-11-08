import { defineConfig } from "tsdown";

export default defineConfig({
    entry: "src/index.ts",
    platform: "browser",
    target: "es2022",
    dts: true,
    exports: { devExports: true },
    publint: true,
    attw: true,
    failOnWarn: "ci-only",
    // Rolldown warns that bundling may drop the directive, but a single entry chunk keeps it;
    // directive.dist.test.ts guards that.
    suppressWarnings: 'module level directive "use client"',
});
