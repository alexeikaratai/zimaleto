import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, type Mock, test, vi } from "vitest";
import { stubCanvasContext } from "../../../__tests__/support/canvas";
import { DETAILED_OPTIONS, INITIAL_OPTIONS, labelShapes, type PlaygroundOptions } from "../../../options";
import { ShapesSection } from "../ShapesSection";

type HandleOptionsChange = (changes: Partial<PlaygroundOptions>) => void;

afterEach(cleanup);

function renderShapes(changes: Partial<PlaygroundOptions> = {}): Mock<HandleOptionsChange> {
    const handleOptionsChange = vi.fn<HandleOptionsChange>();
    stubCanvasContext();
    render(
        <ShapesSection
            options={{ ...INITIAL_OPTIONS, ...changes }}
            onOptionsChange={handleOptionsChange}
        />,
    );

    return handleOptionsChange;
}

describe("<ShapesSection>", () => {
    test("changes one shape's weight and keeps the others", () => {
        const handleOptionsChange = renderShapes();

        fireEvent.change(screen.getByRole("slider", { name: "Star" }), { target: { value: "2" } });

        expect(handleOptionsChange).toHaveBeenCalledWith({
            shapeWeights: { ...INITIAL_OPTIONS.shapeWeights, star: 2 },
        });
    });

    test("changes the number of generated crystals", () => {
        const handleOptionsChange = renderShapes();

        fireEvent.change(screen.getByRole("slider", { name: "Number of crystals" }), { target: { value: "12" } });

        expect(handleOptionsChange).toHaveBeenCalledWith({ crystalCount: 12 });
    });

    test("applies the detailed shapes preset", () => {
        const handleOptionsChange = renderShapes();

        fireEvent.click(screen.getByRole("button", { name: "Detailed shapes" }));

        expect(handleOptionsChange).toHaveBeenCalledWith(DETAILED_OPTIONS);
    });

    test("shows a tile for every shape, each generated crystal on its own", () => {
        renderShapes({ crystalCount: 3 });

        const tiles = screen.getAllByRole("img").map((tile) => tile.getAttribute("aria-label"));

        expect(tiles).toStrictEqual(labelShapes(3).map(({ label }) => label));
    });
});
