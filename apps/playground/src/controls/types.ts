import type { PlaygroundOptions } from "../options";

/** What every options section gets: the current options and a way to change some of them. */
export type SectionProps = {
    options: PlaygroundOptions;
    onOptionsChange: (changes: Partial<PlaygroundOptions>) => void;
};

/** How the Amount section counts flakes: a fixed number, or a density that follows the canvas area. */
export type AmountMode = "count" | "density";
