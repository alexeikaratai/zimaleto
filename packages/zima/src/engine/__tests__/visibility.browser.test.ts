import { describe, expect, test, vi } from "vitest";
import { addContainer, setTabHidden } from "../../__tests__/support/dom";
import { startSnow } from "../../__tests__/support/engine";
import { whenIntersectionReported } from "../../__tests__/support/timing";

describe("pauseWhenHidden", () => {
    test("pauses while the tab is hidden", () => {
        const { clock } = startSnow({}, addContainer());

        setTabHidden(true);

        expect(clock.pendingFrames).toBe(0);
    });

    test("resumes when the tab is shown again", () => {
        const { clock } = startSnow({}, addContainer());
        setTabHidden(true);

        setTabHidden(false);

        expect(clock.pendingFrames).toBe(1);
    });

    test("pauses when the canvas is off-screen", async () => {
        const container = addContainer();
        container.style.marginTop = "10000px";

        const { clock } = startSnow({}, container);

        await vi.waitFor(() => expect(clock.pendingFrames).toBe(0));
    });

    test("keeps running off-screen with pauseWhenHidden: false", async () => {
        const container = addContainer();
        container.style.marginTop = "10000px";
        const { snow, clock } = startSnow({ pauseWhenHidden: false }, container);

        await whenIntersectionReported(snow.canvas);

        expect(clock.pendingFrames).toBe(1);
    });

    test("keeps running in a hidden tab with pauseWhenHidden: false", () => {
        const { clock } = startSnow({ pauseWhenHidden: false }, addContainer());

        setTabHidden(true);

        expect(clock.pendingFrames).toBe(1);
    });
});
