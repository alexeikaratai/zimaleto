// @vitest-environment node
import { renderToString } from "react-dom/server";
import { describe, expect, test } from "vitest";
import { Snowfall } from "../Snowfall";

describe("<Snowfall> on the server", () => {
    test("renders a hidden, full-size canvas with the real core and no DOM", () => {
        const html = renderToString(
            <Snowfall
                count={10}
                className="snow"
            />,
        );

        expect(html).toBe(
            '<canvas aria-hidden="true" class="snow" style="position:absolute;inset:0;width:100%;height:100%;pointer-events:none"></canvas>',
        );
    });
});
