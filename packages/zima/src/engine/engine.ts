import { countFlakes, normalizeOptions, reduceMotion, type Settings } from "../options/settings";
import type { SnowOptions } from "../options/snowOptions";
import { type Flake, rollFlake, spawnFlake } from "../physics/flake";
import { gustAt, limitStep, step, swayOffset } from "../physics/motion";
import { createRandom, type Random } from "../physics/random";
import { mountCanvas } from "./canvas";
import type { Clock } from "./clock";
import { createSpriteCache, SPRITE_EXTENT } from "./sprites";

/** A running snowfall. */
export type Snow = {
    /** The canvas the snow is drawn on: the one you passed in, or the one `createSnow()` added. */
    readonly canvas: HTMLCanvasElement;
    /** Resumes the animation after `stop()`. Reduced motion still applies. */
    start(): void;
    /** Pauses the animation and keeps the last frame on screen. Only `start()` resumes it; showing the tab again doesn't. */
    stop(): void;
    /** Changes options live, without re-creating anything. A key set to `undefined` goes back to its default. */
    update(options: SnowOptions): void;
    /** Stops the loop, disconnects observers and removes the canvas it added. Calling it again does nothing. */
    destroy(): void;
};

// One second minus 10% slack, so a 30 fps cap on a 60 Hz display draws every other frame instead of every third.
const SLACKED_SECOND_MS = 900;

