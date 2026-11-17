import { renderSprite } from "../../engine/sprites";
import type { Shape } from "../../shapes/shape";

/** The radius tests render shapes at, in px: the sprite is 100 px square. */
export const TEST_RADIUS = 40;

/** A square sprite's opacity, from 0 to 1 for each pixel, row by row. */
export type SpritePixels = {
    size: number;
    alpha: number[];
};

/** How a sprite is compared with itself: turned by 180°, or mirrored across the horizontal axis. */
export type Symmetry = "turn" | "mirror";

/** Renders a shape in white the way the engine does, and reads the sprite's opacity. */
export function renderPixels(shape: Shape): SpritePixels {
    const sprite = renderSprite(shape, "#fff", TEST_RADIUS);
    const context = sprite.getContext("2d") as CanvasRenderingContext2D;
    const { data } = context.getImageData(0, 0, sprite.width, sprite.height);
    const alpha: number[] = [];

    for (let index = 3; index < data.length; index += 4) {
        alpha.push((data[index] as number) / 255);
    }

    return { size: sprite.width, alpha };
}

/** The opacity at a point given in radii from the center, with y growing downwards as on the canvas. */
export function alphaAt({ size, alpha }: SpritePixels, x: number, y: number): number {
    const column = Math.floor(size / 2 + x * TEST_RADIUS);
    const row = Math.floor(size / 2 + y * TEST_RADIUS);

    return alpha[row * size + column] as number;
}

/** The highest opacity on the sprite's outermost ring of pixels. */
export function borderAlpha({ size, alpha }: SpritePixels): number {
    let highest = 0;

    alpha.forEach((value, index) => {
        const row = Math.floor(index / size);
        const column = index % size;
        const isBorder = row === 0 || column === 0 || row === size - 1 || column === size - 1;

        if (isBorder) {
            highest = Math.max(highest, value);
        }
    });

    return highest;
}

/** How much of the flake's circle the sprite paints, with each pixel counted by its opacity. */
export function circleShare({ alpha }: SpritePixels): number {
    const area = alpha.reduce((total, value) => total + value, 0);

    return area / (Math.PI * TEST_RADIUS ** 2);
}

/** How much a sprite differs from its turned or mirrored self, as a share of its total opacity. */
export function asymmetry({ size, alpha }: SpritePixels, symmetry: Symmetry): number {
    let difference = 0;
    let total = 0;

    alpha.forEach((value, index) => {
        const row = Math.floor(index / size);
        const column = index % size;
        const otherColumn = symmetry === "turn" ? size - 1 - column : column;
        const other = alpha[(size - 1 - row) * size + otherColumn] as number;

        difference += Math.abs(value - other);
        total += value;
    });

    return difference / total;
}

/** Whether two sprites have the same opacity everywhere. */
export function isSamePixels(first: SpritePixels, second: SpritePixels): boolean {
    return first.alpha.every((value, index) => value === second.alpha[index]);
}
