"use client";

import { dot, Snowfall, text } from "@zimaleto/zima-react";
import type { ReactElement } from "react";

// text() and image() run on the client, so shapes like this one are created in a client component, once.
const SHAPES = [dot, { shape: text("❄"), weight: 0.5 }];

export function Snow(): ReactElement {
    return (
        <Snowfall
            fullscreen
            density={0.3}
            shapes={SHAPES}
        />
    );
}
