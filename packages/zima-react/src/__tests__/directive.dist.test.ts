import { readFile } from "node:fs/promises";
import { describe, expect, test } from "vitest";

describe("build output", () => {
    test("starts the entry with the use client directive", async () => {
        const entryUrl = new URL("../../dist/index.js", import.meta.url);

        const code = await readFile(entryUrl, "utf8");

        expect(code.startsWith('"use client";')).toBe(true);
    });
});
