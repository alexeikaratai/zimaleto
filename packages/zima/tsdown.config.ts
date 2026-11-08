import { defineConfig } from "tsdown";

export default defineConfig({
    entry: "src/index.ts",
    platform: "browser",
    target: "es2022",
    dts: true,
    exports: { devExports: true },
    publint: true,
    attw: true,
    failOnWarn: true,
});
