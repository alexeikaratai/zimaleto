import type { Shape } from "../shapes";

/** Returns a number in [0, 1). */
export type Random = () => number;

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

/** What a step moves the flakes through: the canvas size in CSS px, the wind, and where respawned flakes land. */
export type Environment = {
    width: number;
    height: number;
    wind: number;
    random: Random;
};
