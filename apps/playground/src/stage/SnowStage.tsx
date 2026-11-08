import { Snowfall, type SnowOptions, useSnowfall } from "@zimaleto/zima-react";
import { type ReactElement, useRef } from "react";
import { type PlaygroundOptions, type TargetMode, toSnowOptions } from "../options/playgroundOptions";
import { toShapes } from "../options/shapes";

export type SnowStageProps = {
    mode: TargetMode;
    options: PlaygroundOptions;
    isPaused: boolean;
};

type SnowViewProps = {
    options: SnowOptions;
    isPaused: boolean;
};

const CAPTIONS: Record<TargetMode, string> = {
    container: "<Snowfall /> fills its parent, which needs a position other than static.",
    canvas: "useSnowfall(canvasRef, options) snows on a canvas you render yourself.",
    page: "<Snowfall fullscreen /> covers the viewport. Clicks pass through it.",
};

function ContainerSnow({ options, isPaused }: SnowViewProps): ReactElement {
    return (
        <div className="snow-surface">
            <h2 className="snow-title">Let it snow</h2>
            <Snowfall
                {...options}
                paused={isPaused}
            />
        </div>
    );
}

function CanvasSnow({ options, isPaused }: SnowViewProps): ReactElement {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    useSnowfall(canvasRef, { ...options, paused: isPaused });

    return (
        <canvas
            ref={canvasRef}
            className="snow-surface"
        />
    );
}

function PageSnow({ options, isPaused }: SnowViewProps): ReactElement {
    return (
        <>
            <div className="snow-surface">
                <h2 className="snow-title">Let it snow</h2>
            </div>
            <Snowfall
                {...options}
                fullscreen
                paused={isPaused}
            />
        </>
    );
}

const VIEWS: Record<TargetMode, (props: SnowViewProps) => ReactElement> = {
    container: ContainerSnow,
    canvas: CanvasSnow,
    page: PageSnow,
};

/** Shows the snow for the chosen target through the React wrapper. */
export function SnowStage({ mode, options, isPaused }: SnowStageProps): ReactElement {
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
            />
        </main>
    );
}
