import type { ReactElement } from "react";
import type { Baseline } from "../../performance";
import { formatCount, formatMs } from "./format";

export type BaselineTableProps = {
    baseline: Baseline;
};

/** The results of a baseline run: the capacity at each pixel ratio, then the frames at each flake count. */
export function BaselineTable({ baseline }: BaselineTableProps): ReactElement {
    const { capacities, loads } = baseline;
    const refreshRate = capacities[0]?.refreshRate ?? 0;

    return (
        <div className="baseline">
            <table>
                <caption>Capacity on a {Math.round(refreshRate)} Hz display</caption>
                <tbody>
                    {capacities.map(({ maxDpr, count, isAtLimit }) => (
                        <tr key={maxDpr}>
                            <th scope="row">Pixel ratio {maxDpr}</th>
                            <td>
                                {isAtLimit && "≥ "}
                                {formatCount(count)} flakes
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <table>
                <caption>Frames at pixel ratio 2</caption>
                <thead>
                    <tr>
                        <th scope="col">Flakes</th>
                        <th scope="col">fps</th>
                        <th scope="col">p95</th>
                        <th scope="col">Work</th>
                    </tr>
                </thead>
                <tbody>
                    {loads.map(({ count, frameRate, p95IntervalMs, workMs }) => (
                        <tr key={count}>
                            <th scope="row">{formatCount(count)}</th>
                            <td>{Math.round(frameRate)}</td>
                            <td>{formatMs(p95IntervalMs)}</td>
                            <td>{formatMs(workMs, 2)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
