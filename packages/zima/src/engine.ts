import { countFlakes, normalizeOptions, reduceMotion, type Settings, type SnowOptions } from "./options";
import { type Flake, gustAt, MAX_STEP_MS, rollFlake, spawnFlake, step, swayOffset } from "./physics";
import { createRandom, type Random } from "./random";
import type { Shape } from "./shapes/shape";

/** A running snowfall. */
export type Snow = {
    /** The canvas the snow is drawn on: the one you passed in, or the one `createSnow()` added. */
    readonly canvas: HTMLCanvasElement;
    /** Resumes the animation after `stop()`. Reduced motion still applies. */
    start(): void;
    /** Pauses the animation. Only `start()` resumes it; showing the tab again doesn't. */
    stop(): void;
    /** Changes options live, without re-creating anything. A key set to `undefined` goes back to its default. */
    update(options: SnowOptions): void;
    /** Stops the loop, disconnects observers and removes the canvas it added. Calling it again does nothing. */
    destroy(): void;
};

/** Where frames come from. The browser clock wraps `requestAnimationFrame`; tests drive frames by hand. */
export type Clock = {
    requestFrame(callback: (time: number) => void): number;
    cancelFrame(handle: number): void;
};

const CANVAS_STYLE = "inset:0;width:100%;height:100%;pointer-events:none;position:";
// One second minus 10% slack, so a 30 fps cap on a 60 Hz display draws every other frame instead of every third.
const SLACKED_SECOND_MS = 900;
// A sprite spans 1.25 radii each way, so strokes and glyphs that overshoot the radius aren't cut off.
const SPRITE_EXTENT = 1.25;

