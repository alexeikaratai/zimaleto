import { BOKEH_CORE } from "./constants";
import { dot } from "./dot";
import type { Shape } from "./types";

/** An out-of-focus flake: a soft disc that fades to transparent, which adds depth when mixed with sharp flakes. */
export const bokeh: Shape = (context, radius) => {
    // A gradient can't fade an arbitrary CSS color to transparent, so the disc is painted in the flake's color and a
    // black-to-clear mask then keeps only part of it. Restoring the context ends the masking, so a custom shape can
    // draw over the bokeh without erasing it.
    const fade = context.createRadialGradient(0, 0, radius * BOKEH_CORE, 0, 0, radius);
    fade.addColorStop(0, "#000");
    fade.addColorStop(1, "#0000");

    context.save();
    dot(context, radius);
    context.globalCompositeOperation = "destination-in";
    context.fillStyle = fade;
    context.fill();
    context.restore();
};
