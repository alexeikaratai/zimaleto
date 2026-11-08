import type { Shape } from "./shape";

const shapesBySource = new Map<string, Shape>();

/**
 * A flake drawn from a picture, scaled to the flake's size. It ignores the flake color.
 * The picture starts loading when a snowfall first needs it, so calling `image()` during
 * server rendering is safe. Flakes with this shape appear once it has loaded; if it fails
 * to load, they never appear. The same source always gives the same shape.
 *
 * @param source - The picture's URL, including `data:` and `blob:` URLs.
 */
export function image(source: string): Shape {
    const cached = shapesBySource.get(source);

    if (cached) {
        return cached;
    }

    let picture: HTMLImageElement | undefined;
    let ready: Promise<unknown> | undefined;

    const draw = (context: CanvasRenderingContext2D, radius: number): void => {
        context.drawImage(picture as HTMLImageElement, -radius, -radius, radius * 2, radius * 2);
    };
    const shape: Shape = Object.defineProperty(draw, "ready", {
        get(): Promise<unknown> {
            if (!ready) {
                picture = new Image();
                picture.src = source;
                // A broken picture would make drawImage() throw, so a failed load never resolves.
                ready = picture.decode().catch(() => new Promise<never>(() => undefined));
            }

            return ready;
        },
    });
    shapesBySource.set(source, shape);

    return shape;
}
