import type { Shape } from "./shape";
import { drawStellar, type StellarDesign } from "./stellar";

const DENDRITE: StellarDesign = {
    armWidth: 0.06,
    branchPairs: 4,
    branchStart: 0.3,
    branchLength: 0.35,
    centerSize: 0,
    tipSize: 0,
};

/** The classic fern-like snowflake: six arms with rows of side branches that shorten towards the tip. */
export const dendrite: Shape = (context, radius) => drawStellar(context, radius, DENDRITE);
