import { between, createRandom, type Random } from "../physics";
import {
    ARM_WIDTHS,
    BRANCH_LENGTHS,
    BRANCH_PAIR_CHOICES,
    BRANCH_STARTS,
    MAX_CRYSTALS,
    MIN_BRANCH_PAIRS,
    RING_CHANCE,
    RING_SIZES,
} from "./constants";
import { drawStellar } from "./stellar";
import type { Shape, StellarDesign } from "./types";

const crystalSets = new Map<string, readonly Shape[]>();

/** Rolls a crystal's design. Every design reads as a real crystal, because the drawing keeps it symmetric. */
export function designStellar(random: Random): StellarDesign {
    const armWidth = between(ARM_WIDTHS, random());
    const branchPairs = MIN_BRANCH_PAIRS + Math.floor(random() * BRANCH_PAIR_CHOICES);
    const branchStart = between(BRANCH_STARTS, random());
    const branchLength = between(BRANCH_LENGTHS, random());
    const hasRing = random() < RING_CHANCE;
    const ringSize = between(RING_SIZES, random());

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
    const length = Math.min(MAX_CRYSTALS, Math.max(1, Math.round(count) || 1));
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
