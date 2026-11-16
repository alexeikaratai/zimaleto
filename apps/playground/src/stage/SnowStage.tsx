import type { ReactElement, RefObject } from "react";
import { type PlaygroundOptions, type TargetMode, toSnowOptions } from "../options/playgroundOptions";
import { toShapes } from "../options/shapes";
import { CanvasSnow } from "./CanvasSnow";
import { ContainerSnow } from "./ContainerSnow";
import { PageSnow } from "./PageSnow";
import type { SnowViewProps } from "./snowViewProps";

export type SnowStageProps = {
    mode: TargetMode;
    options: PlaygroundOptions;
    isPaused: boolean;
    canvasRef: RefObject<HTMLCanvasElement | null>;
};

const CAPTIONS: Record<TargetMode, string> = {
    container: "<Snowfall /> fills its parent, which needs a position other than static.",
    canvas: "useSnowfall(canvasRef, options) snows on a canvas you render yourself.",
    page: "<Snowfall fullscreen /> covers the viewport. Clicks pass through it.",
};

const VIEWS: Record<TargetMode, (props: SnowViewProps) => ReactElement> = {
    container: ContainerSnow,
    canvas: CanvasSnow,
    page: PageSnow,
};

/** Shows the snow for the chosen target through the React wrapper. */
export function SnowStage({ mode, options, isPaused, canvasRef }: SnowStageProps): ReactElement {
    const View = VIEWS[mode];
    // The wrapper compares options by value, so rebuilding the shapes list on every render is fine.
    const snowOptions = toSnowOptions(options, toShapes(options.shapeWeights));

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
