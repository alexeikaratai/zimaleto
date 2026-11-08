import { Snowfall, type SnowOptions, useSnowfall } from "@zimaleto/zima-react";
import { type ReactElement, useRef } from "react";
import { type PlaygroundOptions, type TargetMode, toSnowOptions } from "./options";
import { toShapes } from "./shapes";

export type SnowStageProps = {
    mode: TargetMode;
    options: PlaygroundOptions;
    paused: boolean;
};

type SnowViewProps = {
    options: SnowOptions;
    paused: boolean;
};

const CAPTIONS: Record<TargetMode, string> = {
    container: "<Snowfall /> fills its parent, which needs a position other than static.",
    canvas: "useSnowfall(canvasRef, options) snows on a canvas you render yourself.",
    page: "<Snowfall fullscreen /> covers the viewport. Clicks pass through it.",
};

function ContainerSnow({ options, paused }: SnowViewProps): ReactElement {
    return (
        <div className="snow-surface">
            <h2 className="snow-title">Let it snow</h2>
            <Snowfall
                {...options}
                paused={paused}
            />
        </div>
    );
}

function CanvasSnow({ options, paused }: SnowViewProps): ReactElement {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    useSnowfall(canvasRef, { ...options, paused });

    return (
        <canvas
            ref={canvasRef}
            className="snow-surface"
        />
    );
}

function PageSnow({ options, paused }: SnowViewProps): ReactElement {
    return (
        <>
            <div className="snow-surface">
                <h2 className="snow-title">Let it snow</h2>
            </div>
            <Snowfall
                {...options}
                fullscreen
                paused={paused}
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
export function SnowStage({ mode, options, paused }: SnowStageProps): ReactElement {
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
                paused={paused}
            />
        </main>
    );
}
