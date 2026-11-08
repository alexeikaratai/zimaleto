import type { Settings } from "../options/settings";
import type { Shape, WeightedShape } from "../shapes/shape";
import { between, type Random } from "./random";

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

const RADIANS_PER_DEGREE = Math.PI / 180;
const FULL_TURN = Math.PI * 2;

/** Picks a shape at random, each one as likely as its share of the total weight. */
export function pickShape(shapes: WeightedShape[], random: Random): Shape {
    const totalWeight = shapes.reduce((total, { weight }) => total + weight, 0);
    let remaining = random() * totalWeight;

    for (const { shape, weight } of shapes) {
        remaining -= weight;

        if (remaining < 0) {
            return shape;
        }
    }

    // Rounding can leave a sliver past the total weight, which goes to the last shape.
    return (shapes.at(-1) as WeightedShape).shape;
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
