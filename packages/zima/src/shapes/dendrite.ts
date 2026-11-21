import { DENDRITE_DESIGN } from "./constants";
import { drawStellar } from "./stellar";
import type { Shape } from "./types";

/** The classic fern-like snowflake: six arms with rows of side branches that shorten towards the tip. */
export const dendrite: Shape = (context, radius) => drawStellar(context, radius, DENDRITE_DESIGN);
