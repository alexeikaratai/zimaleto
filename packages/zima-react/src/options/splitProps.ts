import { OPTION_NAMES } from "./constants";
import type { NamedValues } from "./types";

/** Splits props into the snowfall's options and the rest, which go to the canvas. */
export function splitProps(props: NamedValues): [options: NamedValues, canvasProps: NamedValues] {
    const options: NamedValues = {};
    const canvasProps: NamedValues = {};

    for (const [name, value] of Object.entries(props)) {
        if (Object.hasOwn(OPTION_NAMES, name)) {
            options[name] = value;
        } else {
            canvasProps[name] = value;
        }
    }

    return [options, canvasProps];
}
