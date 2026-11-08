import { describe, expect, test } from "vitest";

describe("package entry", () => {
    test("imports in Node without a DOM", async () => {
        const importEntry = () => import("../index");

        await expect(importEntry()).resolves.toBeDefined();
    });
});
