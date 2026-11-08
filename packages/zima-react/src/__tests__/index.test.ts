import { describe, expect, test } from "vitest";

describe("package entry", () => {
    test("imports in a DOM environment", async () => {
        const importEntry = () => import("../index");

        await expect(importEntry()).resolves.toBeDefined();
    });
});
