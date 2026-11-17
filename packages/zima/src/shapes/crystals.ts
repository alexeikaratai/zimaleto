import { between, createRandom, type Random } from "../physics/random";
import type { Shape } from "./shape";
import { drawStellar, type StellarDesign } from "./stellar";

// Each crystal is one more sprite per color, so the count stays small.
const MAX_COUNT = 32;
// A single pair looks sparse, and five crowd the arm.
const MIN_BRANCH_PAIRS = 2;
const BRANCH_PAIR_CHOICES = 3;

const crystalSets = new Map<string, readonly Shape[]>();

/** Rolls a crystal's design. Every design reads as a real crystal, because the drawing keeps it symmetric. */
export function designStellar(random: Random): StellarDesign {
    const armWidth = between([0.06, 0.1], random());
    const branchPairs = MIN_BRANCH_PAIRS + Math.floor(random() * BRANCH_PAIR_CHOICES);
    const branchStart = between([0.25, 0.45], random());
    const branchLength = between([0.25, 0.45], random());
    const hasRing = random() < 0.5;
    const ringSize = between([0.15, 0.3], random());

    return {
        armWidth,
        branchPairs,
        branchStart,
        branchLength,
        ringSize: hasRing ? ringSize : 0,
    };
}

/**
 * Different stellar crystals: six tapering arms with mirror-symmetric side branches, and some with a hexagonal ring
 * around the center. The same arguments always return the same array of the same shapes, so calling it inline
 * doesn't rebuild sprites, and the designs are the same on every page load.
 *
 * @example
 * createSnow({ size: [4, 12], shapes: [...crystals(8), dot] });
 *
 * @param count - How many crystals, rounded and kept within 1–32. Each one is a sprite per color.
 * @param seed - Picks other designs; only its whole part counts. It's independent of the snow's `seed` option.
 */
export function crystals(count: number, seed = 0): readonly Shape[] {
    const length = Math.min(MAX_COUNT, Math.max(1, Math.round(count) || 1));
    // The generator keeps only the seed's whole part, so seeds that give the same designs share an array.
    const key = `${length} ${seed >>> 0}`;
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
