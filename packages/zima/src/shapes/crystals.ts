import { between, createRandom, type Random } from "../physics/random";
import type { Shape } from "./shape";
import { drawStellar, type StellarDesign } from "./stellar";

// Each crystal is one more sprite per color, so the count stays small.
const MAX_COUNT = 32;
const MAX_BRANCH_PAIRS = 4;

const crystalSets = new Map<string, readonly Shape[]>();

/** Rolls a crystal's design. Every design reads as a real crystal, because the drawing keeps it symmetric. */
export function designStellar(random: Random): StellarDesign {
    const armWidth = between([0.05, 0.1], random());
    const branchPairs = 1 + Math.floor(random() * MAX_BRANCH_PAIRS);
    const branchStart = between([0.2, 0.5], random());
    const branchLength = between([0.15, 0.4], random());
    const hasCenter = random() < 0.5;
    const centerSize = between([0.12, 0.25], random());
    const hasTips = random() < 0.5;
    const tipSize = between([0.08, 0.16], random());

    return {
        armWidth,
        branchPairs,
        branchStart,
        branchLength,
        centerSize: hasCenter ? centerSize : 0,
        tipSize: hasTips ? tipSize : 0,
    };
}

/**
 * Different stellar crystals: six arms with mirror-symmetric side branches, and some with a hexagon at the center or
 * plates at the tips. The same arguments always return the same array of the same shapes, so calling it inline
 * doesn't rebuild sprites, and the designs are the same on every page load.
 *
 * @example
 * createSnow({ size: [4, 12], shapes: [...crystals(8), dot] });
 *
 * @param count - How many crystals, rounded and kept within 1–32. Each one is a sprite per color.
 * @param seed - Picks other designs. It's independent of the snow's `seed` option.
 */
export function crystals(count: number, seed = 0): readonly Shape[] {
    const length = Math.min(MAX_COUNT, Math.max(1, Math.round(count) || 1));
    const key = `${length} ${seed}`;
    const cached = crystalSets.get(key);

    if (cached) {
        return cached;
    }

    const random = createRandom(seed);
    const shapes = Array.from({ length }, (): Shape => {
        const design = designStellar(random);

        return (context, radius) => drawStellar(context, radius, design);
    });
    crystalSets.set(key, shapes);

    return shapes;
}
