import type { Settings } from "./options";
import { between, type Random } from "./random";
import type { Shape, WeightedShape } from "./shapes/shape";

/** One flake's state. Positions are in CSS px, angles in radians, speeds per second. */
export type Flake = {
    x: number;
    y: number;
    radius: number;
    speed: number;
    opacity: number;
    color: string;
    shape: Shape;
    swayAmplitude: number;
    swayFrequency: number;
    swayPhase: number;
    angle: number;
    spin: number;
};

export type Environment = {
    width: number;
    height: number;
    wind: number;
    random: Random;
};

/** Longest step the physics takes, so a stalled tab doesn't make flakes jump. */
export const MAX_STEP_MS = 50;

const RADIANS_PER_DEGREE = Math.PI / 180;
const FULL_TURN = Math.PI * 2;
const GUST_FREQUENCY = 0.5;

/** Picks a shape at random, each one as likely as its share of the total weight. */
export function pickShape(shapes: WeightedShape[], random: Random): Shape {
    let remaining = random() * shapes.reduce((total, { weight }) => total + weight, 0);
    // The last entry also catches the sliver that rounding can leave past the total.
    const picked = shapes.find(({ weight }, index) => {
        remaining -= weight;

        return remaining < 0 || index === shapes.length - 1;
    });

    return (picked as WeightedShape).shape;
}

/** Gives a flake a new size, speed, opacity, color, shape and motion from the settings, keeping its position. */
export function rollFlake(flake: Flake, settings: Settings, random: Random): Flake {
    const { colors, parallax } = settings;
    const depth = random();

    flake.radius = between(settings.size, depth);
    // With parallax, speed and opacity follow the size; without it, each one is random.
    flake.speed = between(settings.speed, parallax ? depth : random());
    flake.opacity = between(settings.opacity, parallax ? depth : random());
    flake.color = colors[Math.floor(random() * colors.length)] as string;
    flake.shape = pickShape(settings.shapes, random);
    flake.swayAmplitude = between(settings.sway, random());
    // 0.5 to 1.5 rad/s: one wobble every 4 to 12 seconds
    flake.swayFrequency = 0.5 + random();
    flake.spin = between(settings.rotation, random()) * RADIANS_PER_DEGREE;

    return flake;
}

/** Creates a flake at a random spot on the canvas, so the first frame looks like snow that has been falling for a while. */
export function spawnFlake(settings: Settings, random: Random, width: number, height: number): Flake {
    // rollFlake() fills in the rest.
    const position = {
        x: random() * width,
        y: random() * height,
        swayPhase: random() * FULL_TURN,
        angle: random() * FULL_TURN,
    };

    return rollFlake(position as Flake, settings, random);
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

/** Advances every flake, respawns the ones that fall out at the top, and wraps them sideways. */
export function step(flakes: Flake[], elapsedMs: number, environment: Environment): void {
    const seconds = Math.min(elapsedMs, MAX_STEP_MS) / 1000;
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
