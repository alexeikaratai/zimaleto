import { finitePositiveOr } from "../options";
import { swayOffset } from "../physics";
import { COLUMN_WIDTH, DEFAULT_DEPTH, STAMP_LIFT, STAMP_ROOM } from "./constants";
import { createDriftLayer } from "./driftLayer";
import { createHeightMap, melt, resample, settle } from "./heightMap";
import type { DriftGround, DriftLayer, DriftOptions, Ground, GroundLayer } from "./types";

// Keyed by the drifts this module started, so a new drift() value can take over the snow that settled under the old.
const reconfigure = new WeakMap<GroundLayer, (ground: DriftGround) => void>();

function createDrift(initial: DriftGround): GroundLayer {
    let { depth } = initial;
    let meltRate = initial.melt;
    let heights: number[] | undefined;
    let layer: DriftLayer | undefined;
    let width = 0;
    let height = 0;
    let pixelRatio = 0;
    let maxRadius = 0;
    let bodyColor = "";

    function rebuild(): void {
        heights = heights ? resample(heights, width, depth) : createHeightMap(width);
        layer = createDriftLayer(width, depth + maxRadius * STAMP_ROOM, pixelRatio, layer);
    }

    const ground: GroundLayer = {
        fit(nextWidth, nextHeight, nextPixelRatio, settings) {
            const nextMaxRadius = settings.size[1];
            // The drift is measured from the bottom, so a new height moves nothing.
            height = nextHeight;
            // Snow in several colors would pile up in stripes, so the body takes the first color, and the flakes on
            // top keep their own. A new color doesn't recolor the snow that has settled.
            [bodyColor = ""] = settings.colors;
            // The pixel ratio starts at 0, so the first fit always builds the drift.
            const hasChanged = nextWidth !== width || nextPixelRatio !== pixelRatio || nextMaxRadius !== maxRadius;

            if (hasChanged) {
                width = nextWidth;
                pixelRatio = nextPixelRatio;
                maxRadius = nextMaxRadius;
                rebuild();
            }
        },
        settle(flakes, elapsedMs, random, spriteOf) {
            const columns = heights as number[];
            const picture = layer as DriftLayer;
            const sunk = (meltRate * elapsedMs) / 1000;

            if (sunk > 0) {
                melt(columns, sunk);
                picture.sink(sunk);
            }

            for (const flake of flakes) {
                const x = flake.x + swayOffset(flake);
                const column = Math.floor(x / COLUMN_WIDTH);
                // Beside the canvas there's no column, so a flake there keeps falling.
                const surface = columns[column];
                const hasLanded = surface !== undefined && flake.y + flake.radius >= height - surface;

                if (hasLanded) {
                    settle(columns, x, flake.radius, depth, (grown, from, to) => {
                        picture.fill(grown, from, to, bodyColor);
                    });
                    const sprite = spriteOf(flake);

                    // A flake whose shape isn't ready yet, such as a loading image(), adds its snow without a stamp.
                    if (sprite) {
                        picture.stamp(sprite, flake, x, (columns[column] as number) + flake.radius * STAMP_LIFT);
                    }

                    flake.y = -flake.radius;
                    flake.x = random() * width;
                }
            }
        },
        draw(context) {
            // drawImage() throws on an empty canvas, which a hidden one has.
            if (layer?.canvas.width) {
                context.drawImage(layer.canvas, 0, context.canvas.height - layer.canvas.height);
            }
        },
    };

    reconfigure.set(ground, (next) => {
        meltRate = next.melt;

        // A new depth keeps the snow that has settled, cut down to the new depth.
        if (next.depth !== depth) {
            depth = next.depth;
            rebuild();
        }
    });

    return ground;
}

// Shared by every drift() value, so two values with the same options compare equal field by field.
function startDrift(this: DriftGround, previous: GroundLayer | undefined): GroundLayer {
    const configure = previous && reconfigure.get(previous);

    if (previous && configure) {
        configure(this);

        return previous;
    }

    return createDrift(this);
}

/**
 * Lets flakes that reach the bottom of the canvas settle into a layer of snow that builds up: the bottom of the
 * viewport for the page overlay, the bottom of the element otherwise. More and bigger flakes pile up faster. It
 * returns plain data, so two calls with the same options compare equal, and one value can serve several snowfalls,
 * each with a drift of its own.
 *
 * @example
 * createSnow({ ground: drift({ depth: 40 }) });
 */
export function drift(options: DriftOptions = {}): Ground {
    const ground: DriftGround = {
        depth: finitePositiveOr(options.depth, DEFAULT_DEPTH),
        melt: finitePositiveOr(options.melt, 0),
        start: startDrift,
    };

    return ground;
}
