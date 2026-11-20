import type { ReactElement } from "react";
import { labelShapes } from "../../options";
import { ShapeTile } from "./ShapeTile";

export type ShapeGalleryProps = {
    crystalCount: number;
    color: string;
};

/** Every shape drawn large, each generated crystal on its own, to see the detail that small flakes lose. */
export function ShapeGallery({ crystalCount, color }: ShapeGalleryProps): ReactElement {
    const shapes = labelShapes(crystalCount);

    return (
        <div className="shape-gallery">
            {shapes.map(({ label, shape }) => (
                <ShapeTile
                    key={label}
                    label={label}
                    shape={shape}
                    color={color}
                />
            ))}
        </div>
    );
}
