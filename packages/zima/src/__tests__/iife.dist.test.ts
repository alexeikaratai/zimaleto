import { readFile } from "node:fs/promises";
import { runInNewContext } from "node:vm";
import { describe, expect, test } from "vitest";

type ScriptGlobals = {
    Zimaleto?: Record<string, unknown>;
};

// An empty context has no window or document, so the build throws if it touches the DOM while loading.
async function runScriptBuild(): Promise<ScriptGlobals> {
    const code = await readFile(new URL("../../dist/zimaleto.iife.js", import.meta.url), "utf8");
    const globals: ScriptGlobals = {};
    runInNewContext(code, globals);

    return globals;
}

describe("<script> build", () => {
    test("loads without a DOM", async () => {
        await expect(runScriptBuild()).resolves.toBeDefined();
    });

    test("puts createSnow and every shape on the Zimaleto global", async () => {
        const { Zimaleto } = await runScriptBuild();

        expect(Object.keys(Zimaleto ?? {}).sort()).toStrictEqual([
            "createSnow",
            "crystal",
            "dot",
            "image",
            "star",
            "text",
        ]);
    });
});
