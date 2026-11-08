import type { Flake } from "./flake";
import type { Random } from "./random";

/** What a step moves the flakes through: the canvas size in CSS px, the wind, and where respawned flakes land. */
export type Environment = {
    width: number;
    height: number;
    wind: number;
    random: Random;
};

/** Longest step without an fps cap, so a stalled tab doesn't make flakes jump. */
const MAX_STEP_MS = 50;
const GUST_FREQUENCY = 0.5;

/**
 * How far a frame moves the snow: the time since the last frame, limited so that a stalled tab doesn't make flakes
 * jump. Under an fps cap (0 for none) the limit is two of its frames, so a low cap keeps whole frames and full speed.
 */
export function limitStep(elapsedMs: number, fps: number): number {
    const maxStepMs = fps > 0 ? Math.max(MAX_STEP_MS, 2000 / fps) : MAX_STEP_MS;

    return Math.min(elapsedMs, maxStepMs);
}

/** Smooth wind variation at a moment in time. It stays within `gust` and never quite repeats. */
export function gustAt(seconds: number, gust: number): number {
    // An irrational frequency ratio keeps the two waves from ever lining up again.
    const phase = seconds * GUST_FREQUENCY;

    return (gust * (Math.sin(phase) + Math.sin(phase * Math.SQRT2))) / 2;
}

/** How far a flake is drawn from its x because of its wobble. */
export function swayOffset(flake: Flake): number {
    return Math.sin(flake.swayPhase) * flake.swayAmplitude;
}

/** Advances every flake, respawns the ones that fall out at the bottom at the top, and wraps them sideways. */
export function step(flakes: Flake[], elapsedMs: number, environment: Environment): void {
    const seconds = elapsedMs / 1000;
    const { width, height, wind, random } = environment;

    for (const flake of flakes) {
        const margin = flake.radius + flake.swayAmplitude;

        flake.y += flake.speed * seconds;
        flake.x += wind * seconds;
        flake.swayPhase += flake.swayFrequency * seconds;
        flake.angle += flake.spin * seconds;

        if (flake.y > height + flake.radius) {
            flake.y = -flake.radius;
            flake.x = random() * width;
        }

        if (flake.x > width + margin) {
            flake.x -= width + margin * 2;
        } else if (flake.x < -margin) {
            flake.x += width + margin * 2;
        }
    }
}
