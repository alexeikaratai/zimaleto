import type { Shape } from "./shape";
import { drawStellar, type StellarDesign } from "./stellar";

const DENDRITE: StellarDesign = {
    armWidth: 0.08,
    branchPairs: 4,
    branchStart: 0.25,
    branchLength: 0.42,
    ringSize: 0,
};

/** The classic fern-like snowflake: six arms with rows of side branches that shorten towards the tip. */
export const dendrite: Shape = (context, radius) => drawStellar(context, radius, DENDRITE);
