import type { ReactElement } from "react";
import type { PlaygroundOptions } from "../../options";
import { NO_VALUE } from "./constants";
import { describeCanvas, describeFlakes, formatMs } from "./format";
import type { LiveStats } from "./types";

export type LiveStatsListProps = {
    live: LiveStats;
    options: PlaygroundOptions;
};

/** The live frame statistics, the flake count and the canvas size, with a dash for what can't be measured yet. */
export function LiveStatsList({ live, options }: LiveStatsListProps): ReactElement {
    const { frames, canvas } = live;
    const hasFrames = frames.frameRate > 0;
    const frameRateText = hasFrames ? `${Math.round(frames.frameRate)} fps` : NO_VALUE;
    const intervalText = hasFrames
        ? `${formatMs(frames.medianIntervalMs)}, p95 ${formatMs(frames.p95IntervalMs)}`
        : NO_VALUE;
    const workText = hasFrames ? `${formatMs(frames.workMs, 2)} a frame` : NO_VALUE;

    return (
        <dl className="stats">
            <dt>Frame rate</dt>
            <dd>{frameRateText}</dd>
            <dt>Frame interval</dt>
            <dd>{intervalText}</dd>
            <dt>Snow work</dt>
            <dd>{workText}</dd>
            <dt>Flakes</dt>
            <dd>{describeFlakes(options, canvas)}</dd>
            <dt>Canvas</dt>
            <dd>{describeCanvas(canvas)}</dd>
        </dl>
    );
}
