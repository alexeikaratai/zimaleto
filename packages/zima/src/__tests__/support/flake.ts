import type { Flake } from "../../physics/flake";
import { dot } from "../../shapes/dot";

/** A flake with plain values: radius 2 at (50, 50), falling at 40 px/s without sway or spin. */
export function createFlake(overrides: Partial<Flake> = {}): Flake {
    return {
        x: 50,
        y: 50,
        radius: 2,
        speed: 40,
        opacity: 1,
        color: "#fff",
        shape: dot,
        swayAmplitude: 0,
        swayFrequency: 1,
        swayPhase: 0,
        angle: 0,
        spin: 0,
        ...overrides,
    };
}
