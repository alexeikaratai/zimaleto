import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { stubCanvasContext } from "./support/canvas";

vi.mock("@zimaleto/zima-react", async (importOriginal) => {
    const { FakeSnowfall, fakeUseSnowfall } = await import("./support/snowfallFakes");

    return { ...(await importOriginal<object>()), Snowfall: FakeSnowfall, useSnowfall: fakeUseSnowfall };
});

beforeEach(() => {
    stubCanvasContext();
    vi.resetModules();
});

afterEach(() => {
    document.body.replaceChildren();
});

describe("main", () => {
    test("renders the playground into #root", async () => {
        const root = document.createElement("div");
        root.id = "root";
        document.body.append(root);

        await import("../main");

        await vi.waitFor(() => expect(root.querySelector(".layout")).not.toBeNull());
    });

    test("renders nothing on a page without #root", async () => {
        await import("../main");

        expect(document.body.childElementCount).toBe(0);
    });
});
