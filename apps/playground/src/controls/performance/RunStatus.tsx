import type { ReactElement } from "react";
import { BaselineTable } from "./BaselineTable";
import { STOP_MESSAGES } from "./constants";
import { formatCount } from "./format";
import type { BaselineRun } from "./types";

export type RunStatusProps = {
    run: BaselineRun;
};

/** What the baseline run is doing: how it works before the first run, its progress, why it stopped, or its results. */
export function RunStatus({ run }: RunStatusProps): ReactElement {
    switch (run.status) {
        case "idle":
            return (
                <p className="field-hint">
                    The baseline finds how many flakes keep the full frame rate at pixel ratios 1 and 2, then measures
                    150, 1,000 and 5,000 flakes. It takes about a minute; keep the tab in front.
                </p>
            );
        case "running":
            return (
                <p
                    className="field-hint"
                    role="status"
                >
                    Measuring {formatCount(run.count)} flakes at pixel ratio {run.maxDpr}…
                </p>
            );
        case "stopped":
            return (
                <p
                    className="field-hint"
                    role="status"
                >
                    {STOP_MESSAGES[run.reason]}
                </p>
            );
        case "done":
            return <BaselineTable baseline={run.baseline} />;
    }
}
