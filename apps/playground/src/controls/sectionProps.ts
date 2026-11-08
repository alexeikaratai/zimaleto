import type { PlaygroundOptions } from "../options/playgroundOptions";

/** What every options section gets: the current options and a way to change some of them. */
export type SectionProps = {
    options: PlaygroundOptions;
    onOptionsChange: (changes: Partial<PlaygroundOptions>) => void;
};
