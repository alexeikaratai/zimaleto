import { Snowfall } from "@zimaleto/zima-react";
import type { ReactElement } from "react";
import type { SnowViewProps } from "./snowViewProps";

/** `<Snowfall>` filling an element. */
export function ContainerSnow({ options, isPaused, canvasRef }: SnowViewProps): ReactElement {
    return (
        <div className="snow-surface">
            <h2 className="snow-title">Let it snow</h2>
            <Snowfall
                {...options}
                ref={canvasRef}
                paused={isPaused}
            />
        </div>
    );
}
