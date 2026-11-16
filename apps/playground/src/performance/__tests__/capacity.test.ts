import { describe, expect, test } from "vitest";
import { capacityOf, REFRESH_RATE, simulateBench } from "../../__tests__/support/simulatedBench";
import { findCapacity } from "../capacity";

describe("findCapacity", () => {
    test("measures the display's frame rate without flakes first", async () => {
        // Arrange
        const bench = simulateBench(capacityOf(1000));

        // Act
        const { refreshRate } = await findCapacity(bench);

        // Assert
        expect([bench.counts[0], refreshRate]).toStrictEqual([0, REFRESH_RATE]);
    });

    test("finds the capacity to within 10%", async () => {
        // Arrange
        const bench = simulateBench(capacityOf(13_000));

        // Act
        const { count, isAtLimit } = await findCapacity(bench);

        // Assert
        expect([count >= 11_700 && count <= 13_000, isAtLimit]).toStrictEqual([true, false]);
    });

    test("finds a capacity below its first count to within 25 flakes", async () => {
        // Arrange
        const bench = simulateBench(capacityOf(100));

        // Act
        const { count } = await findCapacity(bench);

        // Assert
        expect(count >= 75 && count <= 100).toBe(true);
    });

    test("stops at its limit when frames never drop", async () => {
        // Arrange
        const bench = simulateBench(() => REFRESH_RATE);

        // Act
        const capacity = await findCapacity(bench);

        // Assert
        expect(capacity).toMatchObject({ count: 64_000, isAtLimit: true });
    });

    test("counts a frame rate under 95% of the display's as dropping", async () => {
        // Arrange
        const bench = simulateBench((count) => (count <= 2000 ? REFRESH_RATE : REFRESH_RATE * 0.949));

        // Act
        const capacity = await findCapacity(bench);

        // Assert
        expect(capacity).toMatchObject({ count: 2000, isAtLimit: false });
    });

    test("tolerates a frame rate of 95% of the display's", async () => {
        // Arrange
        const bench = simulateBench((count) => (count <= 2000 ? REFRESH_RATE : REFRESH_RATE * 0.95));

        // Act
        const { isAtLimit } = await findCapacity(bench);

        // Assert
        expect(isAtLimit).toBe(true);
    });
});
