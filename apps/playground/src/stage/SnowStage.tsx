import type { ReactElement, RefObject } from "react";
import { type PlaygroundOptions, type TargetMode, toSnowOptions } from "../options";
import { CAPTIONS, VIEWS } from "./constants";

export type SnowStageProps = {
    mode: TargetMode;
    options: PlaygroundOptions;
    isPaused: boolean;
    canvasRef: RefObject<HTMLCanvasElement | null>;
};

/** Shows the snow for the chosen target through the React wrapper. */
export function SnowStage({ mode, options, isPaused, canvasRef }: SnowStageProps): ReactElement {
    const View = VIEWS[mode];
    // The wrapper compares options by value, so rebuilding the shapes list on every render is fine.
    const snowOptions = toSnowOptions(options);

    return (
        <main className="stage">
            <p className="stage-caption">
                <code>{CAPTIONS[mode]}</code>
            </p>
            <View
                key={mode}
                options={snowOptions}
                isPaused={isPaused}
                canvasRef={canvasRef}
            />
        </main>
    );
}
