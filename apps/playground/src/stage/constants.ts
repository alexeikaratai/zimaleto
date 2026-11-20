import type { ReactElement } from "react";
import type { TargetMode } from "../options";
import { CanvasSnow } from "./CanvasSnow";
import { ContainerSnow } from "./ContainerSnow";
import { PageSnow } from "./PageSnow";
import type { SnowViewProps } from "./types";

/** The call each target makes, shown above the snow. */
export const CAPTIONS: Record<TargetMode, string> = {
    container: "<Snowfall /> fills its parent, which needs a position other than static.",
    canvas: "useSnowfall(canvasRef, options) snows on a canvas you render yourself.",
    page: "<Snowfall fullscreen /> covers the viewport. Clicks pass through it.",
};

/** The view that shows the snow for each target. */
export const VIEWS: Record<TargetMode, (props: SnowViewProps) => ReactElement> = {
    container: ContainerSnow,
    canvas: CanvasSnow,
    page: PageSnow,
};