export function createEngine(target: HTMLElement | undefined, initialOptions: SnowOptions, clock: Clock): Snow {
    const ownsCanvas = target?.tagName !== "CANVAS";
    const canvas = ownsCanvas ? document.createElement("canvas") : (target as HTMLCanvasElement);
    const context = canvas.getContext("2d") as CanvasRenderingContext2D;
    const motionQuery = matchMedia("(prefers-reduced-motion: reduce)");
    let options = initialOptions;
    let settings: Settings;
    let random: Random;
    let flakeLook = "";
    let shapesOption: SnowOptions["shapes"];
    const flakes: Flake[] = [];
    // One pre-rendered canvas per shape and color, at the largest flake size.
    let sprites = new Map<Shape, Map<string, HTMLCanvasElement>>();
    // Shapes with a `ready` promise: false while it's pending, true once it resolved.
    const loadedShapes = new WeakMap<Shape, boolean>();
    let width = 0;
    let height = 0;
    let ratio = 0;
    let animationMs = 0;
    let lastFrameTime = Number.NEGATIVE_INFINITY;
    let frameHandle: number | undefined;
    let resolutionQuery: MediaQueryList;
    let restorePosition: (() => void) | undefined;
    let isStatic = false;
    let isStopped = false;
    let isOffscreen = false;
    let isDestroyed = false;

    function clear(): void {
        context.setTransform(1, 0, 0, 1, 0, 0);
        context.clearRect(0, 0, canvas.width, canvas.height);
    }

    function isLoaded(shape: Shape): boolean {
        const { ready } = shape;

        if (ready && !loadedShapes.has(shape)) {
            loadedShapes.set(shape, false);
            ready.then(() => {
                loadedShapes.set(shape, true);
                if (!isDestroyed) {
                    render();
                }
            });
        }

        return !ready || loadedShapes.get(shape) === true;
    }

    function spriteFor(shape: Shape, color: string): HTMLCanvasElement | undefined {
        let byColor = sprites.get(shape);
        if (!byColor) {
            byColor = new Map();
            sprites.set(shape, byColor);
        }

        let sprite = byColor.get(color);
        if (!sprite && isLoaded(shape)) {
            const radius = settings.size[1] * ratio;
            // At least one pixel: drawImage() throws on an empty canvas.
            const half = Math.max(1, Math.ceil(radius * SPRITE_EXTENT));
            sprite = document.createElement("canvas");
            sprite.width = half * 2;
            sprite.height = half * 2;
            const spriteContext = sprite.getContext("2d") as CanvasRenderingContext2D;
            spriteContext.translate(half, half);
            spriteContext.fillStyle = color;
            spriteContext.strokeStyle = color;
            shape(spriteContext, radius);
            byColor.set(color, sprite);
        }

        return sprite;
    }

    function draw(): void {
        clear();

        for (const flake of flakes) {
            const sprite = spriteFor(flake.shape, flake.color);

            if (sprite) {
                const cos = Math.cos(flake.angle) * ratio;
                const sin = Math.sin(flake.angle) * ratio;
                const extent = flake.radius * SPRITE_EXTENT;

                context.setTransform(cos, sin, -sin, cos, (flake.x + swayOffset(flake)) * ratio, flake.y * ratio);
                context.globalAlpha = flake.opacity;
                context.drawImage(sprite, -extent, -extent, extent * 2, extent * 2);
            }
        }
    }

    function frame(time: number): void {
        frameHandle = clock.requestFrame(frame);
        // The first frame after a start sees an infinite gap, which passes the cap and is clamped by step().
        const elapsedMs = time - lastFrameTime;

        if (settings.fps && elapsedMs * settings.fps < SLACKED_SECOND_MS) {
            return;
        }

        lastFrameTime = time;
        animationMs += Math.min(elapsedMs, MAX_STEP_MS);
        step(flakes, elapsedMs, {
            width,
            height,
            wind: settings.wind + gustAt(animationMs / 1000, settings.gust),
            random,
        });
        draw();
    }

    function sync(): void {
        const isHidden = settings.pauseWhenHidden && (document.hidden || isOffscreen);
        const shouldAnimate = !isDestroyed && !isStopped && !isStatic && !isHidden;

        if (shouldAnimate && frameHandle === undefined) {
            lastFrameTime = Number.NEGATIVE_INFINITY;
            frameHandle = clock.requestFrame(frame);
        } else if (!shouldAnimate && frameHandle !== undefined) {
            clock.cancelFrame(frameHandle);
            frameHandle = undefined;
        }
    }

    function render(): void {
        const nextRatio = Math.min(devicePixelRatio, settings.maxDpr);

        if (nextRatio !== ratio) {
            ratio = nextRatio;
            sprites = new Map();
            width = -1;
        }

        if (canvas.clientWidth !== width || canvas.clientHeight !== height) {
            width = canvas.clientWidth;
            height = canvas.clientHeight;
            canvas.width = Math.round(width * ratio);
            canvas.height = Math.round(height * ratio);
        }

        const count = countFlakes(settings, width, height);
        flakes.length = Math.min(flakes.length, count);
        while (flakes.length < count) {
            flakes.push(spawnFlake(settings, random, width, height));
        }

        sync();
        // Without a running loop, nothing else would show the resized or changed snow.
        if (frameHandle === undefined) {
            draw();
        }
    }

    function applyOptions(): void {
        const base = normalizeOptions(options);
        const prefersReducedMotion = motionQuery.matches;
        isStatic = prefersReducedMotion && base.reducedMotion === "static";
        settings = prefersReducedMotion && base.reducedMotion === "reduce" ? reduceMotion(base) : base;
        random = settings.seed === undefined ? Math.random : createRandom(settings.seed);

        const { size, speed, opacity, colors, sway, rotation, parallax, seed } = settings;
        // Shapes are functions, which JSON can't compare, so the option itself is compared by reference.
        const look = JSON.stringify([size, speed, opacity, colors, sway, rotation, parallax, seed]);
        if (look !== flakeLook || options.shapes !== shapesOption) {
            flakeLook = look;
            shapesOption = options.shapes;
            sprites = new Map();
            for (const flake of flakes) {
                rollFlake(flake, settings, random);
            }
        }

        render();
    }

    // A resolution query matches one exact ratio, so each change re-arms a query for the new one.
    function watchResolution(): void {
        resolutionQuery = matchMedia(`(resolution: ${devicePixelRatio}dppx)`);
        resolutionQuery.addEventListener("change", handleResolutionChange, { once: true });
    }

    function handleResolutionChange(): void {
        watchResolution();
        render();
    }

    // Skips the first report, which only repeats the size render() already measured.
    const resizeObserver = new ResizeObserver(() => {
        if (canvas.clientWidth !== width || canvas.clientHeight !== height) {
            render();
        }
    });
    const intersectionObserver = new IntersectionObserver((entries) => {
        isOffscreen = !entries.at(-1)?.isIntersecting;
        sync();
    });

    if (ownsCanvas) {
        canvas.setAttribute("aria-hidden", "true");
        canvas.style.cssText = CANVAS_STYLE + (target ? "absolute" : "fixed;z-index:9999");

        if (target && getComputedStyle(target).position === "static") {
            const { position } = target.style;
            target.style.position = "relative";
            restorePosition = () => {
                target.style.position = position;
            };
        }

        (target ?? document.body).append(canvas);
    }

    resizeObserver.observe(canvas);
    intersectionObserver.observe(canvas);
    document.addEventListener("visibilitychange", sync);
    motionQuery.addEventListener("change", applyOptions);
    watchResolution();
    applyOptions();

    return {
        canvas,
        start() {
            isStopped = false;
            sync();
        },
        stop() {
            isStopped = true;
            sync();
        },
        update(changes) {
            if (!isDestroyed) {
                // A key set to undefined replaces the old value, so normalizeOptions() falls back to its default.
                options = { ...options, ...changes };
                applyOptions();
            }
        },
        destroy() {
            if (isDestroyed) {
                return;
            }

            isDestroyed = true;
            sync();
            resizeObserver.disconnect();
            intersectionObserver.disconnect();
            document.removeEventListener("visibilitychange", sync);
            motionQuery.removeEventListener("change", applyOptions);
            resolutionQuery.removeEventListener("change", handleResolutionChange);
            restorePosition?.();

            if (ownsCanvas) {
                canvas.remove();
            } else {
                clear();
            }
        },
    };
}
