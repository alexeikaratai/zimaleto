import type { Bounds } from "../options";
import type { StellarDesign } from "./types";

/** How many arms a snow crystal has: ice grows in hexagons. */
export const ARMS = 6;

/** The share of the radius that a bokeh flake keeps fully opaque before the fade starts. */
export const BOKEH_CORE = 0.2;

/** How wide the crystal's strokes are, as a share of the radius. */
export const CRYSTAL_LINE_WIDTH = 0.12;
/** Where the crystal's branches leave the arm, as a share of the radius. */
export const CRYSTAL_BRANCH_START = 0.55;
/** The far end of a crystal branch that leaves the arm at 45° and is 0.3 radii long. */
export const CRYSTAL_BRANCH_END_X: number = CRYSTAL_BRANCH_START + 0.3 * Math.SQRT1_2;
/** The far end of a crystal branch that leaves the arm at 45° and is 0.3 radii long. */
export const CRYSTAL_BRANCH_END_Y: number = 0.3 * Math.SQRT1_2;

export const STAR_POINTS = 5;
/** How far the star's inner corners reach, as a share of the radius. */
export const STAR_INNER_RADIUS = 0.45;

/** The classic dendrite: four rows of long side branches and no ring. */
export const DENDRITE_DESIGN: StellarDesign = {
    armWidth: 0.08,
    branchPairs: 4,
    branchStart: 0.25,
    branchLength: 0.42,
    ringSize: 0,
};

/** Where the last pair of side branches leaves a stellar arm, as a share of the radius. */
export const LAST_BRANCH = 0.85;
/** Ice grows its side branches at 60° to the arm. */
export const BRANCH_ANGLE: number = Math.PI / 3;
/** A side branch starts thinner than the arm where it grows, by this share. */
export const BRANCH_WIDTH = 0.7;
/** The share of its base width that an arm or a branch keeps at its end. */
export const TIP_WIDTH = 0.3;
/** Half a pixel either side, so the thinnest parts don't fade in small sprites. */
export const MIN_HALF_WIDTH = 0.5;

/** Each generated crystal is one more sprite per color, so the count stays small. */
export const MAX_CRYSTALS = 32;
/** A single pair of side branches looks sparse, and five crowd the arm. */
export const MIN_BRANCH_PAIRS = 2;
/** How many branch-pair counts a generated crystal picks from, starting at `MIN_BRANCH_PAIRS`. */
export const BRANCH_PAIR_CHOICES = 3;
/** The arm widths a generated crystal picks from, as shares of the radius. */
export const ARM_WIDTHS: Bounds = [0.06, 0.1];
/** Where a generated crystal's first side branches may start, as shares of the radius. */
export const BRANCH_STARTS: Bounds = [0.25, 0.45];
/** How long a generated crystal's first side branches may be, as shares of the radius. */
export const BRANCH_LENGTHS: Bounds = [0.25, 0.45];
/** How likely a generated crystal is to have a hexagonal ring. */
export const RING_CHANCE = 0.5;
/** How far a generated crystal's ring may reach, as shares of the radius. */
export const RING_SIZES: Bounds = [0.15, 0.3];
