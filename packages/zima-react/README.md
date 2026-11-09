# @zimaleto/zima-react

React 19 wrapper for [@zimaleto/zima](https://github.com/alexeikaratai/zimaleto/tree/main/packages/zima), a tiny canvas snowfall. It adds ≤ 650 B on top of the core.

[Live demo](https://alexeikaratai.github.io/zimaleto/) · [Next.js example](https://github.com/alexeikaratai/zimaleto/tree/main/examples/nextjs)

## Install

```sh
npm install @zimaleto/zima-react
```

The core comes with it, and this package re-exports its shapes and types.

## `<Snowfall>`

```tsx
import { crystal, Snowfall } from "@zimaleto/zima-react";

export function Hero() {
    return (
        <section style={{ position: "relative" }}>
            <h1>Let it snow</h1>
            <Snowfall
                density={0.5}
                shapes={[crystal]}
            />
        </section>
    );
}
```

- By default the canvas fills its parent, which needs a `position` other than `static`. `fullscreen` covers the viewport instead; render it near the app root, because an ancestor with a `transform` or `filter` would make it cover that ancestor.
- Props are every [core option](https://github.com/alexeikaratai/zimaleto/tree/main/packages/zima#options), plus `paused`, `fullscreen` and the attributes of a `<canvas>` such as `className`, `style` and `data-*`. `ref` points to the canvas.
- `paused` freezes the snow and keeps the last frame on screen.
- A prop change goes to the running snowfall, which is never re-created on re-render. Arrays and weighted shapes compare by value, but functions compare by identity, so define custom shapes outside your components.

## `useSnowfall()`

For a canvas, or any element, that you render yourself:

```tsx
import { useSnowfall } from "@zimaleto/zima-react";
import { useRef } from "react";

export function Banner({ isPaused }: { isPaused: boolean }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    useSnowfall(canvasRef, { density: 0.5, paused: isPaused });

    return (
        <canvas
            ref={canvasRef}
            style={{ width: "100%", height: 300 }}
        />
    );
}
```

The canvas needs a CSS size. The ref has to hold the element when the component mounts and keep the same one.

## Next.js and Server Components

The package is marked `"use client"`, so a Server Component can render `<Snowfall>` and pass it the built-in shapes. `text()`, `image()` and custom shapes are functions that run in the browser: create them in a client component, as the [Next.js example](https://github.com/alexeikaratai/zimaleto/tree/main/examples/nextjs) does.

## Testing your app

jsdom has no canvas, `matchMedia`, `ResizeObserver` or `IntersectionObserver`, so mock the package in component tests:

```ts
vi.mock("@zimaleto/zima-react", () => ({ Snowfall: () => null, useSnowfall: () => undefined }));
```

## License

[MIT](LICENSE)