export function createEngine(target: HTMLElement | undefined, initialOptions: SnowOptions, clock: Clock): Snow {
    const [canvas, unmountCanvas] = mountCanvas(target);
    const context = canvas.getContext("2d") as CanvasRenderingContext2D;
    const motionQuery = matchMedia("(prefers-reduced-motion: reduce)");
    const [spriteFor, resetSprites] = createSpriteCache(handleShapeReady);
    const flakes: Flake[] = [];
    let options = initialOptions;
    let settings: Settings;
    let random: Random;
    // What the flakes were last rolled from, so updates that don't change their look leave them alone.
    let rolledLook = "";
    let rolledShapes: SnowOptions["shapes"];
    // The canvas size in CSS px and the device px per CSS px it's drawn at.
    let width = 0;
    let height = 0;
    let pixelRatio = 0;
    let animationMs = 0;
    let lastFrameTime = Number.NEGATIVE_INFINITY;
    let frameHandle: number | undefined;
    let resolutionQuery: MediaQueryList;
    let isStatic = false;
    let isStopped = false;
    let isOffscreen = false;
    let isDestroyed = false;

    // Also resets what draw() changes, so a canvas target is left as it was found.
    function clear(): void {
        context.setTransform(1, 0, 0, 1, 0, 0);
        context.globalAlpha = 1;
        context.clearRect(0, 0, canvas.width, canvas.height);
    }

    function draw(): void {
        const spriteRadius = settings.size[1] * pixelRatio;
        clear();

        for (const flake of flakes) {
            const sprite = spriteFor(flake.shape, flake.color, spriteRadius);

            if (sprite) {
                const cos = Math.cos(flake.angle) * pixelRatio;
                const sin = Math.sin(flake.angle) * pixelRatio;
                const extent = flake.radius * SPRITE_EXTENT;

                context.setTransform(
                    cos,
                    sin,
                    -sin,
                    cos,
                    (flake.x + swayOffset(flake)) * pixelRatio,
                    flake.y * pixelRatio,
                );
                context.globalAlpha = flake.opacity;
                context.drawImage(sprite, -extent, -extent, extent * 2, extent * 2);
            }
        }
    }

    function frame(time: number): void {
        frameHandle = clock.requestFrame(frame);
        // The first frame after a start sees an infinite gap, which passes the cap and is limited like a stall.
        const elapsedMs = time - lastFrameTime;
        const { fps } = settings;
        const isAheadOfCap = fps > 0 && elapsedMs * fps < SLACKED_SECOND_MS;

        if (isAheadOfCap) {
            return;
        }

        const stepMs = limitStep(elapsedMs, fps);
        lastFrameTime = time;
        animationMs += stepMs;
        step(flakes, stepMs, {
            width,
            height,
            wind: settings.wind + gustAt(animationMs / 1000, settings.gust),
            random,
        });
        draw();
    }

    function syncLoop(): void {
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

    // Sizes the bitmap to the canvas's CSS size times the pixel ratio, and moves the flakes along when that size changes.
    function fitCanvas(): void {
        const nextPixelRatio = Math.min(devicePixelRatio, settings.maxDpr);
        const nextWidth = canvas.clientWidth;
        const nextHeight = canvas.clientHeight;

        if (nextPixelRatio === pixelRatio && nextWidth === width && nextHeight === height) {
            return;
        }

        if (nextPixelRatio !== pixelRatio) {
            resetSprites();
        }

        for (const flake of flakes) {
            // Flakes keep their place relative to the canvas; ones that spawned on an empty canvas get spread out.
            flake.x = width ? (flake.x * nextWidth) / width : random() * nextWidth;
            flake.y = height ? (flake.y * nextHeight) / height : random() * nextHeight;
        }

        pixelRatio = nextPixelRatio;
        width = nextWidth;
        height = nextHeight;
        canvas.width = Math.round(width * pixelRatio);
        canvas.height = Math.round(height * pixelRatio);

        // A canvas without a CSS size takes its size from the bitmap, so it would grow with every resize.
        // Pinning its width is enough: its height follows the bitmap's aspect ratio, which is the CSS size's.
        if (canvas.clientWidth !== width) {
            canvas.style.width = `${width}px`;
        }
    }

    function fitFlakes(): void {
        const count = countFlakes(settings, width, height);

        flakes.length = Math.min(flakes.length, count);
        while (flakes.length < count) {
            flakes.push(spawnFlake(settings, random, width, height));
        }
    }

    // Brings the canvas, the flakes and the loop in line with the current size and settings, and shows the result.
    // It draws even while the loop runs, because resizing the bitmap clears it before the next frame would come.
    function refresh(): void {
        fitCanvas();
        fitFlakes();
        syncLoop();
        draw();
    }

    function applyOptions(): void {
        const base = normalizeOptions(options);
        const shouldReduceMotion = motionQuery.matches;
        isStatic = shouldReduceMotion && base.reducedMotion === "static";
        settings = shouldReduceMotion && base.reducedMotion === "reduce" ? reduceMotion(base) : base;

        const { size, speed, opacity, colors, sway, rotation, parallax, seed } = settings;
        // Shapes are functions, which JSON can't compare, so the option itself is compared by reference.
        const look = JSON.stringify([size, speed, opacity, colors, sway, rotation, parallax, seed]);

        if (look !== rolledLook || options.shapes !== rolledShapes) {
            rolledLook = look;
            rolledShapes = options.shapes;
            resetSprites();
            // A new generator only here, so flakes added later continue the sequence instead of repeating it.
            random = seed === undefined ? Math.random : createRandom(seed);
            for (const flake of flakes) {
                rollFlake(flake, settings, random);
            }
        }

        refresh();
    }

    // A resolution query matches one exact ratio, so each change re-arms a query for the new one.
    function watchResolution(): void {
        resolutionQuery = matchMedia(`(resolution: ${devicePixelRatio}dppx)`);
        resolutionQuery.addEventListener("change", handleResolutionChange, { once: true });
    }

    function handleResolutionChange(): void {
        watchResolution();
        refresh();
    }

    function handleShapeReady(): void {
        if (!isDestroyed) {
            refresh();
        }
    }

    const resizeObserver = new ResizeObserver(refresh);
    const intersectionObserver = new IntersectionObserver((entries) => {
        isOffscreen = !entries.at(-1)?.isIntersecting;
        syncLoop();
    });

    resizeObserver.observe(canvas);
    intersectionObserver.observe(canvas);
    document.addEventListener("visibilitychange", syncLoop);
    motionQuery.addEventListener("change", applyOptions);
    watchResolution();
    applyOptions();

    return {
        canvas,
        start() {
            isStopped = false;
            syncLoop();
        },
        stop() {
            isStopped = true;
            syncLoop();
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
            syncLoop();
            resizeObserver.disconnect();
            intersectionObserver.disconnect();
            document.removeEventListener("visibilitychange", syncLoop);
            motionQuery.removeEventListener("change", applyOptions);
            resolutionQuery.removeEventListener("change", handleResolutionChange);
            clear();
            unmountCanvas();
        },
    };
}
