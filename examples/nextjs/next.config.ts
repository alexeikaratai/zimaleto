import type { NextConfig } from "next";

const config: NextConfig = {
    // In the workspace the packages point to their TypeScript source, which Next.js compiles when asked to.
    transpilePackages: ["@zimaleto/zima", "@zimaleto/zima-react"],
};

export default config;
