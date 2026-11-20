import type { SnowOptions } from "@zimaleto/zima-react";
import type { RefObject } from "react";

/** What every view of the stage gets: the snow options, whether the snow is paused, and a ref for its canvas. */
export type SnowViewProps = {
    options: SnowOptions;
    isPaused: boolean;
    canvasRef: RefObject<HTMLCanvasElement | null>;
};
