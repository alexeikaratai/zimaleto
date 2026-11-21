import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";
import { INITIAL_OPTIONS } from "../../options";
import { MotionSection } from "../MotionSection";

afterEach(cleanup);

describe("<MotionSection>", () => {
    test.each([
        ["Speed, maximum", "120", { speed: [30, 120] }],
        ["Wind", "-40", { wind: -40 }],
        ["Gusts", "60", { gust: 60 }],
        ["Sway, minimum", "10", { sway: [10, 20] }],
        ["Rotation, maximum", "180", { rotation: [-90, 180] }],
    ])("changes %s", (name, value, changes) => {
        const handleOptionsChange = vi.fn();
        render(
            <MotionSection
                options={INITIAL_OPTIONS}
                onOptionsChange={handleOptionsChange}
            />,
        );

        fireEvent.change(screen.getByRole("slider", { name }), { target: { value } });

        expect(handleOptionsChange).toHaveBeenCalledWith(changes);
    });
});
