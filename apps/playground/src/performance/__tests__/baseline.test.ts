import { describe, expect, test } from "vitest";
import { simulateBench } from "../../__tests__/support/simulatedBench";
import { runBaseline } from "../baseline";

// Twice the pixels per flake halve the capacity: 8,000 flakes at ratio 1 and 4,000 at ratio 2.
function frameRateAt(count: number, maxDpr: number): number {
    return count * maxDpr <= 8000 ? 100 : 50;
}

describe("runBaseline", () => {
    test("finds the capacity at pixel ratios 1 and 2", async () => {
        // Arrange
        const bench = simulateBench(frameRateAt);

        // Act
        const { capacities } = await runBaseline(bench);

        // Assert
        expect(capacities.map(({ maxDpr, count }) => [maxDpr, count])).toStrictEqual([
            [1, 8000],
            [2, 4000],
        ]);
    });

    test("measures 150, 1,000 and 5,000 flakes at pixel ratio 2", async () => {
        // Arrange
        const bench = simulateBench(frameRateAt);

        // Act
        const { loads } = await runBaseline(bench);

        // Assert: the simulated snow work reports the pixel ratio.
        expect(loads.map(({ count, frameRate, workMs }) => [count, frameRate, workMs])).toStrictEqual([
            [150, 100, 2],
            [1000, 100, 2],
            [5000, 50, 2],
        ]);
    });
});
