import type { Shape } from "./shape";

const shapesByGlyph = new Map<string, Shape>();

/**
 * A flake drawn from text, such as `text("❄")` or an emoji. Color emoji keep their own colors.
 * The same glyph and font always give the same shape, so calling it inline doesn't rebuild sprites.
 *
 * @param glyph - The character or emoji to draw.
 * @param font - A CSS font family.
 */
export function text(glyph: string, font = "serif"): Shape {
    const key = `${glyph}\n${font}`;
    const cached = shapesByGlyph.get(key);

    if (cached) {
        return cached;
    }

    const shape: Shape = (context, radius) => {
        context.font = `${radius * 2}px ${font}`;
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.fillText(glyph, 0, 0);
    };
    shapesByGlyph.set(key, shape);

    return shape;
}
